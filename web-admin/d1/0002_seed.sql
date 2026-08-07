-- Seed dữ liệu mẫu cho D1 (mật khẩu mặc định cho tất cả tài khoản: 123456)

INSERT INTO "users" ("id", "employeeCode", "name", "phone", "passwordHash", "role", "createdAt", "updatedAt") VALUES
('13e57386-9d8d-49f2-b940-e9c1e3787405', 'ADM001', 'Quản trị viên', '0900000001', '$2b$10$KqzzFrck.GWpEMx2lDe3q.AMgkN22J5i.W5kKcL54tANrKf6o.t1.', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f4d2b57c-8017-46df-903a-f539a607c192', 'NV001', 'Nguyễn Văn Vận Hành', '0900000002', '$2b$10$KqzzFrck.GWpEMx2lDe3q.AMgkN22J5i.W5kKcL54tANrKf6o.t1.', 'OPERATOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6704919c-ba75-4861-9cba-abe1290bd08c', 'BT001', 'Trần Văn Bảo Trì', '0900000003', '$2b$10$KqzzFrck.GWpEMx2lDe3q.AMgkN22J5i.W5kKcL54tANrKf6o.t1.', 'MAINTENANCE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ad3b4457-8f6b-47f5-bf8f-85e7bc549415', 'BT002', 'Lê Thị Kỹ Thuật', '0900000004', '$2b$10$KqzzFrck.GWpEMx2lDe3q.AMgkN22J5i.W5kKcL54tANrKf6o.t1.', 'MAINTENANCE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "machines" ("id", "code", "name", "location", "specs", "status", "createdAt", "updatedAt") VALUES
('9b53c950-3842-49f5-93d6-69b4151e0752', 'MAY001', 'Máy CNC số 1', 'Xưởng A - Khu vực 1', 'Công suất 5.5kW, năm sản xuất 2020', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('eb14897e-d6a9-4a33-8d13-1bce022eff70', 'MAY002', 'Máy ép nhựa số 2', 'Xưởng B - Khu vực 3', 'Công suất 11kW, năm sản xuất 2019', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "failure_categories" ("id", "name", "isOther", "order", "createdAt") VALUES
('cat-dien', 'Hệ thống Điện / Điện tử', 0, 1, CURRENT_TIMESTAMP),
('cat-co-khi', 'Cơ khí / Truyền động', 0, 2, CURRENT_TIMESTAMP),
('cat-thuy-luc', 'Thủy lực / Khí nén', 0, 3, CURRENT_TIMESTAMP),
('cat-phan-mem', 'Phần mềm / Lỗi vận hành', 0, 4, CURRENT_TIMESTAMP),
('cat-hao-mon', 'Hao mòn tự nhiên / Vật tư tiêu hao', 0, 5, CURRENT_TIMESTAMP),
('cat-con-nguoi', 'Lỗi do con người', 0, 6, CURRENT_TIMESTAMP),
('cat-khac', 'Khác', 1, 7, CURRENT_TIMESTAMP);

INSERT INTO "chat_groups" ("id", "name", "createdAt") VALUES
('default-maintenance-group', 'Nhóm Bảo trì', CURRENT_TIMESTAMP);

INSERT INTO "chat_group_members" ("id", "groupId", "userId", "joinedAt") VALUES
('dccd4a21-9f8c-4f4e-a2a5-5ce29209c35d', 'default-maintenance-group', '6704919c-ba75-4861-9cba-abe1290bd08c', CURRENT_TIMESTAMP),
('7b1477f4-2529-40b8-b3ea-55881be0ee1e', 'default-maintenance-group', 'ad3b4457-8f6b-47f5-bf8f-85e7bc549415', CURRENT_TIMESTAMP);
