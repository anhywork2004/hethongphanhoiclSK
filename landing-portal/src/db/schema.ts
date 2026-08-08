import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Roles enum values for Phase 1
export const PHASE1_ROLES = [
  "worker",
  "line_leader",
  "team_leader",
  "qa",
  "technology",
  "dept_head",
  "handler",
  "director",
  "general_director",
  "admin",
] as const;

export type Phase1Role = (typeof PHASE1_ROLES)[number];

// Issue status enum values for Phase 1
export const PHASE1_ISSUE_STATUSES = [
  "pending", // Chờ xử lý (báo lỗi 15p)
  "processing", // Đang xử lý (5M+1E + Phân công)
  "monitoring", // Theo dõi (3h - 48h)
  "resolved", // Đã xử lý xong
  "cannot_resolve", // Không thể xử lý
] as const;

export type Phase1IssueStatus = (typeof PHASE1_ISSUE_STATUSES)[number];

// Issue severity enum values
export const ISSUE_SEVERITIES = ["low", "medium", "high", "urgent"] as const;
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

// 3.1 employees (users)
export const employees = sqliteTable("employees", {
  id: text("id").primaryKey(),
  mnv: text("mnv").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  position: text("position"),
  workshopId: text("workshop_id"),
  department: text("department"),
  phone: text("phone"),
  zaloId: text("zalo_id"),
  role: text("role"),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at"),
});

// Alias users table for compatibility
export const users = employees;

// 3.2 user_roles
export const userRoles = sqliteTable("user_roles", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  role: text("role").notNull().$type<Phase1Role>(),
});

// 3.3 workshops (Phân xưởng)
export const workshops = sqliteTable("workshops", {
  id: text("id").primaryKey(),
  name: text("name"),
  code: text("code"),
  workshopName: text("workshop_name"),
  workshopCode: text("workshop_code"),
  description: text("description"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
});

// 3.4 product_sizes
export const productSizes = sqliteTable("product_sizes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

// Alias sizes table for compatibility
export const sizes = sqliteTable("sizes", {
  id: text("id").primaryKey(),
  sizeCode: text("size_code").notNull().unique(),
  sizeName: text("size_name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

// 3.5 departments (Phòng ban)
export const departments = sqliteTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code"),
  isActive: integer("is_active").default(1),
});

// 3.6 issues (Phiếu vấn đề — Bảng trung tâm)
export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(),
  issueCode: text("issue_code").notNull().unique(),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  affectedSizes: text("affected_sizes").notNull(), // JSON string array of size ids/codes
  workshopId: text("workshop_id").references(() => workshops.id),
  workshopName: text("workshop_name"),
  detectionStage: text("detection_stage").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().$type<IssueSeverity>().default("medium"),
  status: text("status").notNull().$type<Phase1IssueStatus>().default("pending"),
  escalatedLevel: integer("escalated_level").default(0),
  reportedBy: text("reported_by").references(() => employees.id),
  createdByMnv: text("created_by_mnv"),
  createdByName: text("created_by_name"),
  reportedAt: integer("reported_at"),
  form15Deadline: integer("form15_deadline"),
  form15SubmittedAt: integer("form15_submitted_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),

  // Backward compatibility fields
  initialDefectQty: integer("initial_defect_qty").default(0),
  repairedDefectQty: integer("repaired_defect_qty").default(0),
  closedOnceAt: text("closed_once_at"),
  closedTwiceAt: text("closed_twice_at"),
  repairedImages: text("repaired_images"),
  aiCauseDiagnosis: text("ai_cause_diagnosis"),
  testRunHours: integer("test_run_hours").default(3),
  qaApproverMnv: text("qa_approver_mnv"),
  qaApprovedAt: text("qa_approved_at"),
  resolvedAt: text("resolved_at"),
});

// 3.7 issue_images
export const issueImages = sqliteTable("issue_images", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  r2Key: text("r2_key").notNull(),
  imageUrl: text("image_url"),
  stage: text("stage").notNull(), // 'report' | 'before_fix' | 'after_fix'
  uploadedBy: text("uploaded_by").references(() => employees.id),
  uploadedAt: integer("uploaded_at"),
  createdAt: text("created_at"),
});

// 3.8 issue_5m1e (Form 15 phút)
export const issue5m1e = sqliteTable("issue_5m1e", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  poNumber: text("po_number"),
  defectQuantity: integer("defect_quantity"),
  man: text("man"),
  machine: text("machine"),
  material: text("material"),
  method: text("method"),
  measurement: text("measurement"),
  environment: text("environment"),
  rootCause: text("root_cause"),
  proposedSolution: text("proposed_solution"),
  submittedBy: text("submitted_by").references(() => employees.id),
  submittedAt: integer("submitted_at"),
});

// 3.9 issue_department_decisions
export const issueDepartmentDecisions = sqliteTable("issue_department_decisions", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  department: text("department").notNull(),
  decision: text("decision").notNull(), // 'agree_solution' | 'cannot_resolve'
  reason: text("reason"),
  decidedBy: text("decided_by").references(() => employees.id),
  decidedAt: integer("decided_at"),
});

// 3.10 issue_assignments
export const issueAssignments = sqliteTable("issue_assignments", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  department: text("department").notNull(),
  assignedDeptHead: text("assigned_dept_head").references(() => employees.id),
  handlerId: text("handler_id").references(() => employees.id),
  mnvConfirmed: integer("mnv_confirmed").default(0),
  confirmedAt: integer("confirmed_at"),
  assignedAt: integer("assigned_at"),
});

// 3.11 issue_resolutions
export const issueResolutions = sqliteTable("issue_resolutions", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  handlerId: text("handler_id").references(() => employees.id),
  startedAt: integer("started_at"),
  partsUsed: text("parts_used"),
  completedAt: integer("completed_at"),
  durationSeconds: integer("duration_seconds"),
  hasNewIssue: integer("has_new_issue").default(0),
});

// 3.12 issue_monitoring (Giai đoạn theo dõi 3h-48h)
export const issueMonitoring = sqliteTable("issue_monitoring", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  monitoringStartedAt: integer("monitoring_started_at"),
  minDeadline: integer("min_deadline"), // startedAt + 3h
  maxDeadline: integer("max_deadline"), // startedAt + 48h
  reportEnabledAt: integer("report_enabled_at"),
  isOverdue: integer("is_overdue").default(0),
  qtyBefore: integer("qty_before"),
  qtyAfter: integer("qty_after"),
  imagesBefore: text("images_before"), // JSON array
  imagesAfter: text("images_after"), // JSON array
  closedBy: text("closed_by").references(() => employees.id),
  closedAt: integer("closed_at"),
});

// 3.13 issue_escalations
export const issueEscalations = sqliteTable("issue_escalations", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'form15_timeout' | 'monitoring_overdue'
  escalatedTo: text("escalated_to").references(() => employees.id),
  escalatedAt: integer("escalated_at"),
  note: text("note"),
});

// 3.14 notifications (In-app notification)
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").references(() => employees.id, { onDelete: "cascade" }),
  issueId: text("issue_id").references(() => issues.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read").default(0),
  createdAt: integer("created_at"),
});

// 3.15 issue_status_history
export const issueStatusHistory = sqliteTable("issue_status_history", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  changedBy: text("changed_by").references(() => employees.id),
  changedAt: integer("changed_at").notNull(),
  note: text("note"),
});

// Homepage Settings (CMS)
export const homepageSettings = sqliteTable("homepage_settings", {
  id: text("id").primaryKey(),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  bannerImageUrl: text("banner_image_url"),
  kpiMetricsJson: text("kpi_metrics_json"),
  workshopsJson: text("workshops_json"),
  announcementTicker: text("announcement_ticker"),
  updatedAt: text("updated_at").notNull(),
});

// Zalo Group Types & Compatibility Tables
export const ZALO_GROUP_TYPES = [
  "truc_tiep_xu_ly",
  "dua_giai_phap",
  "tiep_nhan_thong_tin",
] as const;
export type ZaloGroupType = (typeof ZALO_GROUP_TYPES)[number];

export const zaloGroupMembers = sqliteTable("zalo_group_members", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  groupType: text("group_type").notNull().$type<ZaloGroupType>(),
  workshopId: text("workshop_id"),
  createdAt: text("created_at").notNull(),
});

export const zaloNotificationLog = sqliteTable("zalo_notification_log", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull(),
  userId: text("user_id"),
  groupType: text("group_type").notNull().$type<ZaloGroupType>(),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  sentAt: text("sent_at").notNull(),
});
