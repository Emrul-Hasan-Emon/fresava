-- Prices are paisa. Weight defaults to the reference catalog (340g), pending owner confirmation.
insert into public.products(sku,name,blurb,jars,jar_weight_g,price,compare_at,badge) values
 ('single','Signature Jar','Simple mornings, made sweeter with every spoonful.',1,340,49500,null,null),
 ('duo','The Pair','Share the sweetness, or keep it all to yourself.',2,340,94000,99000,'Most loved'),
 ('family','Family Box','Breakfast, brunch, dessert, and everything in between.',4,340,179000,198000,'Best value') on conflict(sku) do nothing;
insert into public.shipping_zones values('dhaka','Inside Dhaka',7000,150000,'24–48 hours',true),('outside','Outside Dhaka',13000,150000,'3–5 working days',true) on conflict(code) do nothing;
insert into public.promotions(code,basis_points,cap) values('FRESAVA10',1000,25000) on conflict(code) do nothing;
