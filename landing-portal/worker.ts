// Entry point tuỳ chỉnh cho Cloudflare Worker — bọc lại worker do OpenNext build ra
// (.open-next/worker.js) để thêm 1 Cron Trigger (`scheduled`) chạy định kỳ, dùng cho việc
// gửi lại cảnh báo sự cố chưa ai nhận + nhắc xác nhận hoàn thành công việc.
// Next.js/OpenNext không hỗ trợ sẵn "scheduled" nên phải tự ghép ở đây; wrangler.jsonc trỏ
// "main" vào file này thay vì thẳng vào .open-next/worker.js.
// @ts-ignore: chỉ tồn tại sau khi chạy `npm run cf:build`
import openNextWorker, { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
import type { D1Database, ExecutionContext, ScheduledController } from "@cloudflare/workers-types";
import { runIncidentReminderSweep } from "./src/lib/reminder-sweep";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge };

export default {
  fetch: openNextWorker.fetch,
  async scheduled(_event: ScheduledController, env: { DB?: D1Database }, ctx: ExecutionContext) {
    ctx.waitUntil(runIncidentReminderSweep(env));
  },
};
