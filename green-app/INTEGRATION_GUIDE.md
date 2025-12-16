# Hướng dẫn tích hợp Frontend với Backend

## Đã hoàn thành

### 1. Services đã tạo
- `AuthService` - Quản lý authentication và user state
- `HomeService` - Lấy dữ liệu dashboard
- `HabitService` - Quản lý habits
- `RewardService` - Quản lý rewards
- `ActivityService` - Ghi nhận hoạt động (camera/scan)
- `ProfileService` - Quản lý profile user

### 2. Components đã cập nhật
- **HomePage**: Tích hợp với API để load dashboard, toggle habits
- **CameraPage**: Gửi activity lên backend khi scan/chụp ảnh
- **RewardPage**: Load rewards từ API và đổi điểm
- **MePage**: Load profile từ API
- **LoginPage**: Đã có sẵn, chỉ cần kiểm tra lại

## Cách sử dụng

### 1. Đảm bảo Backend đang chạy
```bash
cd backend
mvn spring-boot:run
```

Backend sẽ chạy tại `http://localhost:8080`

### 2. Chạy Frontend
```bash
cd green-app
npm install  # Nếu chưa install
npm start
```

### 3. Test Flow

#### Đăng ký/Đăng nhập
1. Mở app, đi đến trang Login
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Sau khi đăng nhập thành công, user sẽ được lưu trong localStorage

#### Home Page
- Tự động load dashboard khi vào trang
- Click checkbox để toggle habit (tự động cộng/trừ điểm)
- Xem nearby locations

#### Camera Page
- Chụp ảnh hoặc chọn thủ công
- Click "Xác nhận và nhận điểm" để gửi activity lên backend
- Điểm sẽ được cập nhật tự động

#### Reward Page
- Xem danh sách rewards
- Lọc theo category
- Click "ĐỔI NGAY" để đổi điểm lấy reward

#### Me Page
- Xem thông tin profile
- Xem điểm và streak
- Logout

## Lưu ý

1. **User ID**: Tất cả API calls cần `userId` từ `AuthService.currentUser.id`
2. **Error Handling**: Các component đã có error handling cơ bản với toast messages
3. **Loading States**: Các component hiển thị loading khi đang fetch data
4. **RxJS**: Đã sử dụng `firstValueFrom` thay vì `toPromise()` (deprecated)

## API Endpoints được sử dụng

- `GET /api/home/dashboard?userId={id}` - Dashboard data
- `POST /api/habits/{habitId}/toggle?userId={id}` - Toggle habit
- `GET /api/rewards?userId={id}` - Get all rewards
- `GET /api/rewards/category/{category}?userId={id}` - Get rewards by category
- `POST /api/rewards/{rewardId}/exchange?userId={id}` - Exchange reward
- `POST /api/activities?userId={id}` - Record activity
- `GET /api/profile?userId={id}` - Get profile
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

## Troubleshooting

### Lỗi CORS
- Đảm bảo backend đã cấu hình CORS (đã có trong BackendApplication.java)

### Lỗi 404
- Kiểm tra backend có đang chạy không
- Kiểm tra `environment.apiBase` trong `green-app/src/environments/environment.ts`

### Lỗi Authentication
- Kiểm tra user đã đăng nhập chưa (localStorage có 'user' không)
- Nếu chưa, redirect về login page

### Dữ liệu không load
- Kiểm tra console để xem error message
- Đảm bảo backend database đã có dữ liệu (DataInitializer sẽ tự động seed)
