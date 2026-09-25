import {test} from "node:test";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {once} from "node:events";
import {signAccessToken} from "../modules/auth/jwt";
import {dispatch} from "../http/router";

test("HTTP authorization integrates JWT verification, entity checks and revoked sessions",async()=>{
 const jwtSecretText="fixture-jwt-secret-fixture-jwt-secret-32";
 const jwtSecret=new TextEncoder().encode(jwtSecretText);
 let revoked=false;let active=true;
 const authId="00000000-0000-4000-8000-000000000001",entityId="00000000-0000-4000-8000-000000000002";
 const fake=createServer((req,res)=>{
  const path=new URL(req.url!,"http://localhost").pathname;res.setHeader("Content-Type","application/json");
  if(path.endsWith("/staff_members"))return res.end(JSON.stringify({id:entityId,auth_user_id:authId,active,full_name:"Test Admin",role:"admin"}));
  if(path.endsWith("/customers"))return res.end("null");
  if(path.endsWith("/revoked_auth_sessions"))return res.end(JSON.stringify(revoked?{session_id:"test-session"}:null));
  if(path.endsWith("/consume_rate_limit"))return res.end("true");
  if(path.endsWith("/dashboard"))return res.end(JSON.stringify({order_count:2}));
  if(path.endsWith("/token"))return res.end(JSON.stringify({access_token:"opaque-supabase-token",refresh_token:"fixture-refresh",token_type:"bearer",expires_in:900,user:{id:authId,email:"admin@example.invalid"}}));
  if(path.endsWith("/logout"))return res.end("{}");
  res.statusCode=404;res.end(JSON.stringify({message:"Not mocked: "+path}));
 });
 fake.listen(0,"127.0.0.1");await once(fake,"listening");const address=fake.address();assert.ok(address&&typeof address!=="string");const issuer=`http://127.0.0.1:${address.port}`;
 process.env.APP_URL="https://fresava.test";process.env.SUPABASE_URL=issuer;process.env.SUPABASE_PUBLISHABLE_KEY="fixture-public";process.env.SUPABASE_SECRET_KEY="fixture-secret";process.env.APP_JWT_SECRET=jwtSecretText;
 const token=async(kind:string,role?:string)=>signAccessToken({sub:authId,sessionId:"test-session",accountType:kind as never,entityId,...(role?{role:role as never}:{})},jwtSecret,"15m");
 try{
 const sessionToken=await token("staff_member","admin");
 const get=(cookie?:string,path="admin/dashboard")=>dispatch(new Request(`https://fresava.test/api/v1/${path}`,{headers:cookie?{cookie}:{}}));
 assert.equal((await get()).status,401);
 assert.equal((await get("fresava_staff_member_access=forged")).status,401);
 assert.equal((await get(`fresava_staff_member_access=${await token("customer")}`)).status,403);
 const authorized=await get(`fresava_staff_member_access=${sessionToken}`);assert.equal(authorized.status,200);assert.equal((await authorized.json()).order_count,2);
 assert.equal((await get(`fresava_staff_member_access=${sessionToken}`,"staff/orders/00000000-0000-4000-8000-000000000003")).status,403);
 revoked=true;assert.equal((await get(`fresava_staff_member_access=${sessionToken}`)).status,401);revoked=false;
 active=false;assert.equal((await get(`fresava_staff_member_access=${sessionToken}`)).status,403);active=true;
 const login=await dispatch(new Request("https://fresava.test/api/v1/admin/auth/login",{method:"POST",headers:{origin:"https://fresava.test","content-type":"application/json"},body:JSON.stringify({email:"admin@example.invalid",password:"fixture-password"})}));
 assert.equal(login.status,200);assert.match(login.headers.get("set-cookie")!,/HttpOnly/);assert.deepEqual(await login.json(),{ok:true});
 const crossOrigin=await dispatch(new Request("https://fresava.test/api/v1/admin/auth/login",{method:"POST",headers:{origin:"https://evil.test"},body:"{}"}));assert.equal(crossOrigin.status,403);
 }finally{fake.closeAllConnections();await new Promise<void>((resolve,reject)=>fake.close(error=>error?reject(error):resolve()));}
});
