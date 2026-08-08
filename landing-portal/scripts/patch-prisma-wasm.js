// Prisma's generated client mặc định dùng WASM query compiler bản "fast" (~4.6MB base64 /
// ~3.5MB file .wasm thật), vượt quá giới hạn kích thước Cloudflare Worker. Đổi sang bản
// "small" (~1.7-2.3MB) để build cho Cloudflare vẫn đủ nhỏ. An toàn để chạy lại nhiều lần
// (idempotent).
const fs = require("fs");
const path = require("path");

// 1) Client "nodejs" thường (src/generated/prisma): base64 wasm nhúng trong .mjs, chỉ cần
//    đổi tên import trong class.ts sang biến thể "small".
const nodeClientFile = path.join(__dirname, "..", "src", "generated", "prisma", "internal", "class.ts");

if (fs.existsSync(nodeClientFile)) {
  const content = fs.readFileSync(nodeClientFile, "utf8");
  const patched = content.replaceAll("query_compiler_fast_bg", "query_compiler_small_bg");
  if (patched !== content) {
    fs.writeFileSync(nodeClientFile, patched);
    console.log("patch-prisma-wasm: đã đổi sang query_compiler_small_bg trong", nodeClientFile);
  } else {
    console.log("patch-prisma-wasm: (nodejs client) đã ở trạng thái small.");
  }
} else {
  console.warn("patch-prisma-wasm: không tìm thấy", nodeClientFile, "— bỏ qua (chạy `prisma generate` trước).");
}

// 2) Client "workerd" (src/generated/prisma-workerd): dùng file .wasm thật (không base64) —
//    file "small" không được `prisma generate` tự sinh ra, phải copy thủ công từ node_modules
//    (nơi Prisma CLI đóng gói sẵn cả 2 biến thể) rồi đổi tên import trong class.ts.
const workerdInternalDir = path.join(__dirname, "..", "src", "generated", "prisma-workerd", "internal");
const workerdClassFile = path.join(workerdInternalDir, "class.ts");

if (fs.existsSync(workerdClassFile)) {
  const smallWasmSrc = path.join(__dirname, "..", "node_modules", "prisma", "build", "query_compiler_small_bg.sqlite.wasm");
  const smallJsSrc = path.join(__dirname, "..", "node_modules", "prisma", "build", "query_compiler_small_bg.sqlite.mjs");

  if (!fs.existsSync(smallWasmSrc) || !fs.existsSync(smallJsSrc)) {
    console.warn("patch-prisma-wasm: không tìm thấy file 'small' nguồn trong node_modules/prisma/build — bỏ qua phần workerd.");
  } else {
    fs.copyFileSync(smallWasmSrc, path.join(workerdInternalDir, "query_compiler_small_bg.wasm"));
    fs.copyFileSync(smallJsSrc, path.join(workerdInternalDir, "query_compiler_small_bg.js"));

    const content = fs.readFileSync(workerdClassFile, "utf8");
    const patched = content.replaceAll("query_compiler_fast_bg", "query_compiler_small_bg");
    if (patched !== content) {
      fs.writeFileSync(workerdClassFile, patched);
      console.log("patch-prisma-wasm: đã đổi sang query_compiler_small_bg trong", workerdClassFile);
    } else {
      console.log("patch-prisma-wasm: (workerd client) đã ở trạng thái small.");
    }

    // Xoá file "fast" cũ để tránh nhầm lẫn/kéo theo bundle không cần thiết.
    for (const f of ["query_compiler_fast_bg.wasm", "query_compiler_fast_bg.js"]) {
      const p = path.join(workerdInternalDir, f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  }
} else {
  console.warn("patch-prisma-wasm: không tìm thấy", workerdClassFile, "— bỏ qua (chạy `prisma generate` trước).");
}
