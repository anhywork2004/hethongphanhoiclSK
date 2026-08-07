-- Thêm trường Tổ, Chuyền, Bảo trì định kỳ cho máy móc; đổi nhãn "Mã máy" -> "Mã tài sản" (chỉ đổi ở UI, không đổi tên cột).
ALTER TABLE "machines" ADD COLUMN "team" TEXT;
ALTER TABLE "machines" ADD COLUMN "productionLine" TEXT;
ALTER TABLE "machines" ADD COLUMN "maintenancePeriodType" TEXT;
ALTER TABLE "machines" ADD COLUMN "maintenancePeriodCustom" TEXT;
