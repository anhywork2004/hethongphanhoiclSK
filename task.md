# TASK.md - Dự án Ứng dụng Quản trị Toàn bộ Máy móc & Bảo trì

## 1. Tổng quan dự án
Ứng dụng gồm 2 phân hệ chính:
1. **Mobile App (Giao diện phong cách Zalo):** Phục vụ Nhân viên vận hành và Nhân viên bảo trì.
2. **Web Admin Dashboard:** Quản lý dữ liệu hệ thống (CRUD máy móc, nhân viên, phân quyền) và tự động sinh mã QR cho từng máy.

---

## 2. Phân quyền Người dùng (Roles)
Hệ thống có 3 role chính:
* **Nhân viên vận hành:** Quét mã QR máy, xem thông tin/tình trạng máy, gửi báo cáo sự cố.
* **Nhân viên bảo trì:** Nhận thông báo sự cố qua nhóm chat, nhận việc, xử lý sự cố, cập nhật kết quả sửa chữa, chat nhóm nội bộ bảo trì.
* **Admin:** Quản lý toàn bộ hệ thống (CRUD máy, CRUD nhân viên, phân quyền, sinh mã QR).

---

## 3. Chi tiết Chức năng Mobile App

### 3.1. Điều hướng (Navigation - 3 tab chính)
* **Tab 1: Trang chủ (Home - Giao diện tựa Zalo):**
  * Nằm ở giữa màn hình có nút **Quét mã QR** nổi bật.
  * Hiển thị danh sách thông báo/tin nhắn hoặc bảng tin hoạt động sự cố.
* **Tab 2: Chat nhóm (Dành riêng cho Bảo trì):**
  * Cho phép tạo nhóm chat nội bộ giữa các nhân viên bảo trì.
  * Thêm thành viên vào nhóm bằng cách tìm kiếm **Mã nhân viên**.
* **Tab 3: Cá nhân / Thông tin tài khoản:**
  * Hiển thị thông tin sau khi đăng nhập, đổi mật khẩu, đăng xuất.

### 3.2. Luồng Báo cáo và Xử lý Sự cố (Core Workflow)
1. **Quét mã máy:** 
   * Nhân viên vận hành dùng app quét mã QR dán trên máy $\rightarrow$ App hiển thị thông tin máy, vị trí, tình trạng hiện tại.
   * Trên màn hình thông tin máy có nút **"Báo lỗi"**.
2. **Gửi báo lỗi:**
   * Nhân viên điền form gồm: Hình ảnh thực tế, mô tả tình trạng hư hỏng.
   * Khi bấm gửi $\rightarrow$ Hệ thống tự động đẩy thông báo kèm thông tin máy, vị trí, hình ảnh, tình trạng vào **nhóm chat của bộ phận Bảo trì**.
3. **Tiếp nhận nhiệm vụ:**
   * Trong tin nhắn báo lỗi tại nhóm chat bảo trì có nút **"Nhận việc"**.
   * Nhân viên bảo trì bấm "Nhận việc" $\rightarrow$ Nút biến mất, đổi thành hiển thị tên người đã nhận (`[Tên nhân viên] đã nhận việc`), đồng thời hệ thống **bắt đầu tính thời gian sửa chữa**.
4. **Hoàn thành công việc:**
   * Giao diện cập nhật thêm nút **"Hoàn thành công việc"**.
   * Khi click hoàn thành $\rightarrow$ Hiện form điền thông tin chi tiết: Sửa chữa những gì, có thay thế linh kiện/công cụ nào không, đánh giá tay nghề bảo trì.
   * Hệ thống ghi nhận tổng thời gian từ lúc nhận việc đến khi hoàn thành, lịch sử lỗi, và đánh giá xem máy có bị hư tiếp hay không.

---

## 4. Chi tiết Chức năng Web Admin
* **Quản lý Máy móc (Machines):** CRUD thông tin máy móc (Tên máy, vị trí, thông số, trạng thái...). Khi tạo mới một máy thành công $\rightarrow$ Hệ thống **tự động sinh mã QR** tương ứng để in và dán lên máy.
* **Quản lý Nhân sự (Employees):** CRUD tài khoản nhân viên, cấp mã nhân viên độc lập, gán vai trò (Vận hành, Bảo trì, Admin).
* **Phân quyền & Cấu hình:** Quản lý quyền truy cập hệ thống.

---

## 5. Yêu cầu kỹ thuật thực hiện cho Claude
* **Giai đoạn 1:** Xây dựng cấu trúc Cơ sở dữ liệu (Database Schema) cho Máy móc, Nhân viên, Sự cố (Incidents), Nhóm chat (Chat Groups), Lịch sử bảo trì (Maintenance Logs).
* **Giai đoạn 2:** Xây dựng Web Admin (CRUD máy, nhân viên, chức năng sinh mã QR).
* **Giai đoạn 3:** Xây dựng Mobile App (Luồng quét QR, giao diện phong cách Zalo, luồng bắn thông tin lỗi vào nhóm chat, luồng bấm Nhận việc - Tính thời gian - Hoàn thành sửa chữa).