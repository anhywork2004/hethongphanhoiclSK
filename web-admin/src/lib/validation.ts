import { z } from "zod";

// Issue Creation Schema
export const createIssueSchema = z.object({
  productCode: z.string().min(1, "Mã sản phẩm không được để trống"),
  productName: z.string().min(1, "Tên sản phẩm không được để trống"),
  affectedSizes: z.array(z.string()).min(1, "Phải chọn ít nhất một size lỗi"),
  workshopId: z.string().min(1, "Vui lòng chọn phân xưởng"),
  detectionStage: z.string().min(1, "Vui lòng chọn công đoạn phát hiện lỗi"),
  description: z.string().min(3, "Mô tả chi tiết phải có ít nhất 3 ký tự"),
  severity: z.enum(["thap", "trung_binh", "cao", "khan_cap"]),
  imageUrls: z.array(z.string()).optional(),
});

// Mobile Login Schema
export const mobileLoginSchema = z.object({
  employeeCode: z.string().min(1, "Mã nhân viên không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

// Zalo Group Membership Schema
export const zaloGroupMemberSchema = z.object({
  userId: z.string().min(1, "User ID không được để trống"),
  groupType: z.enum(["truc_tiep_xu_ly", "dua_giai_phap", "tiep_nhan_thong_tin"]),
  workshopId: z.string().optional().nullable(),
});

// Workshop Schema
export const workshopSchema = z.object({
  workshopCode: z.string().min(1, "Mã xưởng không được để trống"),
  workshopName: z.string().min(1, "Tên xưởng không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Size Schema
export const sizeSchema = z.object({
  sizeCode: z.string().min(1, "Mã size không được để trống"),
  sizeName: z.string().min(1, "Tên size không được để trống"),
  isActive: z.boolean().default(true),
});

// Helper for Zod validation error responses
export function formatZodError(error: z.ZodError) {
  const issues = error.issues.map((i) => i.message);
  return issues.join("; ");
}
