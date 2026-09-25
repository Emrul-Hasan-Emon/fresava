import {test,expect} from "@playwright/test";
const orderId="00000000-0000-4000-8000-000000000009";
const detail={order:{id:orderId,order_number:"FRV00000001",tracking_code:"FRT1234567890",customer_name:"Test Customer",phone:"01700000000",email:null,address:"Test road",city:"Dhaka",notes:null,subtotal:49500,discount:0,shipping:7000,total:56500,status:"order_confirmed",version:0,payment_status:"unpaid",payment_method:"cod",created_at:new Date().toISOString(),eta:"24–48 hours"},items:[{id:"i",sku:"single",product_name:"Signature Jar",quantity:1,unit_price:49500,subtotal:49500,jars:1,jar_weight_g:340}],history:[{id:"h",to_status:"order_confirmed",created_at:new Date().toISOString()}],feedback:null};
test("admin and staff routes have separate login gates",async({page})=>{
 await page.goto("/admin/dashboard");await expect(page).toHaveURL(/\/admin\/login/);await expect(page.getByText("admin account")).toBeVisible();await expect(page.getByRole("button",{name:"Order Now"})).toHaveCount(0);
 await page.goto("/staff/scan");await expect(page).toHaveURL(/\/staff\/login/);await expect(page.getByText("staff account")).toBeVisible();await expect(page.getByText("Create a customer account")).toHaveCount(0);
});
test("guest checkout persists cart and uses API quote/confirmation (network fixture)",async({page})=>{
 const calls:string[]=[];
 await page.route("**/api/v1/**",async route=>{const path=new URL(route.request().url()).pathname;
 if(path.endsWith("/checkout/quote"))return route.fulfill({json:{subtotal:49500,discount:0,shipping:7000,total:56500,currency:"BDT",eta:"24–48 hours",lines:[{sku:"single",name:"Signature Jar",quantity:1,unit_price:49500,subtotal:49500,jars:1,jar_weight_g:340}]}});
 if(path.endsWith("/customers/guest-session")){calls.push("guest");return route.fulfill({json:{ok:true}});}
 if(path.endsWith("/orders")&&route.request().method()==="POST"){calls.push("order");const input=route.request().postDataJSON();expect(input.quote.lines).toEqual([{sku:"single",quantity:1}]);expect(input).not.toHaveProperty("total");expect(input.idempotency_key).toBeTruthy();return route.fulfill({json:detail,status:201});}
 return route.fulfill({status:503,json:{error:"Fixture: not configured"}});
 });
 await page.goto("/spread");await page.getByRole("button",{name:/Add a Jar/}).click();await expect(page.getByRole("dialog",{name:"Shopping bag"})).toBeVisible();await page.getByRole("button",{name:"Close bag"}).click();await page.reload();await page.goto("/checkout");
 await page.getByLabel("Full name",{exact:true}).fill("Test Customer");await page.getByLabel("Phone",{exact:true}).fill("01700000000");await page.getByLabel("Street address").fill("Test road");await expect(page.getByRole("button",{name:"Confirm COD order"})).toBeEnabled();await page.getByRole("button",{name:"Confirm COD order"}).click();await expect(page.getByRole("heading",{name:"Your order is confirmed."})).toBeVisible();await expect(page.getByText("FRT1234567890")).toBeVisible();expect(calls).toEqual(["guest","order"]);
});
test("customer tracking and delivered feedback (network fixture)",async({page})=>{
 let submitted=false;
 await page.route("**/api/v1/**",async route=>{const path=new URL(route.request().url()).pathname;
 if(path.endsWith(`/orders/${orderId}/feedback`)){expect(route.request().postDataJSON()).toEqual({rating:5,feedback:"Loved it"});submitted=true;return route.fulfill({json:{ok:true}});}
 if(path.endsWith(`/orders/${orderId}`))return route.fulfill({json:{...detail,order:{...detail.order,status:"delivered",version:7},feedback:submitted?{rating:5,feedback:"Loved it"}:null}});
 return route.fulfill({status:503,json:{error:"Fixture: not configured"}});});
 await page.goto(`/orders/${orderId}`);await expect(page.getByText("Fulfillment journey")).toBeVisible();await page.getByLabel("Rating").selectOption("5");await page.getByLabel("Your feedback").fill("Loved it");await page.getByRole("button",{name:"Submit feedback"}).click();await expect(page.getByText("5/5 — Loved it")).toBeVisible();
});
test("mobile storefront remains within viewport and reduced-motion video is paused",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/");await expect(page.getByRole("heading",{name:/Dragon Fruit,/})).toBeVisible();await expect(page.getByRole("button",{name:"Play animation"})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.goto("/auth");await expect(page.getByRole("heading",{name:"Welcome back"})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
