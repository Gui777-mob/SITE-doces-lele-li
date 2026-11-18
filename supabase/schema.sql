create table categories(id serial primary key,name text not null,slug text unique not null,sort_order int default 0);
create table products(id serial primary key,category_id int references categories,name text not null,description text,
 price numeric(10,2) not null,image_url text,available bool default true,featured bool default false,
 discount_group text check (discount_group in ('brigadeiro_tradicional','brigadeiro_gourmet')),
 options text[] default '{}',sort_order int default 0);
create table orders(id serial primary key,number serial,public_token uuid default gen_random_uuid() unique,customer_name text not null,phone text not null,
 payment_method text not null,delivery_type text not null,address jsonb,notes text,
 subtotal numeric(10,2),discount_total numeric(10,2),delivery_fee numeric(10,2) default 0,total numeric(10,2),
 status text default 'novo' check (status in ('novo','confirmado','em_producao','pronto','entregue','cancelado')),
 created_at timestamptz default now());
create table order_items(id serial primary key,order_id int references orders on delete cascade,product_id int references products on delete set null,
 product_name text,option text,quantity int check(quantity>0),unit_price numeric(10,2),line_total numeric(10,2));
create table admin_profiles(user_id uuid primary key references auth.users);
create table settings(key text primary key,value text);
insert into settings values('delivery_fee','0');

create or replace function discount_pct(q int) returns int language sql immutable as
$$ select case when q>=200 then 30 when q>=100 then 25 when q>=50 then 15 else 0 end $$;

-- Pedido criado só aqui: o preço vem do banco, nunca do navegador.
create or replace function create_order(p_customer text,p_phone text,p_payment text,p_delivery text,p_address jsonb,p_notes text,p_items jsonb)
returns uuid language plpgsql security definer as $$
declare oid int; tok uuid; fee numeric; sub numeric:=0; disc numeric:=0; r record; pct int; gross numeric; d numeric;
begin
 select value::numeric into fee from settings where key='delivery_fee';
 if p_delivery<>'entrega' then fee:=0; end if;
 insert into orders(customer_name,phone,payment_method,delivery_type,address,notes) values(p_customer,p_phone,p_payment,p_delivery,p_address,p_notes) returning id,public_token into oid,tok;
 for r in select p.id,p.name,p.price,p.discount_group g,(i->>'option') opt,(i->>'quantity')::int q,
   sum((i->>'quantity')::int) over (partition by p.discount_group) gq
   from jsonb_array_elements(p_items) i join products p on p.id=(i->>'product_id')::int and p.available loop
  pct:=case when r.g is null then 0 else discount_pct(r.gq::int) end;
  gross:=r.price*r.q; d:=round(gross*pct/100,2);
  insert into order_items(order_id,product_id,product_name,option,quantity,unit_price,line_total) values(oid,r.id,r.name,r.opt,r.q,r.price,gross-d);
  sub:=sub+gross; disc:=disc+d;
 end loop;
 if sub=0 then raise exception 'pedido vazio'; end if;
 update orders set subtotal=sub,discount_total=disc,delivery_fee=fee,total=sub-disc+fee where id=oid;
 return tok;
end $$;

alter table categories enable row level security; alter table products enable row level security;
alter table orders enable row level security; alter table order_items enable row level security;
create policy pub_cat on categories for select using(true);
create policy pub_prod on products for select using(available);
create function is_admin() returns bool language sql security definer as $$ select exists(select 1 from admin_profiles where user_id=auth.uid()) $$;
create policy adm_prod on products for all using(is_admin());
create policy adm_ord on orders for all using(is_admin());
create policy adm_items on order_items for all using(is_admin());
grant execute on function create_order to anon;

insert into categories(name,slug,sort_order) values('Pavês','paves',1),('Brigadeiros','brigadeiros',2),('Trufas','trufas',3),('Bombons','bombons',4);
insert into products(category_id,name,price,discount_group,options) values
(1,'Pavê tradicional',80,null,'{}'),(1,'Pavê c/ bolacha champanhe',90,null,'{}'),(1,'Pavê de Oreo',95,null,'{}'),
(1,'Pavê de Ninho trufado',95,null,'{}'),(1,'Pavê sonho de valsa',100,null,'{}'),(1,'Mini pavê pequeno (250g)',15,null,'{}'),(1,'Mini pavê médio',45,null,'{}'),
(2,'Brigadeiro tradicional (unidade)',2.00,'brigadeiro_tradicional','{Brigadeiro,Ninho,Beijinho,Casadinho}'),
(2,'Brigadeiro gourmet (unidade)',2.50,'brigadeiro_gourmet','{"Ninho c/ nutella",Amendoim,Café,Ovomaltine,Maracujá}'),
(2,'Caixa 4 brigadeiros tradicionais',12,null,'{}'),(2,'Caixa 4 brigadeiros gourmet',15,null,'{}'),(2,'Brigadeiros personalizados (kit 4)',20,null,'{}'),
(3,'Trufa tradicional',3.50,null,'{Brigadeiro,Ninho,Prestígio,Mousse}'),(3,'Trufa gourmet',4.50,null,'{"Brigadeiro com geleia","Ninho c/ nutella",Ovomaltine}'),
(4,'Bombom tradicional',12,null,'{"Uva","Morango"}'),(4,'Bombom cravejado',14,null,'{"Uva","Morango"}');

-- Confirmação: o cliente só lê o próprio pedido, por um token impossível de adivinhar.
create or replace function get_order(p_token uuid) returns jsonb language sql security definer as $$
 select to_jsonb(o) || jsonb_build_object('items',(select coalesce(jsonb_agg(to_jsonb(i) order by i.id),'[]') from order_items i where i.order_id=o.id))
 from orders o where o.public_token=p_token $$;
grant execute on function get_order to anon;
alter table settings enable row level security;
create policy pub_settings on settings for select using(true);

-- Destaques da home (a dona troca depois no painel)
update products set featured=true where name in ('Pavê de Oreo','Brigadeiro gourmet (unidade)','Bombom cravejado','Trufa gourmet');

-- Admin: cada admin lê a própria linha (usado pelo middleware); taxa de entrega; fotos
alter table admin_profiles enable row level security;
create policy own_profile on admin_profiles for select using(user_id=auth.uid());
create policy adm_settings on settings for all using(is_admin());
insert into storage.buckets(id,name,public) values('produtos','produtos',true);
create policy foto_admin on storage.objects for all using(bucket_id='produtos' and is_admin()) with check(bucket_id='produtos' and is_admin());
create policy foto_publica on storage.objects for select using(bucket_id='produtos');
-- Para criar a dona como admin: crie o usuário em Authentication > Users e rode:
-- insert into admin_profiles(user_id) select id from auth.users where email='EMAIL_DA_DONA';
