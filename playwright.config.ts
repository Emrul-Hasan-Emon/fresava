import {defineConfig} from "@playwright/test";
export default defineConfig({testDir:"./tests/e2e",workers:1,timeout:60000,use:{baseURL:process.env.E2E_URL??"http://localhost:3100",headless:true,trace:"retain-on-failure"},webServer:{command:"node node_modules/next/dist/bin/next dev --port 3100",url:"http://localhost:3100",reuseExistingServer:true,timeout:120000}});
