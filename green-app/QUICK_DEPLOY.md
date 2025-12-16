# Hướng dẫn Deploy Nhanh

## Chuẩn bị

### 1. Cài đặt dependencies
```bash
cd green-app
npm install
```

### 2. Cấu hình API URL Production
Sửa file `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  apiBase: 'https://your-backend-url.com', // URL backend thực tế
  production: true
};
```

## Deploy Android

### Bước 1: Cài đặt Capacitor Android
```bash
npm install @capacitor/android
npx cap add android
```

### Bước 2: Build và Sync
```bash
npm run build:prod
npx cap sync
```

### Bước 3: Mở Android Studio
```bash
npx cap open android
```

### Bước 4: Build APK
1. Trong Android Studio: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. APK sẽ ở: `android/app/build/outputs/apk/debug/app-debug.apk`
3. Copy APK vào điện thoại và cài đặt

## Deploy iOS (chỉ trên macOS)

### Bước 1: Cài đặt CocoaPods
```bash
sudo gem install cocoapods
```

### Bước 2: Cài đặt Capacitor iOS
```bash
npm install @capacitor/ios
npx cap add ios
```

### Bước 3: Build và Sync
```bash
npm run build:prod
npx cap sync
```

### Bước 4: Mở Xcode
```bash
npx cap open ios
```

### Bước 5: Build và Run
1. Chọn device/simulator
2. Click **Run** (▶️)

## Lưu ý

- **API URL**: Phải là HTTPS trong production
- **Backend**: Phải đã deploy và có CORS config đúng
- **Permissions**: Camera, Storage đã được config trong `capacitor.config.ts`
