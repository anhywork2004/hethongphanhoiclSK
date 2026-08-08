import { drizzle } from "drizzle-orm/d1";
import { employees, userRoles, workshops, productSizes, departments } from "./schema";

export async function seedInitialData(d1: D1Database) {
  const db = drizzle(d1);
  const now = Math.floor(Date.now() / 1000);

  // 1. Seed Workshops
  const sampleWorkshops = [
    { id: "ws-may-1", name: "Xưởng may 1", code: "XM1", isActive: 1 },
    { id: "ws-may-2", name: "Xưởng may 2", code: "XM2", isActive: 1 },
    { id: "ws-[#go]", name: "Xưởng gò", code: "XGO", isActive: 1 },
    { id: "ws-de", name: "Xưởng đế", code: "XDE", isActive: 1 },
    { id: "ws-hoan-thien", name: "Xưởng hoàn thiện", code: "XHT", isActive: 1 },
  ];

  for (const ws of sampleWorkshops) {
    await db.insert(workshops).values(ws).onConflictDoNothing().execute();
  }

  // 2. Seed Product Sizes
  const sampleSizes = [
    { id: "sz-us6", name: "US 6" },
    { id: "sz-us7", name: "US 7" },
    { id: "sz-us8", name: "US 8" },
    { id: "sz-us9", name: "US 9" },
    { id: "sz-us10", name: "US 10" },
  ];

  for (const sz of sampleSizes) {
    await db.insert(productSizes).values(sz).onConflictDoNothing().execute();
  }

  // 3. Seed Departments
  const sampleDepts = [
    { id: "dept-ky-thuat", name: "Phòng Kỹ Thuật", code: "PKT", isActive: 1 },
    { id: "dept-qa", name: "Phòng QA", code: "PQA", isActive: 1 },
    { id: "dept-cong-nghe", name: "Phòng Công Nghệ", code: "PCN", isActive: 1 },
    { id: "dept-bao-tri", name: "Phòng Bảo Trì", code: "PBT", isActive: 1 },
  ];

  for (const dept of sampleDepts) {
    await db.insert(departments).values(dept).onConflictDoNothing().execute();
  }

  // 4. Seed Employees
  const defaultPasswordHash = "$2a$10$w09ZJ/gT6qH.b1E0xU1M6uP5jUv5a9m/W0X8q7QZ.q6"; // '123456'

  const sampleEmployees = [
    { id: "emp-worker1", mnv: "NV001", passwordHash: defaultPasswordHash, fullName: "Nguyễn Văn An", position: "Công Nhân Xưởng May 1", workshopId: "ws-may-1", department: "Xưởng may 1", phone: "0901000001", isActive: 1, createdAt: now },
    { id: "emp-lineleader1", mnv: "TL001", passwordHash: defaultPasswordHash, fullName: "Trần Văn Bình", position: "Trưởng Line 1", workshopId: "ws-may-1", department: "Xưởng may 1", phone: "0901000002", isActive: 1, createdAt: now },
    { id: "emp-qa1", mnv: "QA001", passwordHash: defaultPasswordHash, fullName: "Lê Thị Cúc", position: "Chuyên Viên QA", workshopId: "ws-may-1", department: "Phòng QA", phone: "0901000003", isActive: 1, createdAt: now },
    { id: "emp-tech1", mnv: "CN001", passwordHash: defaultPasswordHash, fullName: "Phạm Văn Dũng", position: "Kỹ Sư Công Nghệ", workshopId: "ws-may-1", department: "Phòng Công Nghệ", phone: "0901000004", isActive: 1, createdAt: now },
    { id: "emp-depthead1", mnv: "TP001", passwordHash: defaultPasswordHash, fullName: "Hoàng Văn Giang", position: "Trưởng Phòng Bảo Trì", workshopId: "ws-may-1", department: "Phòng Bảo Trì", phone: "0901000005", isActive: 1, createdAt: now },
    { id: "emp-handler1", mnv: "KT001", passwordHash: defaultPasswordHash, fullName: "Đỗ Văn Hùng", position: "Kỹ Thuật Bảo Trì", workshopId: "ws-may-1", department: "Phòng Bảo Trì", phone: "0901000006", isActive: 1, createdAt: now },
    { id: "emp-director1", mnv: "GD001", passwordHash: defaultPasswordHash, fullName: "Vũ Thị Mai", position: "Giám Đốc Phân Xưởng", workshopId: "ws-may-1", department: "Ban Giám Đốc", phone: "0901000007", isActive: 1, createdAt: now },
    { id: "emp-admin1", mnv: "ADMIN01", passwordHash: defaultPasswordHash, fullName: "Quản Trị Viên TBS", position: "Quản Trị Hệ Thống", workshopId: "ws-may-1", department: "Công Nghệ Thông Tin", phone: "0901000008", isActive: 1, createdAt: now },
  ];

  for (const emp of sampleEmployees) {
    await db.insert(employees).values(emp).onConflictDoNothing().execute();
  }

  // 5. Seed User Roles
  const sampleUserRoles = [
    { id: "ur-worker1", employeeId: "emp-worker1", role: "worker" as const },
    { id: "ur-lineleader1", employeeId: "emp-lineleader1", role: "line_leader" as const },
    { id: "ur-qa1", employeeId: "emp-qa1", role: "qa" as const },
    { id: "ur-tech1", employeeId: "emp-tech1", role: "technology" as const },
    { id: "ur-depthead1", employeeId: "emp-depthead1", role: "dept_head" as const },
    { id: "ur-handler1", employeeId: "emp-handler1", role: "handler" as const },
    { id: "ur-director1", employeeId: "emp-director1", role: "director" as const },
    { id: "ur-admin1", employeeId: "emp-admin1", role: "admin" as const },
  ];

  for (const ur of sampleUserRoles) {
    await db.insert(userRoles).values(ur).onConflictDoNothing().execute();
  }

  return { success: true };
}
