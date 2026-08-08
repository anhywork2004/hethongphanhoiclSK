import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ==========================================
// 1. ENUMS & CONSTANTS
// ==========================================
export const ROLES = [
  "admin", // Quản trị hệ thống
  "worker", // Cán bộ sản xuất / Công nhân
  "qa", // Nhân viên QA
  "line_leader", // Line Leader / Trưởng line
  "technology", // Kỹ thuật công nghệ (CN)
  "dept_head", // Trưởng các phòng ban (TP)
  "handler", // Người thực thi sửa chữa (Bảo trì / Kỹ thuật)
  "director", // Ban giám đốc / Giám đốc xưởng
  "general_director", // Tổng giám đốc
] as const;

export type Role = (typeof ROLES)[number];

export const ISSUE_STATUSES = [
  "reported", // Vừa báo cáo (15 phút SLA)
  "investigating", // Đang điều tra 5M+1E (QA, LL, CN)
  "root_cause_found", // Đã có nguyên nhân (LL đã tổng hợp)
  "assigned", // Đã giao việc (TP đã giao cho kỹ thuật)
  "in_progress", // Đang xử lý (Kỹ thuật đã nhận việc, đếm giờ)
  "monitoring", // Đang theo dõi (3h - 48h sau khi sửa)
  "completed", // Đã hoàn thành (Đóng sau theo dõi)
  "phase2", // Phase 2 (Không giải quyết được, chuyển GĐ/TGĐ)
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const FIVE_M_ONE_E_GROUPS = [
  "Man", // Con người
  "Machine", // Máy móc / Thiết bị
  "Material", // Nguyên vật liệu
  "Method", // Phương pháp thao tác (SOP)
  "Measurement", // Đo lường / Hiệu chuẩn
  "Environment", // Môi trường xưởng
] as const;

export type FiveMOneEGroup = (typeof FIVE_M_ONE_E_GROUPS)[number];

// ==========================================
// 2. ORGANIZATIONAL HIERARCHY (MULTI-TENANT)
// ==========================================

// 2.1 Factories (Nhà máy)
export const factories = sqliteTable("factories", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  address: text("address"),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at").notNull(),
});

// 2.2 Areas (Xưởng -> Tổ -> Chuyền)
export const areas = sqliteTable("areas", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id").notNull(),
  parentId: text("parent_id"), // workshop -> null, team -> workshopId, line -> teamId
  type: text("type").notNull(), // 'workshop' | 'team' | 'line'
  name: text("name").notNull(),
  code: text("code").notNull(),
  order: integer("order").default(0),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at").notNull(),
});

// 2.3 Departments (Phòng ban linh hoạt)
export const departments = sqliteTable("departments", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id"),
  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at").notNull(),
});

// 2.4 Users (Tài khoản người dùng)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id"),
  departmentId: text("department_id"),
  areaId: text("area_id"), // Gắn với khu vực/xưởng cụ thể
  mnv: text("mnv").notNull().unique(), // Mã đăng nhập
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  zaloId: text("zalo_id"),
  email: text("email"),
  position: text("position"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().$type<Role>(),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at").notNull(),
});

// Alias employees to users for compatibility
export const employees = users;

// 2.5 User Roles (Hỗ trợ đa vai trò)
export const userRoles = sqliteTable("user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().$type<Role>(),
});

// ==========================================
// 3. CATEGORIES & SPARE PARTS
// ==========================================

// 3.1 Issue Categories (Danh mục lỗi - Admin CRUD)
export const issueCategories = sqliteTable("issue_categories", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id"),
  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),
  order: integer("order").default(0),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at").notNull(),
});

// 3.2 Part Categories (Danh mục linh kiện thay thế - Admin CRUD)
export const partCategories = sqliteTable("part_categories", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id"),
  name: text("name").notNull(),
  code: text("code"),
  unit: text("unit").default("Cái"),
  inStock: integer("in_stock").default(100),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at").notNull(),
});

// 3.3 Product Sizes
export const productSizes = sqliteTable("product_sizes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

// ==========================================
// 4. CORE INCIDENT WORKFLOW (7 STEPS + PHASE 2)
// ==========================================

// 4.1 Quality Issues (Phiếu sự cố chất lượng)
export const qualityIssues = sqliteTable("quality_issues", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id"),
  issueCode: text("issue_code").notNull().unique(), // VD: CLSK-20260808-1234
  areaId: text("area_id"), // Chuyền / Tổ / Xưởng
  workshopId: text("workshop_id"),
  workshopName: text("workshop_name"),
  teamName: text("team_name"),
  lineName: text("line_name"),
  categoryId: text("category_id"),
  categoryName: text("category_name"),
  poCode: text("po_code").notNull(),
  productCode: text("product_code"),
  productName: text("product_name"),
  affectedSizes: text("affected_sizes").default("[]"), // JSON string array
  detectionStage: text("detection_stage").notNull(),
  description: text("description").notNull(),
  severity: text("severity").default("medium"), // 'low' | 'medium' | 'high' | 'urgent'
  images: text("images").default("[]"), // JSON array of initial images
  status: text("status").notNull().$type<IssueStatus>().default("reported"),

  // Step 1: Reporter Info & 15m Deadline
  reportedById: text("reported_by_id"),
  reportedByName: text("reported_by_name"),
  reportedByMnv: text("reported_by_mnv"),
  reportedAt: integer("reported_at").notNull(),
  form15Deadline: integer("form15_deadline").notNull(), // reportedAt + 15*60
  form15Locked: integer("form15_locked").default(0),
  form15LockedAt: integer("form15_locked_at"),

  // Step 2 Submission Flags
  qaSubmitted: integer("qa_submitted").default(0),
  llSubmitted: integer("ll_submitted").default(0),
  cnSubmitted: integer("cn_submitted").default(0),

  // Step 3: LL Root Cause Synthesis & Solution
  rootCauseSummary: text("root_cause_summary"),
  proposedSolution: text("proposed_solution"),
  rootCauseDecidedById: text("root_cause_decided_by_id"),
  rootCauseDecidedByName: text("root_cause_decided_by_name"),
  rootCauseDecidedAt: integer("root_cause_decided_at"),

  // Phase 2: For Directors
  phase2Status: text("phase2_status"), // 'pending' | 'handled' | 'closed'
  phase2Notes: text("phase2_notes"),
  phase2HandledById: text("phase2_handled_by_id"),
  phase2HandledByName: text("phase2_handled_by_name"),
  phase2HandledAt: integer("phase2_handled_at"),

  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at"),
});

// Alias issues to qualityIssues
export const issues = qualityIssues;

// 4.2 Investigation Forms (3 form 5M+1E độc lập của QA, LL, CN)
export const investigationForms = sqliteTable("investigation_forms", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name"),
  userMnv: text("user_mnv"),
  userRole: text("user_role").notNull(), // 'qa' | 'line_leader' | 'technology'
  poCode: text("po_code"),
  images: text("images").default("[]"), // JSON string array
  whysDialogJson: text("whys_dialog_json"), // JSON string array of 5 Whys dialogue turns
  man: text("man"),
  machine: text("machine"),
  material: text("material"),
  method: text("method"),
  measurement: text("measurement"),
  environment: text("environment"),
  rootCauseCategory: text("root_cause_category").$type<FiveMOneEGroup>(),
  rootCauseConclusion: text("root_cause_conclusion").notNull(),
  submittedAt: integer("submitted_at").notNull(),
});

// 4.3 Maintenance Tasks (Nhiệm vụ sửa chữa do TP giao)
export const maintenanceTasks = sqliteTable("maintenance_tasks", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().unique(),
  departmentId: text("department_id").notNull(),
  departmentName: text("department_name"),
  assignedById: text("assigned_by_id").notNull(), // TP
  assignedByName: text("assigned_by_name"),
  assignedToId: text("assigned_to_id").notNull(), // Nhân viên bảo trì / kỹ thuật
  assignedToName: text("assigned_to_name"),
  assignedToMnv: text("assigned_to_mnv"),
  assignedAt: integer("assigned_at").notNull(),
  acceptedAt: integer("accepted_at"),
  completedAt: integer("completed_at"),
  durationSeconds: integer("duration_seconds"),
  status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'done'
  repairDescription: text("repair_description"),
  partsUsedJson: text("parts_used_json").default("[]"), // JSON array of { partId, partName, quantity, note }
  imagesBeforeJson: text("images_before_json").default("[]"),
  imagesAfterJson: text("images_after_json").default("[]"),
});

// 4.4 Monitoring Windows (Giai đoạn theo dõi 3h - 48h)
export const monitoringWindows = sqliteTable("monitoring_windows", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().unique(),
  confirmedByLlId: text("confirmed_by_ll_id"),
  confirmedByLlName: text("confirmed_by_ll_name"),
  confirmedAt: integer("confirmed_at").notNull(),
  minDeadline: integer("min_deadline").notNull(), // confirmedAt + 3*3600
  maxDeadline: integer("max_deadline").notNull(), // confirmedAt + 48*3600
  status: text("status").notNull().default("monitoring"), // 'monitoring' | 'closed_done' | 'reinvestigate_requested' | 'auto_closed'
  closedById: text("closed_by_id"),
  closedByName: text("closed_by_name"),
  closedAt: integer("closed_at"),
  reinvestigateReason: text("reinvestigate_reason"),
});

// ==========================================
// 5. NOTIFICATIONS & AUDIT LOGS
// ==========================================

// 5.1 Notifications (In-App + Zalo OA + Email logging)
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  roleTarget: text("role_target"),
  areaId: text("area_id"),
  issueId: text("issue_id"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  channel: text("channel").notNull().default("in_app"), // 'in_app' | 'zalo' | 'email'
  status: text("status").notNull().default("sent"), // 'sent' | 'failed' | 'simulated'
  isRead: integer("is_read").default(0),
  createdAt: integer("created_at").notNull(),
});

// 5.2 Audit Logs (Lịch sử thao tác từng phiếu)
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  issueId: text("issue_id"),
  userId: text("user_id"),
  userMnv: text("user_mnv"),
  userName: text("user_name"),
  action: text("action").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  detailsJson: text("details_json"),
  createdAt: integer("created_at").notNull(),
});

// 5.3 System Settings (Cấu hình mốc thời gian & thông báo)
export const systemSettings = sqliteTable("system_settings", {
  id: text("id").primaryKey().default("main"),
  form15TimeoutMinutes: integer("form15_timeout_minutes").default(15),
  minMonitoringHours: integer("min_monitoring_hours").default(3),
  maxMonitoringHours: integer("max_monitoring_hours").default(48),
  zaloEnabled: integer("zalo_enabled").default(0),
  emailEnabled: integer("email_enabled").default(0),
  updatedAt: integer("updated_at").notNull(),
});

// 5.4 Homepage CMS Settings
export const homepageSettings = sqliteTable("homepage_settings", {
  id: text("id").primaryKey().default("main"),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  bannerImageUrl: text("banner_image_url"),
  kpiMetricsJson: text("kpi_metrics_json"),
  announcementTicker: text("announcement_ticker"),
  updatedAt: integer("updated_at").notNull(),
});

// ==========================================
// BACKWARD COMPATIBILITY ALIASES & EXPORTS
// ==========================================
export const workshops = areas;
export const sizes = productSizes;
export const issueEscalations = auditLogs;
export const zaloGroupMembers = users;
export const zaloNotificationLog = notifications;
export const issueImages = sqliteTable("issue_images_legacy", {
  id: text("id").primaryKey(),
  issueId: text("issue_id"),
  imageUrl: text("image_url"),
  name: text("name"),
  createdAt: integer("created_at"),
});
export const issueResolutions = maintenanceTasks;
export const issueAssignments = maintenanceTasks;
export const issueMonitoring = monitoringWindows;
export const issueStatusHistory = auditLogs;
export const issueDepartmentDecisions = auditLogs;

export type ZaloGroupType = "khu_vuc" | "phong_ban" | "qa" | "giam_doc" | "toan_nha_may";


