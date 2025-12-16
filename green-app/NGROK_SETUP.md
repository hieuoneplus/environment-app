# Hướng dẫn sử dụng Ngrok với Frontend

## Vấn đề
Khi sử dụng ngrok để expose frontend, gặp lỗi:
```
Blocked request. This host ("xxx.ngrok-free.app") is not allowed.
```

## Giải pháp

### Cách 1: Sử dụng flag --disable-host-check (Nhanh nhất)

```bash
ng serve --host 0.0.0.0 --disable-host-check
```

Hoặc thêm vào `package.json`:
```json
"start:ngrok": "ng serve --host 0.0.0.0 --disable-host-check"
```

Sau đó chạy:
```bash
npm run start:ngrok
```

### Cách 2: Cấu hình trong angular.json (Đã thêm)

Đã cấu hình `allowedHosts` trong `angular.json` để cho phép:
- `.ngrok.io`
- `.ngrok-free.app`
- `.ngrok.app`

Chỉ cần chạy:
```bash
npm start
```

### Cách 3: Sử dụng vite.config.ts (Nếu cách 2 không work)

Nếu Angular 20 sử dụng Vite, có thể cần file `vite.config.ts` (đã tạo).

## Các bước sử dụng Ngrok

### 1. Cài đặt Ngrok
```bash
# Download từ https://ngrok.com/download
# Hoặc dùng npm
npm install -g ngrok
```

### 2. Chạy Frontend với host 0.0.0.0
```bash
cd green-app
npm run start:ngrok
# Hoặc
ng serve --host 0.0.0.0 --disable-host-check
```

Frontend sẽ chạy tại: `http://localhost:4200`

### 3. Expose qua Ngrok
```bash
ngrok http 4200
```

Ngrok sẽ tạo URL như: `https://632b0639bca1.ngrok-free.app`

### 4. Truy cập
Mở URL từ ngrok trong browser hoặc trên điện thoại.

## Lưu ý

1. **Backend cũng cần expose:** Nếu backend chạy localhost:8080, cũng cần ngrok cho backend
2. **CORS:** Backend phải cho phép requests từ ngrok URL
3. **API URL:** Cập nhật `environment.ts` để dùng ngrok URL của backend
4. **HTTPS:** Ngrok tự động cung cấp HTTPS

## Cấu hình Backend cho Ngrok

Nếu backend cũng cần expose qua ngrok:

1. Chạy backend: `mvn spring-boot:run`
2. Expose backend: `ngrok http 8080`
3. Cập nhật `environment.ts`:
```typescript
apiBase: 'https://your-backend-ngrok-url.ngrok-free.app'
```

## Troubleshooting

### Lỗi: "Blocked request"
- Giải pháp: Đã cấu hình `allowedHosts` trong angular.json
- Hoặc dùng flag `--disable-host-check`

### Lỗi: "Connection refused"
- Kiểm tra frontend có đang chạy không
- Kiểm tra port có đúng không (4200)

### Lỗi: "CORS error"
- Backend phải cho phép ngrok URL trong CORS config
- Sửa `BackendApplication.java`:
```java
.allowedOrigins("*") // Hoặc cụ thể ngrok URL
```
