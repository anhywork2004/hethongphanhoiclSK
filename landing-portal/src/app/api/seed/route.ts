import { NextResponse } from "next/server";
import { users, sizes, workshops, zaloGroupMembers } from "@/db/schema";
import bcrypt from "bcryptjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

export async function POST() {
  try {
    let d1: D1Database | undefined;
    try {
      const ctx = await getCloudflareContext({ async: true });
      d1 = (ctx.env as unknown as CloudflareEnv).DB;
    } catch {
      // fallback
    }

    if (!d1) {
      return NextResponse.json({ error: "D1 database binding not found" }, { status: 500 });
    }

    // Initialize tables if not existing
    await d1.batch([
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          mnv TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          position TEXT NOT NULL,
          department TEXT NOT NULL,
          role TEXT NOT NULL,
          zalo_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS sizes (
          id TEXT PRIMARY KEY,
          size_code TEXT NOT NULL UNIQUE,
          size_name TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS workshops (
          id TEXT PRIMARY KEY,
          workshop_code TEXT NOT NULL UNIQUE,
          workshop_name TEXT NOT NULL,
          description TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS issues (
          id TEXT PRIMARY KEY,
          issue_code TEXT NOT NULL UNIQUE,
          product_code TEXT NOT NULL,
          product_name TEXT NOT NULL,
          affected_sizes TEXT NOT NULL,
          workshop_id TEXT,
          workshop_name TEXT,
          detection_stage TEXT NOT NULL,
          description TEXT NOT NULL,
          severity TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'cho_xu_ly',
          created_by_mnv TEXT NOT NULL,
          created_by_name TEXT NOT NULL,
          created_at TEXT NOT NULL,
          assigned_notify_roles TEXT,
          root_cause_data TEXT,
          assigned_technician_id TEXT,
          resolved_at TEXT,
          monitoring_deadline TEXT
        );
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS issue_images (
          id TEXT PRIMARY KEY,
          issue_id TEXT NOT NULL,
          image_url TEXT NOT NULL,
          r2_key TEXT,
          created_at TEXT NOT NULL
        );
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS zalo_group_members (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          group_type TEXT NOT NULL,
          workshop_id TEXT,
          created_at TEXT NOT NULL
        );
      `),
      d1.prepare(`
        CREATE TABLE IF NOT EXISTS zalo_notification_log (
          id TEXT PRIMARY KEY,
          issue_id TEXT NOT NULL,
          user_id TEXT,
          group_type TEXT NOT NULL,
          status TEXT NOT NULL,
          error_message TEXT,
          sent_at TEXT NOT NULL
        );
      `),
    ]);

    const db = drizzle(d1);
    const now = new Date().toISOString();
    const defaultPasswordHash = await bcrypt.hash("123456", 10);

    // Seed default users
    const seedUsers = [
      { id: "u_1", mnv: "NV001", passwordHash: defaultPasswordHash, fullName: "Nguyễn Văn An", position: "Cán bộ sản xuất", department: "Chuyền Chặt 1", role: "reporter" as const, zaloId: "ZALO_NV001", createdAt: now, updatedAt: now },
      { id: "u_2", mnv: "TL001", passwordHash: defaultPasswordHash, fullName: "Trần Thị Bình", position: "Trưởng Line May", department: "Chuyền May 2", role: "truong_line" as const, zaloId: "ZALO_TL001", createdAt: now, updatedAt: now },
      { id: "u_3", mnv: "TT001", passwordHash: defaultPasswordHash, fullName: "Lê Văn Cường", position: "Tổ trưởng Tổ Đồ", department: "Chuyền Đế 1", role: "to_truong" as const, zaloId: "ZALO_TT001", createdAt: now, updatedAt: now },
      { id: "u_4", mnv: "QA001", passwordHash: defaultPasswordHash, fullName: "Phạm Minh Dung", position: "Chuyên viên QA", department: "Phòng QA/QC", role: "qa" as const, zaloId: "ZALO_QA001", createdAt: now, updatedAt: now },
      { id: "u_5", mnv: "CN001", passwordHash: defaultPasswordHash, fullName: "Hoàng Văn Em", position: "Kỹ sư Công nghệ", department: "Phòng Kỹ thuật - Công nghệ", role: "cong_nghe" as const, zaloId: "ZALO_CN001", createdAt: now, updatedAt: now },
      { id: "u_6", mnv: "TP001", passwordHash: defaultPasswordHash, fullName: "Đỗ Thị Phương", position: "Trưởng phòng Sản xuất", department: "Phòng Quản lý Sản xuất", role: "truong_phong_ban" as const, zaloId: "ZALO_TP001", createdAt: now, updatedAt: now },
      { id: "u_7", mnv: "KT001", passwordHash: defaultPasswordHash, fullName: "Ngô Văn Giang", position: "Kỹ thuật viên Bảo trì", department: "Bộ phận Bảo trì MMTB", role: "nguoi_xu_ly" as const, zaloId: "ZALO_KT001", createdAt: now, updatedAt: now },
      { id: "u_8", mnv: "GD001", passwordHash: defaultPasswordHash, fullName: "Vũ Đình Hải", position: "Giám đốc Phân xưởng", department: "Ban Giám đốc Kiên Giang 1", role: "giam_doc" as const, zaloId: "ZALO_GD001", createdAt: now, updatedAt: now },
      { id: "u_9", mnv: "TGD001", passwordHash: defaultPasswordHash, fullName: "Trịnh Xuân Hùng", position: "Tổng Giám Đốc", department: "Ban Tổng Giám Đốc", role: "tong_giam_doc" as const, zaloId: "ZALO_TGD001", createdAt: now, updatedAt: now },
      { id: "u_10", mnv: "ADMIN001", passwordHash: defaultPasswordHash, fullName: "Quản Trị Viên", position: "Quản trị Hệ thống", department: "Phòng IT", role: "admin" as const, zaloId: "ZALO_ADMIN001", createdAt: now, updatedAt: now },
    ];

    for (const u of seedUsers) {
      await db.insert(users).values(u).onConflictDoNothing().execute();
    }

    // Seed default sizes
    const defaultSizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"].map((sz) => ({
      id: `sz_${sz}`,
      sizeCode: sz,
      sizeName: `Size ${sz}`,
      isActive: true,
      createdAt: now,
    }));

    for (const sz of defaultSizes) {
      await db.insert(sizes).values(sz).onConflictDoNothing().execute();
    }

    // Seed default workshops
    const defaultWorkshops = [
      { id: "ws_1", workshopCode: "PX01", workshopName: "Phân xưởng Chặt & Chuẩn bị", description: "Công đoạn cắt chặt da/vải", isActive: true, createdAt: now },
      { id: "ws_2", workshopCode: "PX02", workshopName: "Phân xưởng May 1", description: "Công đoạn may quai giày", isActive: true, createdAt: now },
      { id: "ws_3", workshopCode: "PX03", workshopName: "Phân xưởng May 2", description: "Chuyền may quai cao cấp", isActive: true, createdAt: now },
      { id: "ws_4", workshopCode: "PX04", workshopName: "Phân xưởng Gò & Đế", description: "Lắp ráp đế và gò thành hình", isActive: true, createdAt: now },
      { id: "ws_5", workshopCode: "PX05", workshopName: "Phân xưởng Hoàn thiện & Đóng gói", description: "Kiểm tra chất lượng và bao gói", isActive: true, createdAt: now },
    ];

    for (const ws of defaultWorkshops) {
      await db.insert(workshops).values(ws).onConflictDoNothing().execute();
    }

    // Seed default Zalo group members
    const defaultGroupMembers = [
      // Group 1: Trực tiếp xử lý (Phân xưởng Chặt & Chuẩn bị - ws_1)
      { id: "zgm_1", userId: "u_2", groupType: "truc_tiep_xu_ly" as const, workshopId: "ws_1", createdAt: now },
      { id: "zgm_2", userId: "u_3", groupType: "truc_tiep_xu_ly" as const, workshopId: "ws_1", createdAt: now },
      { id: "zgm_3", userId: "u_4", groupType: "truc_tiep_xu_ly" as const, workshopId: "ws_1", createdAt: now },
      { id: "zgm_4", userId: "u_5", groupType: "truc_tiep_xu_ly" as const, workshopId: "ws_1", createdAt: now },
      // Group 2: Tiếp nhận đưa giải pháp xử lý
      { id: "zgm_5", userId: "u_6", groupType: "dua_giai_phap" as const, workshopId: null, createdAt: now },
      // Group 3: Tiếp nhận thông tin (Ban Giám Đốc)
      { id: "zgm_6", userId: "u_8", groupType: "tiep_nhan_thong_tin" as const, workshopId: null, createdAt: now },
      { id: "zgm_7", userId: "u_9", groupType: "tiep_nhan_thong_tin" as const, workshopId: null, createdAt: now },
    ];

    for (const gm of defaultGroupMembers) {
      await db.insert(zaloGroupMembers).values(gm).onConflictDoNothing().execute();
    }

    return NextResponse.json({
      success: true,
      message: "Database tables initialized and seed data populated successfully.",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

