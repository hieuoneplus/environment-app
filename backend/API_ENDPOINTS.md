# API Endpoints Documentation

## Authentication

### POST /api/auth/register
Đăng ký user mới
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "address": "123 Đường ABC",
  "gender": "male",
  "dob": "2000-01-01"
}
```

### POST /api/auth/login
Đăng nhập
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response: UserProfileDTO với đầy đủ thông tin user

## Home Dashboard

### GET /api/home/dashboard?userId={userId}
Lấy thông tin dashboard cho màn hình Home
Response: HomeDashboardDTO
- userName
- greeting
- greenPoints
- rank
- streak
- todayHabits[]
- nearbyLocations[]

## Habits

### GET /api/habits
Lấy danh sách tất cả habits

### POST /api/habits/{habitId}/toggle?userId={userId}
Toggle trạng thái completed của habit trong ngày hôm nay

## Rewards

### GET /api/rewards?userId={userId}
Lấy danh sách tất cả rewards

### GET /api/rewards/category/{category}?userId={userId}
Lấy rewards theo category (all, voucher, plant)

### POST /api/rewards/{rewardId}/exchange?userId={userId}
Đổi điểm lấy reward

## Activities (Camera/Scan)

### POST /api/activities?userId={userId}
Ghi nhận hoạt động (scan ảnh, check-in, etc.)
```json
{
  "activityType": "SCAN",
  "detectedObject": "water",
  "imageUrl": "base64_or_url",
  "habitId": null,
  "locationId": null
}
```

Activity Types:
- SCAN: Quét ảnh từ camera
- HABIT: Hoàn thành habit
- LOCATION_CHECKIN: Check-in tại địa điểm

## Locations

### GET /api/locations/nearby?latitude={lat}&longitude={lng}
Lấy danh sách địa điểm gần đây (có thể bỏ qua lat/lng để lấy tất cả)

### GET /api/locations/{locationId}
Lấy thông tin chi tiết một địa điểm

## Profile

### GET /api/profile?userId={userId}
Lấy thông tin profile user

### PUT /api/profile?userId={userId}
Cập nhật thông tin profile
```json
{
  "name": "Tên mới",
  "address": "Địa chỉ mới",
  "gender": "female",
  "dob": "2000-01-01",
  "avatarUrl": "url_to_avatar"
}
```

## Data Models

### UserProfileDTO
- id (UUID)
- name
- email
- address
- gender
- dob (LocalDate)
- greenPoints
- rank
- streak
- avatarUrl

### HabitDTO
- id (UUID)
- name
- points
- description
- iconName
- completed (boolean)

### RewardDTO
- id (UUID)
- name
- points
- category
- imageUrl
- imageEmoji
- description
- canAfford (boolean)

### LocationDTO
- id (UUID)
- name
- latitude
- longitude
- pointsAvailable
- description
- address
- distance (formatted string)

### HomeDashboardDTO
- userName
- greeting
- greenPoints
- rank
- streak
- todayHabits (HabitDTO[])
- nearbyLocations (LocationDTO[])
