# Hướng dẫn Deploy App lên Android và iOS

## Yêu cầu

### Cho Android:
- Node.js và npm
- Java JDK 11 hoặc cao hơn
- Android Studio (với Android SDK)
- Gradle

### Cho iOS (chỉ trên macOS):
- Node.js và npm
- Xcode (từ App Store)
- CocoaPods: `sudo gem install cocoapods`

## Bước 1: Cấu hình Environment Production

1. Sửa file `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  apiBase: 'https://your-backend-url.com', // URL backend production
  production: true
};
```

**Lưu ý:** Thay `your-backend-url.com` bằng URL backend thực tế của bạn (ví dụ: `https://api.yourapp.com`)

## Bước 2: Build Production

```bash
cd green-app
npm run build:prod
```

Build sẽ tạo thư mục `dist/green-app/browser/` chứa các file production.

## Bước 3: Cài đặt Capacitor (nếu chưa có)

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios
```

## Bước 4: Khởi tạo Capacitor Platforms

### Android:
```bash
npm run cap:add:android
```

### iOS (chỉ trên macOS):
```bash
npm run cap:add:ios
```

## Bước 5: Sync Code vào Native Projects

Sau mỗi lần build, cần sync code:
```bash
npm run cap:sync
```

Lệnh này sẽ:
- Copy web assets vào native projects
- Update native dependencies
- Sync plugin configurations

## Bước 6: Build và Deploy

### Android

#### 6.1. Mở Android Studio
```bash
npm run cap:open:android
```

#### 6.2. Trong Android Studio:
1. Đợi Gradle sync hoàn tất
2. Chọn device/emulator hoặc kết nối điện thoại Android qua USB
3. Click "Run" (▶️) hoặc `Shift + F10`

#### 6.3. Build APK để cài đặt thủ công:
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. APK sẽ được tạo tại: `android/app/build/outputs/apk/debug/app-debug.apk`
3. Copy APK vào điện thoại và cài đặt

#### 6.4. Build AAB để upload lên Google Play:
1. **Build** → **Generate Signed Bundle / APK**
2. Chọn **Android App Bundle**
3. Tạo keystore (nếu chưa có)
4. AAB sẽ được tạo tại: `android/app/build/outputs/bundle/release/app-release.aab`
5. Upload AAB lên Google Play Console

### iOS

#### 6.1. Mở Xcode
```bash
npm run cap:open:ios
```

#### 6.2. Trong Xcode:
1. Chọn scheme: **Green App**
2. Chọn device/simulator
3. Click **Run** (▶️) hoặc `Cmd + R`

#### 6.3. Build cho TestFlight/App Store:
1. Chọn **Any iOS Device** hoặc device cụ thể
2. **Product** → **Archive**
3. Sau khi archive xong, cửa sổ Organizer sẽ mở
4. Click **Distribute App**
5. Chọn distribution method:
   - **App Store Connect** (để upload lên App Store)
   - **Ad Hoc** (để test trên thiết bị cụ thể)
   - **Enterprise** (cho enterprise distribution)
   - **Development** (để test)

## Bước 7: Cấu hình Permissions

### Android - AndroidManifest.xml
File: `android/app/src/main/AndroidManifest.xml`

Đảm bảo có các permissions:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS - Info.plist
File: `ios/App/App/Info.plist`

Thêm các keys:
```xml
<key>NSCameraUsageDescription</key>
<string>App cần quyền camera để chụp ảnh và quét mã</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>App cần quyền truy cập ảnh để lưu ảnh đã chụp</string>
```

## Bước 8: Cấu hình App Icons và Splash Screen

### Android:
- Icon: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Hoặc dùng Android Studio: **File** → **New** → **Image Asset**

### iOS:
- Icon: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Hoặc dùng Xcode: Chọn project → **App Icon**

## Bước 9: Test trên Thiết bị Thật

### Android:
1. Bật **Developer Options** trên điện thoại
2. Bật **USB Debugging**
3. Kết nối qua USB
4. Chạy: `npm run cap:run:android`

### iOS:
1. Cần Apple Developer Account (free hoặc paid)
2. Trong Xcode: **Signing & Capabilities** → Chọn team
3. Kết nối iPhone qua USB
4. Chọn device và Run

## Bước 10: Deploy lên Stores

### Google Play Store:
1. Tạo tài khoản Google Play Developer ($25 một lần)
2. Tạo app mới trong Google Play Console
3. Upload AAB file
4. Điền thông tin app (mô tả, screenshots, etc.)
5. Submit để review

### Apple App Store:
1. Cần Apple Developer Program ($99/năm)
2. Tạo app trong App Store Connect
3. Upload qua Xcode hoặc Transporter
4. Điền thông tin app
5. Submit để review

## Lưu ý quan trọng

1. **API URL**: Đảm bảo backend production đã được deploy và có HTTPS
2. **CORS**: Backend phải cho phép requests từ domain của app
3. **Permissions**: Cấu hình đúng permissions cho camera, storage, etc.
4. **Keystore**: Lưu keystore file an toàn (cần để update app sau này)
5. **Version**: Tăng version number mỗi lần release mới

## Troubleshooting

### Lỗi: "Could not find or load main class"
- Giải pháp: Chạy `npm run cap:sync` lại

### Lỗi: "Gradle sync failed"
- Giải pháp: Mở Android Studio → **File** → **Invalidate Caches / Restart**

### Lỗi: "Code signing is required"
- Giải pháp: Trong Xcode, chọn team trong Signing & Capabilities

### Lỗi: "Network request failed"
- Giải pháp: Kiểm tra API URL trong environment.prod.ts và đảm bảo backend đang chạy

## Scripts hữu ích

```bash
# Build và sync
npm run build:prod && npm run cap:sync

# Build, sync và mở Android Studio
npm run build:prod && npm run cap:sync && npm run cap:open:android

# Build, sync và mở Xcode
npm run build:prod && npm run cap:sync && npm run cap:open:ios
```
