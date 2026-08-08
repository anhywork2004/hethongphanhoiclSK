import { drizzle } from "drizzle-orm/d1";
import {
  factories,
  areas,
  departments,
  users,
  userRoles,
  issueCategories,
  partCategories,
  productSizes,
  systemSettings,
  homepageSettings,
} from "./schema";

export async function seedInitialData(d1: D1Database) {
  const db = drizzle(d1);
  const now = Math.floor(Date.now() / 1000);
  const defaultPasswordHash = "$2a$10$w09ZJ/gT6qH.b1E0xU1M6uP5jUv5a9m/W0X8q7QZ.q6"; // '123456'

  // 1. Seed Factory (Nhà máy Multi-tenant)
  const sampleFactories = [
    {
      id: "fac-tbs-kg1",
      code: "TBSSK1",
      name: "Nhà máy TBS Skechers Kiên Giang 1",
      address: "Khu Công nghiệp Thạnh Lộc, Châu Thành, Kiên Giang",
      isActive: 1,
      createdAt: now,
    },
  ];

  for (const fac of sampleFactories) {
    await db.insert(factories).values(fac).onConflictDoNothing().execute();
  }

  // 2. Seed Areas (Phân cấp Xưởng -> Tổ -> Chuyền)
  const sampleAreas = [
    // Xưởng (Workshops)
    { id: "ws-may-1", factoryId: "fac-tbs-kg1", parentId: null, type: "workshop", name: "Xưởng May 1", code: "XM1", order: 1, isActive: 1, createdAt: now },
    { id: "ws-go-1", factoryId: "fac-tbs-kg1", parentId: null, type: "workshop", name: "Xưởng Gò 1", code: "XGO1", order: 2, isActive: 1, createdAt: now },
    { id: "ws-de-1", factoryId: "fac-tbs-kg1", parentId: null, type: "workshop", name: "Xưởng Đế 1", code: "XDE1", order: 3, isActive: 1, createdAt: now },

    // Tổ (Teams)
    { id: "team-may-1", factoryId: "fac-tbs-kg1", parentId: "ws-may-1", type: "team", name: "Tổ May 1", code: "TM1", order: 1, isActive: 1, createdAt: now },
    { id: "team-may-2", factoryId: "fac-tbs-kg1", parentId: "ws-may-1", type: "team", name: "Tổ May 2", code: "TM2", order: 2, isActive: 1, createdAt: now },
    { id: "team-go-1", factoryId: "fac-tbs-kg1", parentId: "ws-go-1", type: "team", name: "Tổ Gò 1", code: "TGO1", order: 3, isActive: 1, createdAt: now },

    // Chuyền (Lines)
    { id: "line-may-1a", factoryId: "fac-tbs-kg1", parentId: "team-may-1", type: "line", name: "Chuyền May 1A", code: "CM1A", order: 1, isActive: 1, createdAt: now },
    { id: "line-may-1b", factoryId: "fac-tbs-kg1", parentId: "team-may-1", type: "line", name: "Chuyền May 1B", code: "CM1B", order: 2, isActive: 1, createdAt: now },
    { id: "line-may-2a", factoryId: "fac-tbs-kg1", parentId: "team-may-2", type: "line", name: "Chuyền May 2A", code: "CM2A", order: 3, isActive: 1, createdAt: now },
    { id: "line-go-1a", factoryId: "fac-tbs-kg1", parentId: "team-go-1", type: "line", name: "Chuyền Gò 1A", code: "CG1A", order: 4, isActive: 1, createdAt: now },
  ];

  for (const area of sampleAreas) {
    await db.insert(areas).values(area).onConflictDoNothing().execute();
  }

  // 3. Seed Departments (Phòng ban linh hoạt)
  const sampleDepts = [
    { id: "dept-bao-tri", factoryId: "fac-tbs-kg1", name: "Phòng Bảo Trì", code: "PBT", description: "Sửa chữa, hiệu chuẩn và bảo dưỡng thiết bị máy móc", isActive: 1, createdAt: now },
    { id: "dept-cong-nghe", factoryId: "fac-tbs-kg1", name: "Phòng Công Nghệ", code: "PCN", description: "Nghiên cứu quy trình, thông số kỹ thuật và SOP", isActive: 1, createdAt: now },
    { id: "dept-qa", factoryId: "fac-tbs-kg1", name: "Phòng Quản Lý Chất Lượng QA", code: "PQA", description: "Kiểm soát chất lượng, 5M+1E và tiêu chuẩn sản phẩm", isActive: 1, createdAt: now },
    { id: "dept-ky-thuat", factoryId: "fac-tbs-kg1", name: "Phòng Kỹ Thuật", code: "PKT", description: "Hỗ trợ kỹ thuật dây chuyền sản xuất", isActive: 1, createdAt: now },
    { id: "dept-giam-doc", factoryId: "fac-tbs-kg1", name: "Ban Giám Đốc", code: "BGD", description: "Điều hành toàn nhà máy và xử lý sự cố Phase 2", isActive: 1, createdAt: now },
  ];

  for (const dept of sampleDepts) {
    await db.insert(departments).values(dept).onConflictDoNothing().execute();
  }

  // 4. Seed Issue Categories (Danh mục lỗi - Admin)
  const sampleIssueCategories = [
    { id: "cat-ho-keo", factoryId: "fac-tbs-kg1", name: "Hở keo gót đế", code: "ERR-01", description: "Lỗi kết dính giữa quai và đế giày", order: 1, isActive: 1, createdAt: now },
    { id: "cat-lech-chi", factoryId: "fac-tbs-kg1", name: "Quai may lệch chỉ", code: "ERR-02", description: "Đường may mũi quai bị lệch quá 2mm", order: 2, isActive: 1, createdAt: now },
    { id: "cat-bavia", factoryId: "fac-tbs-kg1", name: "Lệch kích thước / Bavia đế", code: "ERR-03", description: "Đế đúc cao su bị dư bavia hoặc sai số kích thước", order: 3, isActive: 1, createdAt: now },
    { id: "cat-xo-day", factoryId: "fac-tbs-kg1", name: "Lỗ xỏ dây biến dạng", code: "ERR-04", description: "Dập khoen lỗ xỏ dây bị méo", order: 4, isActive: 1, createdAt: now },
    { id: "cat-o-mau", factoryId: "fac-tbs-kg1", name: "Ố màu nguyên liệu da", code: "ERR-05", description: "Phụ liệu da dệt bị loang màu hoặc ẩm mốc", order: 5, isActive: 1, createdAt: now },
  ];

  for (const cat of sampleIssueCategories) {
    await db.insert(issueCategories).values(cat).onConflictDoNothing().execute();
  }

  // 5. Seed Part Categories (Linh kiện thay thế - Admin)
  const samplePartCategories = [
    { id: "part-van-smc", factoryId: "fac-tbs-kg1", name: "Van xả khí nén SMC 6 bar", code: "LK-SMC-01", unit: "Cái", inStock: 50, isActive: 1, createdAt: now },
    { id: "part-dien-tro", factoryId: "fac-tbs-kg1", name: "Điện trở sấy nhiệt ép 600W", code: "LK-DTR-02", unit: "Thanh", inStock: 30, isActive: 1, createdAt: now },
    { id: "part-kim-may", factoryId: "fac-tbs-kg1", name: "Kim may công nghiệp Groz-Beckert #14", code: "LK-KIM-03", unit: "Hộp (10 cái)", inStock: 120, isActive: 1, createdAt: now },
    { id: "part-curoa", factoryId: "fac-tbs-kg1", name: "Dây curoa chuyền băng tải Optibelt", code: "LK-CR-04", unit: "Sợi", inStock: 45, isActive: 1, createdAt: now },
    { id: "part-cam-bien", factoryId: "fac-tbs-kg1", name: "Cảm biến quang Omron E3Z", code: "LK-CB-05", unit: "Cái", inStock: 25, isActive: 1, createdAt: now },
    { id: "part-xy-lanh", factoryId: "fac-tbs-kg1", name: "Xy lanh ép khí nén Festo DSNU", code: "LK-XL-06", unit: "Cái", inStock: 15, isActive: 1, createdAt: now },
  ];

  for (const part of samplePartCategories) {
    await db.insert(partCategories).values(part).onConflictDoNothing().execute();
  }

  // 6. Seed Product Sizes
  const sampleSizes = [
    { id: "sz-us6", name: "US 6" },
    { id: "sz-us7", name: "US 7" },
    { id: "sz-us8", name: "US 8" },
    { id: "sz-us9", name: "US 9" },
    { id: "sz-us10", name: "US 10" },
    { id: "sz-us11", name: "US 11" },
  ];

  for (const sz of sampleSizes) {
    await db.insert(productSizes).values(sz).onConflictDoNothing().execute();
  }

  // 7. Seed 8 Test Users (Password: '123456')
  const sampleUsers = [
    {
      id: "usr-admin",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-ky-thuat",
      areaId: "ws-may-1",
      mnv: "ADMIN01",
      fullName: "Quản Trị Viên TBS",
      phone: "0901000000",
      position: "Quản Trị Hệ Thống",
      passwordHash: defaultPasswordHash,
      role: "admin" as const,
      isActive: 1,
      createdAt: now,
    },
    {
      id: "usr-worker",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-ky-thuat",
      areaId: "ws-may-1",
      mnv: "NV001",
      fullName: "Nguyễn Văn An",
      phone: "0901000001",
      position: "Cán Bộ Sản Xuất / Chuyền May 1A",
      passwordHash: defaultPasswordHash,
      role: "worker" as const,
      isActive: 1,
      createdAt: now,
    },
    {
      id: "usr-qa",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-qa",
      areaId: "ws-may-1",
      mnv: "QA001",
      fullName: "Lê Thị Cúc",
      phone: "0901000002",
      position: "Chuyên Viên QA Xưởng May 1",
      passwordHash: defaultPasswordHash,
      role: "qa" as const,
      isActive: 1,
      createdAt: now,
    },
    {
      id: "usr-lineleader",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-ky-thuat",
      areaId: "ws-may-1",
      mnv: "TL001",
      fullName: "Trần Văn Bình",
      phone: "0901000003",
      position: "Line Leader / Trưởng Line May 1A",
      passwordHash: defaultPasswordHash,
      role: "line_leader" as const,
      isActive: 1,
      createdAt: now,
    },
    {
      id: "usr-tech",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-cong-nghe",
      areaId: "ws-may-1",
      mnv: "CN001",
      fullName: "Phạm Văn Dũng",
      phone: "0901000004",
      position: "Kỹ Sư Công Nghệ Xưởng May 1",
      passwordHash: defaultPasswordHash,
      role: "technology" as const,
      isActive: 1,
      createdAt: now,
    },
    {
      id: "usr-depthead",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-bao-tri",
      areaId: "ws-may-1",
      mnv: "TP001",
      fullName: "Hoàng Văn Giang",
      phone: "0901000005",
      position: "Trưởng Phòng Bảo Trì & Thiết Bị",
      passwordHash: defaultPasswordHash,
      role: "dept_head" as const,
      isActive: 1,
      createdAt: now,
    },
    {
      id: "usr-handler",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-bao-tri",
      areaId: "ws-may-1",
      mnv: "KT001",
      fullName: "Đỗ Văn Hùng",
      phone: "0901000006",
      position: "Kỹ Thuật Viên Bảo Trì Xưởng May 1",
      passwordHash: defaultPasswordHash,
      role: "handler" as const,
      isActive: 1,
      createdAt: now,
    },
    {
      id: "usr-director",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-giam-doc",
      areaId: "ws-may-1",
      mnv: "GD001",
      fullName: "Vũ Thị Mai",
      phone: "0901000007",
      position: "Giám Đốc Phân Xưởng May",
      passwordHash: defaultPasswordHash,
      role: "director" as const,
      isActive: 1,
      createdAt: now,
    },
    {
      id: "usr-gdirector",
      factoryId: "fac-tbs-kg1",
      departmentId: "dept-giam-doc",
      areaId: "ws-may-1",
      mnv: "TGD001",
      fullName: "Trịnh Xuân Hùng",
      phone: "0901000008",
      position: "Tổng Giám Đốc Nhà Máy TBS Kiên Giang",
      passwordHash: defaultPasswordHash,
      role: "general_director" as const,
      isActive: 1,
      createdAt: now,
    },
  ];

  for (const u of sampleUsers) {
    await db.insert(users).values(u).onConflictDoNothing().execute();
    await db
      .insert(userRoles)
      .values({
        id: `ur-${u.id}`,
        userId: u.id,
        role: u.role,
      })
      .onConflictDoNothing()
      .execute();
  }

  // 8. Seed System & Homepage Settings
  await db
    .insert(systemSettings)
    .values({
      id: "main",
      form15TimeoutMinutes: 15,
      minMonitoringHours: 3,
      maxMonitoringHours: 48,
      zaloEnabled: 0,
      emailEnabled: 0,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .execute();

  await db
    .insert(homepageSettings)
    .values({
      id: "main",
      heroTitle: "Hệ Thống Phản Hồi Sự Cố Chất Lượng (HTPH-CLSK)",
      heroSubtitle: "2-Hour Fast Feedback Loop • Tiêu Chuẩn 5M+1E Toàn Cầu",
      bannerImageUrl: "/login-bg.png",
      announcementTicker: "Nhà máy TBS Skechers Kiên Giang 1 kích hoạt hệ thống phản hồi nhanh 15 phút.",
      updatedAt: now,
    })
    .onConflictDoNothing()
    .execute();

  return { success: true, count: sampleUsers.length };
}
