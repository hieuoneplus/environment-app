# ✅ Checklist Deploy App

## Trước khi Deploy

- [ ] Backend đã được deploy và có HTTPS
- [ ] API URL trong `environment.prod.ts` đã được cập nhật
- [ ] Backend CORS đã config để cho phép requests từ app
- [ ] Đã test tất cả tính năng trên web browser

## Android

- [ ] Đã cài Android Studio
- [ ] Đã cài Java JDK 11+
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `npm run build:prod`
- [ ] Đã chạy `npx cap add android` (lần đầu)
- [ ] Đã chạy `npx cap sync android`
- [ ] Đã mở Android Studio và Gradle sync thành công
- [ ] Đã test trên emulator/device
- [ ] Đã build APK/AAB thành công
- [ ] Permissions đã được config trong AndroidManifest.xml

## iOS (chỉ macOS)

- [ ] Đã cài Xcode từ App Store
- [ ] Đã cài CocoaPods: `sudo gem install cocoapods`
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `npm run build:prod`
- [ ] Đã chạy `npx cap add ios` (lần đầu)
- [ ] Đã chạy `npx cap sync ios`
- [ ] Đã chạy `pod install` trong `ios/App`
- [ ] Đã mở Xcode và build thành công
- [ ] Đã config Signing & Capabilities với Team
- [ ] Đã test trên simulator/device
- [ ] Permissions đã được config trong Info.plist

## Upload lên Stores

### Google Play
- [ ] Đã tạo Google Play Developer account
- [ ] Đã tạo app mới trong Play Console
- [ ] Đã build AAB file
- [ ] Đã upload AAB
- [ ] Đã điền đầy đủ thông tin app
- [ ] Đã submit để review

### Apple App Store
- [ ] Đã có Apple Developer Program ($99/năm)
- [ ] Đã tạo app trong App Store Connect
- [ ] Đã archive app trong Xcode
- [ ] Đã upload qua Xcode/Transporter
- [ ] Đã điền đầy đủ thông tin app
- [ ] Đã submit để review
