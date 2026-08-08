# TBS Mây Móc - Hệ Thống Phản Hồi Chất Lượng CLSK

Đây là một hệ thống quản lý và phản hồi chất lượng toàn diện dành cho các nhà máy dệt và công nghiệp. Hệ thống bao gồm ba ứng dụng chính: một cổng web cho nhân viên, một bảng điều khiển quản trị, và một ứng dụng di động cho công nhân trên sàn.

## 🏢 Tổng Quan Dự Án

Dự án này gồm ba ứng dụng:

1. **Landing Portal** (`landing-portal/`) - Cổng web cho nhân viên
   - Xây dựng bằng Next.js 16
   - Giao diện người dùng với Tailwind CSS v4
   - Triển khai trên Cloudflare Workers
   - Cơ sở dữ liệu: Prisma + D1 (Cloudflare)

2. **Web Admin** (`web-admin/`) - Bảng điều khiển quản trị
   - Next.js 16 + React 19
   - Quản lý danh mục, nhân viên, nhiệm vụ
   - API endpoints cho mobile app
   - Cơ sở dữ liệu: Prisma + SQLite/D1

3. **Mobile App** (`mobile-app/`) - Ứng dụng di động
   - React Native (Expo)
   - Hỗ trợ iOS/Android/Web
   - Giao diện hiện đại với Expo UI
   - Thông báo push, xử lý ảnh

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v18.0.0 hoặc cao hơn
- **npm**: v8.0.0 hoặc cao hơn
- **Git**: cho quản lý phiên bản
- **Wrangler CLI**: cho Cloudflare Workers (v4.118.0+)
- **Expo CLI**: cho mobile app (nếu phát triển mobile)

## 🚀 Cài Đặt và Chạy Ứng Dụng

### Cài Đặt Toàn Bộ Dự Án

```bash
# Clone repository
git clone <repository-url>
cd KG1

# Cài đặt dependencies cho landing-portal
cd landing-portal
npm install
cd ..
```

### Chạy Landing Portal (Cổng Web)

```bash
cd landing-portal

# Chạy development server
npm run dev

# Truy cập tại http://localhost:3000
```

### Chạy Web Admin (Bảng Điều Khiển)

```bash
cd web-admin

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Truy cập tại http://localhost:3000
```

### Chạy Mobile App (Ứng Dụng Di Động)

```bash
cd mobile-app

# Cài đặt dependencies
npm install

# Chạy trên web
npm run web

# Hoặc chạy trên Android
npm run android

# Hoặc chạy trên iOS
npm run ios
```

## 🏗️ Cấu Trúc Dự Án

```
KG1/
├── landing-portal/          # Cổng web chính
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── db/             # Database setup
│   │   ├── lib/            # Utility functions
│   │   └── generated/      # Prisma generated types
│   ├── prisma/             # Prisma schema
│   ├── public/             # Static assets
│   ├── scripts/            # Build scripts
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── wrangler.jsonc      # Cloudflare configuration
│
├── web-admin/              # Bảng điều khiển quản trị
│   ├── src/
│   │   ├── app/            # Next.js routes
│   │   ├── components/     # React components
│   │   ├── lib/            # Utility functions
│   │   └── generated/      # Prisma generated types
│   ├── prisma/             # Database schema
│   ├── public/             # Static files
│   └── package.json
│
├── mobile-app/             # Ứng dụng React Native
│   ├── src/
│   │   ├── app/            # Expo Router screens
│   │   └── lib/            # Utilities
│   ├── assets/             # Images, fonts
│   ├── app.json            # Expo config
│   └── package.json
│
├── public/                 # Shared public assets
├── package.json            # Root package.json
├── wrangler.jsonc          # Root Cloudflare config
└── README.md               # This file
```

## 🗄️ Cơ Sở Dữ Liệu

### Prisma Models

Hệ thống sử dụng Prisma ORM để quản lý cơ sở dữ liệu. Các model chính:

- **User**: Thông tin người dùng (nhân viên, quản trị)
- **Category**: Danh mục sản phẩm/vấn đề
- **QualityIssue**: Báo cáo vấn đề chất lượng
- **MaintenanceTask**: Nhiệm vụ bảo trì
- **Submission**: Gửi báo cáo từ mobile app
- Và nhiều model khác...

### Migrate Database

```bash
cd landing-portal

# Tạo migration
npx prisma migrate dev --name <migration-name>

# Tạo seed data (nếu có)
npx prisma db seed
```

## 🔐 Biến Môi Trường

### Landing Portal (`.env.local`)

```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
JWT_SECRET=your_jwt_secret
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### Web Admin (`.env.local`)

```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
JWT_SECRET=your_jwt_secret
```

### Mobile App (`.env`)

```
API_URL=http://localhost:3000/api
ENV=development
```

## 📦 Build và Deploy

### Build Landing Portal

```bash
cd landing-portal

# Build cho Cloudflare
npm run cf:build

# Preview build
npm run cf:preview

# Deploy lên Cloudflare
npm run cf:deploy
```

### Build Web Admin

```bash
cd web-admin

# Production build
npm run build

# Chạy production server
npm run start
```

### Build Mobile App

```bash
cd mobile-app

# Build APK (Android)
eas build --platform android

# Build IPA (iOS)
eas build --platform ios
```

## 🧪 Testing

### Lint Code

```bash
# Landing Portal
cd landing-portal
npm run lint

# Web Admin
cd web-admin
npm run lint

# Mobile App
cd mobile-app
npm run lint
```

## 🔄 Deployment Architecture

### Cloudflare Workers

Landing Portal được deploy trên:
- **Edge Network**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite trên edge)
- **Storage**: Cloudflare R2 (object storage)
- **Cache**: Cloudflare KV (key-value storage)

### Web Admin

- **Hosting**: Cloudflare Pages / Workers
- **Database**: D1 hoặc external database
- **CI/CD**: GitHub Actions (`.github/workflows/`)

## 📚 API Documentation

### Main Endpoints

#### Landing Portal
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/issues` - Lấy danh sách vấn đề
- `POST /api/issues` - Tạo vấn đề mới
- `GET /api/categories` - Lấy danh mục

#### Web Admin
- `GET /api/categories` - Quản lý danh mục
- `GET /api/employees` - Quản lý nhân viên
- `GET /api/mobile/*` - API cho mobile app

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Expo** - Cross-platform mobile

### Backend
- **Next.js API Routes** - Backend API
- **Prisma** - ORM
- **SQLite/D1** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### DevOps
- **Cloudflare Workers** - Serverless compute
- **Cloudflare Pages** - Static hosting
- **GitHub Actions** - CI/CD
- **Wrangler** - CLI tool

## 🤝 Contributing

1. Tạo một branch mới: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push tới branch: `git push origin feature/your-feature`
4. Tạo Pull Request

## 📝 Commit Convention

Theo Conventional Commits:
- `feat:` Tính năng mới
- `fix:` Sửa lỗi
- `docs:` Thay đổi documentation
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Refactoring code
- `perf:` Performance improvements
- `test:` Adding tests
- `chore:` Dependency updates, build scripts

Ví dụ:
```
git commit -m "feat: add user authentication to landing portal"
git commit -m "fix: CSS import order - replace @import tailwindcss with @tailwind directives"
```

## 📖 Dokumentasi Thêm

- [Landing Portal README](./landing-portal/README.md)
- [Web Admin README](./web-admin/README.md)
- [Mobile App README](./mobile-app/README.md)
- [Agents Documentation](./landing-portal/AGENTS.md)

## 🐛 Troubleshooting

### CSS Build Error

Nếu gặp lỗi: "Parsing CSS source code failed" liên quan đến `@import`

**Giải pháp**: Đảm bảo tất cả `@import` statements được đặt ở đầu file CSS, trước các rules khác.

```css
/* ✅ Đúng */
@import url('...');
@tailwind base, components, utilities;

/* ❌ Sai */
@tailwind base, components, utilities;
@import url('...');
```

### Database Connection Error

```bash
# Reset database
cd landing-portal
npx prisma migrate reset

# Hoặc nếu dùng D1
wrangler d1 execute <database-name> --file=./schema.sql
```

### Port Already in Use

Nếu port 3000 đang sử dụng:

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc chạy trên port khác
npm run dev -- -p 3001
```

## 📞 Support

Liên hệ: [Email hoặc Discord link]

## 📄 License

[Your License Here]

---

**Last Updated**: August 8, 2026
**Version**: 1.0.0
