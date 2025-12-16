# 🚀 Hướng dẫn Deploy App lên Android & iOS

## 📋 Yêu cầu

### Android:
- ✅ Node.js (v16+)
- ✅ Java JDK 11+
- ✅ Android Studio
- ✅ Android SDK

### iOS (chỉ macOS):
- ✅ Node.js (v16+)
- ✅ Xcode (từ App Store)
- ✅ CocoaPods: `sudo gem install cocoapods`

## 🔧 Bước 1: Cấu hình

### 1.1. Cập nhật API URL Production

Sửa file `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  apiBase: 'https://your-backend-url.com', // ⚠️ Thay bằng URL backend thực tế
  production: true
};
```

**⚠️ QUAN TRỌNG:** 
- URL phải là HTTPS (không phải HTTP)
- Backend phải có CORS config cho phép requests từ app
- Ví dụ: `https://api.yourapp.com` hoặc `https://backend.yourapp.com`

### 1.2. Cài đặt Capacitor (nếu chưa có)

```bash
cd green-app
npm install @capacitor/cli @capacitor/core
npm install @capacitor/android  # Cho Android
npm install @capacitor/ios      # Cho iOS (chỉ macOS)
```

## 📱 Deploy Android

### Cách 1: Sử dụng Script (Nhanh)

```bash
# Trên Linux/Mac
chmod +x deploy-android.sh
./deploy-android.sh

# Trên Windows (PowerShell)
npm run build:prod
npx cap sync android
npx cap open android
```

### Cách 2: Thủ công

```bash
# 1. Build production
npm run build:prod

# 2. Thêm Android platform (chỉ lần đầu)
npx cap add android

# 3. Sync code
npx cap sync android

# 4. Mở Android Studio
npx cap open android
```

### Trong Android Studio:

1. **Đợi Gradle sync** (lần đầu có thể mất vài phút)

2. **Build APK để test:**
   - **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - APK sẽ ở: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Copy vào điện thoại và cài đặt

3. **Build AAB để upload Google Play:**
   - **Build** → **Generate Signed Bundle / APK**
   - Chọn **Android App Bundle**
   - Tạo keystore (lưu file này cẩn thận!)
   - AAB sẽ ở: `android/app/build/outputs/bundle/release/app-release.aab`

4. **Test trên thiết bị:**
   - Kết nối điện thoại qua USB
   - Bật USB Debugging trong Developer Options
   - Click **Run** (▶️) trong Android Studio

## 🍎 Deploy iOS (chỉ trên macOS)

### Cách 1: Sử dụng Script

```bash
chmod +x deploy-ios.sh
./deploy-ios.sh
```

### Cách 2: Thủ công

```bash
# 1. Cài CocoaPods (chỉ lần đầu)
sudo gem install cocoapods

# 2. Build production
npm run build:prod

# 3. Thêm iOS platform (chỉ lần đầu)
npx cap add ios

# 4. Sync code
npx cap sync ios

# 5. Install CocoaPods dependencies
cd ios/App
pod install
cd ../..

# 6. Mở Xcode
npx cap open ios
```

### Trong Xcode:

1. **Cấu hình Signing:**
   - Chọn project **Green App** trong sidebar
   - Tab **Signing & Capabilities**
   - Chọn **Team** (cần Apple Developer Account)
   - Xcode sẽ tự động tạo provisioning profile

2. **Chọn Device:**
   - Chọn iPhone/iPad simulator hoặc thiết bị thật

3. **Run:**
   - Click **Run** (▶️) hoặc `Cmd + R`

4. **Build cho TestFlight/App Store:**
   - Chọn **Any iOS Device**
   - **Product** → **Archive**
   - Sau khi archive: **Distribute App**
   - Chọn **App Store Connect** → **Upload**

## 🔐 Cấu hình Permissions

### Android - `android/app/src/main/AndroidManifest.xml`

Đảm bảo có:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS - `ios/App/App/Info.plist`

Thêm vào `<dict>`:
```xml
<key>NSCameraUsageDescription</key>
<string>App cần quyền camera để chụp ảnh và quét mã</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>App cần quyền truy cập ảnh để lưu ảnh đã chụp</string>
```

## 📦 Upload lên Stores

### Google Play Store

1. Tạo tài khoản [Google Play Developer](https://play.google.com/console) ($25 một lần)
2. Tạo app mới
3. Upload AAB file
4. Điền thông tin: mô tả, screenshots, icon, etc.
5. Submit để review (thường 1-3 ngày)

### Apple App Store

1. Cần [Apple Developer Program](https://developer.apple.com/programs/) ($99/năm)
2. Tạo app trong [App Store Connect](https://appstoreconnect.apple.com)
3. Upload qua Xcode hoặc [Transporter](https://apps.apple.com/app/transporter/id1450874784)
4. Điền thông tin app
5. Submit để review (thường 1-7 ngày)

## 🔄 Workflow thường dùng

### Mỗi lần update code:

```bash
# 1. Build
npm run build:prod

# 2. Sync
npx cap sync

# 3. Mở IDE
npx cap open android  # hoặc ios
```

### Scripts trong package.json:

```bash
npm run build:prod          # Build production
npm run cap:sync           # Sync với native projects
npm run cap:open:android   # Mở Android Studio
npm run cap:open:ios       # Mở Xcode
```

## ⚠️ Lưu ý quan trọng

1. **API URL**: Phải là HTTPS, không dùng HTTP
2. **Backend CORS**: Phải cho phép requests từ app
3. **Keystore**: Lưu file keystore an toàn (cần để update app)
4. **Version**: Tăng version mỗi lần release
5. **Testing**: Test kỹ trên thiết bị thật trước khi upload

## 🐛 Troubleshooting

### "Could not find or load main class"
```bash
npx cap sync
```

### "Gradle sync failed"
- Mở Android Studio → **File** → **Invalidate Caches / Restart**

### "Code signing is required" (iOS)
- Trong Xcode: Chọn Team trong Signing & Capabilities

### "Network request failed"
- Kiểm tra API URL trong `environment.prod.ts`
- Đảm bảo backend đang chạy và có HTTPS

### "Camera not working"
- Kiểm tra permissions trong AndroidManifest.xml và Info.plist
- Test trên thiết bị thật (không phải emulator)

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
- Console logs trong browser/device
- Backend logs
- Capacitor logs: `npx cap doctor`
