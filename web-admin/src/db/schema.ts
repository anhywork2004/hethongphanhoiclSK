import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Roles enum values for reference & validation
export const USER_ROLES = [
  "reporter",
  "truong_line",
  "to_truong",
  "qa",
  "cong_nghe",
  "truong_phong_ban",
  "nguoi_xu_ly",
  "giam_doc",
  "tong_giam_doc",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

// Issue status enum values
export const ISSUE_STATUSES = [
  "cho_xu_ly",
  "dang_xu_ly",
  "theo_doi",
  "cho_nghiem_thu",
  "da_xu_ly",
  "khong_the_xu_ly",
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

// Issue severity enum values
export const ISSUE_SEVERITIES = [
  "thap",
  "trung_binh",
  "cao",
  "khan_cap",
] as const;

export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

// 1. Users Table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  mnv: text("mnv").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  role: text("role").notNull().$type<UserRole>(),
  zaloId: text("zalo_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 2. Sizes Table
export const sizes = sqliteTable("sizes", {
  id: text("id").primaryKey(),
  sizeCode: text("size_code").notNull().unique(),
  sizeName: text("size_name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

// 3. Workshops Table
export const workshops = sqliteTable("workshops", {
  id: text("id").primaryKey(),
  workshopCode: text("workshop_code").notNull().unique(),
  workshopName: text("workshop_name").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

// 4. Issues Table (Phiếu Vấn Đề CLSK)
export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(),
  issueCode: text("issue_code").notNull().unique(),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  affectedSizes: text("affected_sizes").notNull(), // JSON string array of size codes/ids
  workshopId: text("workshop_id").references(() => workshops.id),
  workshopName: text("workshop_name"),
  detectionStage: text("detection_stage").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().$type<IssueSeverity>(),
  status: text("status").notNull().$type<IssueStatus>().default("cho_xu_ly"),
  createdByMnv: text("created_by_mnv").notNull(),
  createdByName: text("created_by_name").notNull(),
  createdAt: text("created_at").notNull(),
  
  // Advanced Phase 2/3 Fields
  investigationDeadline: text("investigation_deadline"),
  slaDeadline: text("sla_deadline"),
  escalatedLevel: integer("escalated_level").default(0),
  qaApproverMnv: text("qa_approver_mnv"),
  qaApprovedAt: text("qa_approved_at"),
  rootCauseData: text("root_cause_data"), // JSON string object (5M+1E)
  assignedTechnicianId: text("assigned_technician_id"),
  resolvedAt: text("resolved_at"),
  monitoringDeadline: text("monitoring_deadline"),
});

// 5. Issue Images Table
export const issueImages = sqliteTable("issue_images", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  r2Key: text("r2_key"),
  createdAt: text("created_at").notNull(),
});

// Zalo Group Types
export const ZALO_GROUP_TYPES = [
  "truc_tiep_xu_ly",
  "dua_giai_phap",
  "tiep_nhan_thong_tin",
] as const;
export type ZaloGroupType = (typeof ZALO_GROUP_TYPES)[number];

// 6. Zalo Group Members Table
export const zaloGroupMembers = sqliteTable("zalo_group_members", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupType: text("group_type").notNull().$type<ZaloGroupType>(),
  workshopId: text("workshop_id").references(() => workshops.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
});

// 7. Zalo Notification Log Table
export const zaloNotificationLog = sqliteTable("zalo_notification_log", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull(),
  userId: text("user_id"),
  groupType: text("group_type").notNull().$type<ZaloGroupType>(),
  status: text("status").notNull(), // 'sent' | 'failed'
  errorMessage: text("error_message"),
  sentAt: text("sent_at").notNull(),
});

// 8. Machines Table
export const machines = sqliteTable("machines", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  serialNumber: text("serial_number"),
  name: text("name").notNull(),
  location: text("location").notNull(),
  workshopId: text("workshop_id").references(() => workshops.id),
  model: text("model"),
  manufacturer: text("manufacturer"),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: text("created_at").notNull(),
});

// 9. Failure Categories Table
export const failureCategories = sqliteTable("failure_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

// 10. Incidents Table
export const incidents = sqliteTable("incidents", {
  id: text("id").primaryKey(),
  machineId: text("machine_id").notNull().references(() => machines.id),
  reporterId: text("reporter_id").notNull().references(() => users.id),
  assignedToId: text("assigned_to_id").references(() => users.id),
  description: text("description").notNull(),
  images: text("images"),
  status: text("status").notNull().default("PENDING"),
  categoryId: text("category_id").references(() => failureCategories.id),
  acceptedAt: text("accepted_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull(),
});

// 11. Maintenance Logs Table
export const maintenanceLogs = sqliteTable("maintenance_logs", {
  id: text("id").primaryKey(),
  incidentId: text("incident_id").references(() => incidents.id),
  issueId: text("issue_id").references(() => issues.id),
  machineId: text("machine_id").references(() => machines.id),
  technicianId: text("technician_id").notNull().references(() => users.id),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  repairDetail: text("repair_detail").notNull(),
  partsReplaced: text("parts_replaced"),
  proofImages: text("proof_images"),
  skillRating: integer("skill_rating"),
  createdAt: text("created_at").notNull(),
});

// 12. Chat Groups Table
export const chatGroups = sqliteTable("chat_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  createdAt: text("created_at").notNull(),
});

// 13. Chat Messages Table
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull().references(() => chatGroups.id, { onDelete: "cascade" }),
  senderId: text("sender_id").references(() => users.id),
  type: text("type").notNull().default("TEXT"),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

// 14. 5M+1E Submissions Table
export const fiveMOneESubmissions = sqliteTable("five_m_one_e_submissions", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  submitterId: text("submitter_id").notNull().references(() => users.id),
  submitterRole: text("submitter_role").notNull(),
  man: text("man").notNull(),
  machine: text("machine").notNull(),
  material: text("material").notNull(),
  method: text("method").notNull(),
  measurement: text("measurement").notNull(),
  environment: text("environment").notNull(),
  submittedAt: text("submitted_at").notNull(),
});

// 15. Preventive Maintenance Schedules Table
export const preventiveMaintenanceSchedules = sqliteTable("preventive_maintenance_schedules", {
  id: text("id").primaryKey(),
  machineId: text("machine_id").notNull().references(() => machines.id),
  title: text("title").notNull(),
  frequency: text("frequency").notNull(), // 'weekly' | 'monthly' | 'quarterly'
  nextDueDate: text("next_due_date").notNull(),
  checklistJson: text("checklist_json"),
  assignedTechnicianId: text("assigned_technician_id").references(() => users.id),
  status: text("status").notNull().default("PENDING"),
  createdAt: text("created_at").notNull(),
});


