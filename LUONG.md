# LUỒNG NGHIỆP VỤ — TBS HTPH-CLSK (Quản lý sự cố chất lượng)

Tài liệu mô tả luồng xử lý 1 vấn đề chất lượng từ lúc báo cáo đến lúc hoàn thành, kèm danh sách
tài khoản test theo từng vai trò. Dùng để test thủ công trên localhost.

## Đang chạy ở đâu

- **Web Admin** (chỉ dành cho Admin): http://localhost:3000/login
- **Mobile App bản web** (dùng cho mọi vai trò còn lại): http://localhost:8082

## Tài khoản test (đều dùng chung khu vực "Xưởng A" để test được trọn luồng)

Mật khẩu cho tất cả tài khoản: **`123456`**

| Mã đăng nhập | Vai trò | Tên | Khu vực | Dùng ở đâu |
|---|---|---|---|---|
| `ADM001` | Admin | Quản trị viên | - | Web Admin (localhost:3000) |
| `NV001` | Nhân viên vận hành (Operator) | Nguyễn Văn Vận Hành | Xưởng A | Mobile app |
| `QA001` | QA | Trần Thị QA | Xưởng A | Mobile app |
| `LL001` | Trưởng line (Line Leader) | Lê Văn Trưởng Line | Xưởng A | Mobile app |
| `CN001` | Công nghệ (Technology) | Phạm Văn Công Nghệ | Xưởng A | Mobile app |
| `TP001` | Trưởng phòng ban (Department Head) | Hoàng Văn Trưởng Phòng | Xưởng A | Mobile app |
| `BT001` | Bảo trì (Maintenance) | Đỗ Văn Bảo Trì | Xưởng A | Mobile app |

Dữ liệu nền có sẵn (Admin đã tạo trước, seed sẵn):
- Tổ: **Tổ 1** · Chuyền: **Chuyền 1** (đều thuộc Xưởng A)
- Danh mục lỗi: Lỗi máy móc, Lỗi nguyên vật liệu, Lỗi thao tác
- Danh mục linh kiện: Vòng bi, Dây curoa

> Vì cả 6 tài khoản (trừ Admin) đều cùng khu vực Xưởng A, bạn có thể test hết cả luồng chỉ với
> 7 tài khoản này — không cần Admin tạo thêm gì.

## Luồng xử lý 1 vấn đề — từng bước, ai làm gì, đăng nhập tài khoản nào

### Bước 1 — Báo cáo vấn đề (bất kỳ ai)
- Đăng nhập mobile bằng **bất kỳ tài khoản nào** (kể cả `NV001`), vào tab **Trang chủ**.
- Bấm nút **"Báo cáo vấn đề"** → điền Tổ, Chuyền, Danh mục lỗi, Mã PO (gõ tự do, vd `PO-001`),
  Mô tả, ảnh (tuỳ chọn) → **Gửi báo cáo**.
- Hệ thống tạo phiếu, trạng thái **"Vừa báo cáo"**, đặt hạn điều tra 15 phút, và gửi thông báo cho
  3 vai trò cùng khu vực: QA, Trưởng line, Công nghệ.

### Bước 2 — 3 vai trò điều tra 5M+1E (độc lập, mỗi người 1 form riêng)
- Đăng nhập lần lượt bằng **`QA001`**, **`LL001`**, **`CN001`** → tab **Thông báo** sẽ thấy thẻ
  "Cần điều tra 5M+1E" → bấm vào → vào màn hình chi tiết phiếu (hoặc từ Trang chủ bấm thẳng vào
  phiếu vừa báo cáo).
- Mỗi người điền: Mã PO, ảnh, và 6 mục Man/Machine/Material/Method/Measurement/Environment →
  **Gửi biểu mẫu**. Phải nộp **trong vòng 15 phút** kể từ lúc báo cáo, nếu không hệ thống sẽ khoá
  và báo cho Trưởng phòng ban.
- Cần cả 3 tài khoản đăng nhập/nộp riêng lẻ để đủ dữ liệu cho bước chốt nguyên nhân.

### Bước 3 — Trưởng line chốt nguyên nhân gốc
- Đăng nhập **`LL001`**, vào lại phiếu đó → sẽ thấy cả 3 bản 5M+1E hiển thị cạnh nhau.
- Điền **Nguyên nhân gốc** (bắt buộc) + **Giải pháp đề xuất** (tuỳ chọn) → **Chốt nguyên nhân**.
- Trạng thái phiếu chuyển **"Đã có nguyên nhân"**, thông báo gửi cho Trưởng line + Trưởng phòng ban.

### Bước 4 — Trưởng phòng ban giao việc cho Bảo trì
- Đăng nhập **`TP001`**, vào tab **Công việc** (chỉ Trưởng phòng ban/Bảo trì thấy tab này) → thấy
  phiếu đang chờ giao → bấm vào → tìm nhân viên bảo trì **cùng khu vực** (gõ `BT001` hoặc tên) →
  chọn → **Giao việc**.
- Hệ thống chỉ cho chọn nhân viên bảo trì cùng khu vực Xưởng A (không cho chọn khác khu vực).

### Bước 5 — Bảo trì nhận việc
- Đăng nhập **`BT001`** → tab **Công việc** → thấy thẻ **"CẦN TRỢ GIÚP"** (người báo cáo, tổ,
  chuyền, mô tả, ảnh, giải pháp đề xuất) → bấm **Nhận việc**.
- Trạng thái → Đang xử lý, ghi giờ nhận; thông báo gửi cho người báo cáo + Trưởng line kèm giờ nhận.
- Lưu ý: 1 người bảo trì chỉ được nhận 1 việc tại 1 thời điểm.

### Bước 6 — Bảo trì hoàn thành sửa chữa
- Vẫn tài khoản **`BT001`**, vào lại phiếu → điền **Mô tả sửa chữa**, chọn **linh kiện thay thế**
  (thêm nhiều dòng tuỳ ý, mỗi dòng chọn linh kiện + ghi chú), **ảnh trước** + **ảnh sau** sửa chữa
  → **Hoàn thành**.
- Thông báo gửi cho Trưởng line; đồng hồ xác nhận bắt đầu chạy (xem bước 7).

### Bước 7 — Trưởng line xác nhận Đã/Chưa hoàn thành
- Đăng nhập **`LL001`**, vào lại phiếu → 2 nút **"Đã hoàn thành"** / **"Chưa hoàn thành"**.
- 2 nút này **chỉ bấm được trong khung giờ từ 3 giờ đến 48 giờ** sau khi bảo trì bấm hoàn thành —
  trước 3h hoặc sau 48h nút sẽ bị khoá (xem mục "Test nhanh timer" bên dưới nếu muốn test ngay).
- Nếu bấm **Đã hoàn thành**: phiếu chuyển trạng thái **"Đã hoàn thành"**, kết thúc luồng.
- Nếu bấm **Chưa hoàn thành**: phiếu quay lại **"Đang điều tra"**, mở lại form 5M+1E cho QA/Trưởng
  line/Công nghệ nộp bổ sung (giữ nguyên lịch sử 5M+1E và sửa chữa cũ) — quay lại Bước 2.
- Nếu Trưởng line không bấm gì trong 48h: hệ thống **tự động chuyển "Đã hoàn thành"**.

## Tổng kết ai cần tài khoản gì ở bước nào

| Bước | Vai trò thao tác | Tài khoản |
|---|---|---|
| 1. Báo cáo | Bất kỳ ai | `NV001` (hoặc bất kỳ) |
| 2. Điều tra 5M+1E | QA + Trưởng line + Công nghệ | `QA001`, `LL001`, `CN001` |
| 3. Chốt nguyên nhân gốc | Trưởng line | `LL001` |
| 4. Giao việc | Trưởng phòng ban | `TP001` |
| 5. Nhận việc | Bảo trì | `BT001` |
| 6. Hoàn thành sửa chữa | Bảo trì | `BT001` |
| 7. Xác nhận Đã/Chưa hoàn thành | Trưởng line | `LL001` |

Admin (`ADM001`, web http://localhost:3000) chỉ dùng để quản lý danh mục/nhân sự và xem
Dashboard/Top 5 lỗi — không tham gia luồng xử lý.

## Test nhanh các mốc thời gian (tuỳ chọn, không bắt buộc)

Mặc định phải chờ thật (15 phút / 3 giờ / 48 giờ) mới bấm được các nút liên quan. Nếu muốn test
ngay mà không chờ, có thể nhờ chỉnh trực tiếp giờ trong `web-admin/dev.db` (bảng `quality_issues`
cột `investigationDeadline`, bảng `maintenance_tasks` cột `completedAt`) rồi tải lại — báo lại nếu
cần hỗ trợ việc này.
