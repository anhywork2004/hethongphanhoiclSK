import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Turbopack (mặc định của Next.js 16) biên dịch import `.wasm?module` (Prisma dùng để nạp
// query compiler wasm cho runtime "workerd") thành 1 shim đọc file qua fs.createReadStream —
// giả định có filesystem thật, không chạy được trên Cloudflare Workers
// (`[unenv] fs.createReadStream is not implemented yet!`). Webpack thì giữ nguyên import
// dạng chuỗi tĩnh để plugin của OpenNext nhận diện và biến thành binding wasm thật của
// Workers, nên chỉ build cho Cloudflare bằng webpack (dev cục bộ vẫn dùng Turbopack).
const config = defineCloudflareConfig({});
config.buildCommand = "next build --webpack";

export default config;
