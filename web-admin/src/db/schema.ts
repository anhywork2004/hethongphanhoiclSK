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
  
  // Phase 2 Fields (ready for extension)
  assignedNotifyRoles: text("assigned_notify_roles"), // JSON string array
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

