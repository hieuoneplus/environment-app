# Hướng Dẫn Bật GPS và Quyền Vị Trí

## 📱 Trên Mobile App (Android/iOS)

### Android

1. **Bật GPS:**
   - Vào **Cài đặt** → **Vị trí** (hoặc **Location**)
   - Bật **Vị trí** (Location Services)
   - Chọn độ chính xác cao (High accuracy) nếu có

2. **Cấp quyền cho app:**
   - Vào **Cài đặt** → **Ứng dụng** → **Green App**
   - Chọn **Quyền** (Permissions)
   - Tìm **Vị trí** (Location) → Chọn **Cho phép khi dùng ứng dụng** (Allow only while using the app)

### iOS

1. **Bật Location Services:**
   - Vào **Settings (Cài đặt)** → **Privacy & Security (Quyền riêng tư)** → **Location Services (Dịch vụ định vị)**
   - Bật **Location Services**

2. **Cấp quyền cho app:**
   - Trong **Location Services**, tìm **Green App**
   - Chọn **While Using the App** hoặc **Always** (khuyến nghị: While Using the App)

## 💻 Trên Web Browser (Máy tính/Điện thoại)

### Chrome/Edge (Desktop)

1. Click vào biểu tượng **🔒** hoặc **📍** ở thanh địa chỉ (bên trái URL)
2. Tìm mục **Location** (Vị trí)
3. Chọn **Allow** (Cho phép)
4. Nếu đã từ chối trước đó:
   - Click **Reset permissions** (Đặt lại quyền)
   - Refresh trang và chọn **Allow** khi được hỏi

### Firefox (Desktop)

1. Click vào biểu tượng **🔒** ở thanh địa chỉ
2. Tìm **Location** → Chọn **Allow**
3. Hoặc vào **Settings** → **Privacy & Security** → **Permissions** → **Location** → Thêm site vào danh sách cho phép

### Safari (Desktop)

1. **Safari** → **Settings** → **Websites** → **Location Services**
2. Tìm site của bạn và chọn **Allow**

### Mobile Browser (Chrome/Safari trên điện thoại)

1. Khi trang web yêu cầu quyền vị trí, chọn **Allow** hoặc **Cho phép**
2. Nếu đã từ chối:
   - **Chrome Android:** Settings → Site settings → Location → Tìm site → Allow
   - **Safari iOS:** Settings → Safari → Location Services → Allow

## ⚠️ Lưu Ý

- **Máy tính:** Cần có GPS hardware hoặc dùng WiFi/Network location (kém chính xác hơn)
- **Điện thoại:** Đảm bảo GPS đã bật trong Settings
- **Privacy:** App chỉ sử dụng vị trí khi bạn đang dùng tính năng Maps/Green Move
- **Battery:** GPS có thể tốn pin, nên tắt khi không dùng

## 🔧 Troubleshooting

### "Không thể lấy vị trí" trên Web

1. Kiểm tra URL có phải HTTPS không (HTTP không hỗ trợ Geolocation)
2. Thử refresh trang và cho phép quyền lại
3. Kiểm tra browser settings có block location không

### "Không thể lấy vị trí" trên Mobile

1. Đảm bảo GPS đã bật trong Settings
2. Kiểm tra app có quyền Location trong Settings
3. Thử tắt/bật Location Services
4. Restart app

### Vị trí không chính xác

- Đợi vài giây để GPS lock vị trí
- Di chuyển ra nơi có tín hiệu tốt hơn (ngoài trời)
- Bật "High accuracy" mode trên Android
