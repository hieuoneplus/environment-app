# Tóm tắt tích hợp Frontend - Backend

## ✅ Đã hoàn thành

### Backend (Spring Boot)
1. **Entities**: User, Habit, UserHabit, Reward, UserReward, Location, Activity
2. **Repositories**: Tất cả repositories với queries cần thiết
3. **Services**: HomeService, HabitService, RewardService, ActivityService, LocationService, ProfileService, PointsService
4. **Controllers**: HomeController, HabitController, RewardController, ActivityController, LocationController, ProfileController
5. **DTOs**: Tất cả DTOs cho API responses
6. **Data Initialization**: DataInitializer tự động seed dữ liệu mẫu

### Frontend (Ionic Angular)
1. **Services**: 
   - AuthService - Quản lý authentication
   - HomeService - Dashboard API
   - HabitService - Habits API
   - RewardService - Rewards API
   - ActivityService - Camera/Scan API
   - ProfileService - Profile API

2. **Components đã tích hợp**:
   - HomePage - Load dashboard, toggle habits
   - CameraPage - Submit activities
   - RewardPage - Load và exchange rewards
   - MePage - Load profile
   - LoginPage - Đã có sẵn

## 🔧 Cách chạy

### Backend
```bash
cd backend
mvn spring-boot:run
```
Backend chạy tại: http://localhost:8080

### Frontend
```bash
cd green-app
npm install  # Nếu chưa
npm start
```
Frontend chạy tại: http://localhost:4200

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Home Dashboard
- `GET /api/home/dashboard?userId={id}` - Lấy dashboard data

### Habits
- `GET /api/habits` - Lấy tất cả habits
- `POST /api/habits/{habitId}/toggle?userId={id}` - Toggle habit

### Rewards
- `GET /api/rewards?userId={id}` - Lấy tất cả rewards
- `GET /api/rewards/category/{category}?userId={id}` - Lấy rewards theo category
- `POST /api/rewards/{rewardId}/exchange?userId={id}` - Đổi reward

### Activities
- `POST /api/activities?userId={id}` - Ghi nhận activity (scan, check-in, etc.)

### Profile
- `GET /api/profile?userId={id}` - Lấy profile
- `PUT /api/profile?userId={id}` - Cập nhật profile

### Locations
- `GET /api/locations/nearby?latitude={lat}&longitude={lng}` - Lấy nearby locations

## 🎯 Flow hoạt động

1. **Đăng nhập/Đăng ký** → Lưu user vào localStorage
2. **Home Page** → Load dashboard với habits và locations
3. **Toggle Habit** → Gọi API → Cập nhật điểm → Reload dashboard
4. **Camera/Scan** → Chụp ảnh → Submit activity → Nhận điểm
5. **Rewards** → Load rewards → Exchange → Trừ điểm
6. **Profile** → Load và hiển thị thông tin user

## ⚠️ Lưu ý quan trọng

1. **User ID**: Tất cả API calls cần `userId` từ `AuthService.currentUser.id`
2. **UUID Format**: Backend sử dụng UUID, frontend gửi dưới dạng string (Spring Boot tự convert)
3. **Error Handling**: Các component đã có error handling với toast messages
4. **Loading States**: Các component hiển thị loading khi fetch data
5. **RxJS**: Sử dụng `firstValueFrom` thay vì `toPromise()` (deprecated)

## 🐛 Troubleshooting

### Lỗi CORS
- Backend đã cấu hình CORS trong `BackendApplication.java`
- Nếu vẫn lỗi, kiểm tra `allowedOrigins` trong CORS config

### Lỗi 404
- Kiểm tra backend có đang chạy không
- Kiểm tra `environment.apiBase` trong frontend

### Lỗi Authentication
- Kiểm tra localStorage có 'user' không
- Nếu không, redirect về login

### Dữ liệu không load
- Kiểm tra console để xem error
- Đảm bảo database đã có dữ liệu (DataInitializer tự seed)

## 📝 Next Steps (Optional)

1. Thêm JWT authentication thay vì localStorage
2. Thêm refresh token mechanism
3. Thêm image upload service cho camera
4. Thêm push notifications
5. Thêm offline support với service workers
6. Thêm unit tests cho services
