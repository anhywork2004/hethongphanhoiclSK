-- Chuyển Khu vực/Tổ/Chuyền/Trạng thái/Bảo trì định kỳ của machines sang bảng categories dùng chung,
-- và thêm toạ độ GPS (latitude/longitude) cho máy.

CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "days" INTEGER,
    "statusKind" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "colorHex" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "categories_type_name_key" ON "categories"("type", "name");

ALTER TABLE "machines" ADD COLUMN "areaId" TEXT;
ALTER TABLE "machines" ADD COLUMN "teamId" TEXT;
ALTER TABLE "machines" ADD COLUMN "productionLineId" TEXT;
ALTER TABLE "machines" ADD COLUMN "statusId" TEXT;
ALTER TABLE "machines" ADD COLUMN "maintenancePeriodId" TEXT;
ALTER TABLE "machines" ADD COLUMN "latitude" REAL;
ALTER TABLE "machines" ADD COLUMN "longitude" REAL;

INSERT INTO "categories" ("id","type","name","statusKind","isDefault","colorHex","order") VALUES
  ('status-active','MACHINE_STATUS','Đang hoạt động','ACTIVE',true,'#16A34A',0),
  ('status-stopped','MACHINE_STATUS','Đang dừng','STOPPED',true,'#F97316',1),
  ('status-maintenance','MACHINE_STATUS','Đang bảo trì','MAINTENANCE',true,'#2563EB',2);

INSERT INTO "categories" ("id","type","name","days","order") VALUES
  ('period-1m','MAINTENANCE_PERIOD','1 tháng',30,0),
  ('period-3m','MAINTENANCE_PERIOD','3 tháng',90,1),
  ('period-6m','MAINTENANCE_PERIOD','6 tháng',180,2);

UPDATE "machines" SET "statusId" = 'status-active' WHERE "status" = 'ACTIVE';
UPDATE "machines" SET "statusId" = 'status-stopped' WHERE "status" = 'BROKEN';
UPDATE "machines" SET "statusId" = 'status-maintenance' WHERE "status" = 'MAINTENANCE';
UPDATE "machines" SET "statusId" = 'status-active' WHERE "statusId" IS NULL;
