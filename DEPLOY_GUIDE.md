# Hướng dẫn Deploy Backend và Frontend lên Cloud

## Tổng quan

Hướng dẫn này sẽ giúp bạn deploy:
- **Backend**: Spring Boot (Java 17) lên cloud
- **Frontend**: Ionic Angular lên cloud
- **Database**: PostgreSQL (đã có trên Render)

## Các Platform được đề xuất

### 1. **Render** (Khuyến nghị - Dễ nhất, Free tier tốt)
- ✅ Free tier cho backend và frontend
- ✅ Tự động deploy từ GitHub
- ✅ Hỗ trợ Docker
- ✅ PostgreSQL đã có sẵn

### 2. **Railway** (Dễ, Free tier)
- ✅ Free tier $5/tháng
- ✅ Deploy nhanh
- ✅ Hỗ trợ Docker

### 3. **Heroku** (Ổn định, có phí)
- ⚠️ Không còn free tier
- ✅ Rất ổn định
- ✅ Dễ sử dụng

### 4. **AWS** (Mạnh mẽ, phức tạp)
- ⚠️ Phức tạp hơn
- ✅ Rất mạnh mẽ
- ✅ Có free tier

---

## Phương án 1: Deploy lên Render (Khuyến nghị)

### Bước 1: Chuẩn bị Backend

1. **Cập nhật `application.properties` để dùng environment variables:**

File đã được tạo: `backend/src/main/resources/application-prod.properties`

2. **Tạo file `render.yaml` cho Render:**

```yaml
services:
  - type: web
    name: green-app-backend
    env: java
    buildCommand: mvn clean package -DskipTests
    startCommand: java -jar target/*.jar
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: DATABASE_URL
        fromDatabase:
          name: environment_8es2
          property: connectionString
      - key: DATABASE_USERNAME
        fromDatabase:
          name: environment_8es2
          property: user
      - key: DATABASE_PASSWORD
        fromDatabase:
          name: environment_8es2
          property: password
      - key: PORT
        value: 8080
```

### Bước 2: Deploy Backend lên Render

1. **Đăng ký/Đăng nhập Render:**
   - Vào https://render.com
   - Đăng nhập bằng GitHub

2. **Tạo Web Service:**
   - Click "New +" → "Web Service"
   - Connect repository GitHub của bạn
   - Chọn repository và branch

3. **Cấu hình:**
   - **Name**: `green-app-backend`
   - **Environment**: `Java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
   - **Instance Type**: Free (hoặc Starter $7/tháng)

4. **Environment Variables:**
   ```
   SPRING_PROFILES_ACTIVE=prod
   DATABASE_URL=<từ database connection string>
   DATABASE_USERNAME=environment
   DATABASE_PASSWORD=<password từ database>
   PORT=8080
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Render sẽ tự động build và deploy
   - Chờ vài phút để build xong
   - Lấy URL: `https://green-app-backend.onrender.com`

### Bước 3: Deploy Frontend lên Render

1. **Cập nhật `environment.prod.ts`:**

```typescript
export const environment = {
  apiBase: 'https://green-app-backend.onrender.com', // URL backend vừa deploy
  production: true
};
```

2. **Tạo Static Site trên Render:**
   - Click "New +" → "Static Site"
   - Connect repository GitHub
   - Chọn folder: `green-app`

3. **Cấu hình:**
   - **Name**: `green-app-frontend`
   - **Build Command**: `npm install && npm run build:prod`
   - **Publish Directory**: `dist/green-app/browser`

4. **Deploy:**
   - Click "Create Static Site"
   - Render sẽ build và deploy
   - Lấy URL: `https://green-app-frontend.onrender.com`

---

## Phương án 2: Deploy với Docker (Railway/Heroku)

### Backend với Docker

1. **Build và test Docker image:**
```bash
cd backend
docker build -t green-app-backend .
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://... \
  -e DATABASE_USERNAME=... \
  -e DATABASE_PASSWORD=... \
  green-app-backend
```

2. **Deploy lên Railway:**
   - Vào https://railway.app
   - New Project → Deploy from GitHub
   - Chọn repository
   - Railway tự detect Dockerfile
   - Thêm Environment Variables:
     - `DATABASE_URL`
     - `DATABASE_USERNAME`
     - `DATABASE_PASSWORD`
     - `SPRING_PROFILES_ACTIVE=prod`

### Frontend với Docker

1. **Build và test:**
```bash
cd green-app
docker build -t green-app-frontend .
docker run -p 80:80 green-app-frontend
```

2. **Deploy lên Railway:**
   - Tương tự backend
   - Railway tự detect Dockerfile
   - Expose port 80

---

## Phương án 3: Deploy lên Vercel (Frontend) + Render (Backend)

### Frontend lên Vercel (Miễn phí, nhanh)

1. **Cài Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd green-app
vercel
```

3. **Hoặc qua GitHub:**
   - Vào https://vercel.com
   - Import repository
   - Framework Preset: Angular
   - Build Command: `npm run build:prod`
   - Output Directory: `dist/green-app/browser`

---

## Cấu hình CORS cho Production

### Backend - Cập nhật `BackendApplication.java`:

```java
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            String frontendUrl = System.getenv("FRONTEND_URL");
            if (frontendUrl == null) {
                frontendUrl = "https://green-app-frontend.onrender.com";
            }
            
            registry.addMapping("/**")
                    .allowedOrigins(frontendUrl)
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                    .allowedHeaders("*")
                    .exposedHeaders("*")
                    .maxAge(3600);
        }
    };
}
```

Thêm environment variable: `FRONTEND_URL=https://green-app-frontend.onrender.com`

---

## Checklist Deploy

### Backend:
- [ ] Database connection string đúng
- [ ] Environment variables đã set
- [ ] CORS cho phép frontend URL
- [ ] Build thành công
- [ ] Health check endpoint hoạt động
- [ ] API endpoints test được

### Frontend:
- [ ] `environment.prod.ts` có đúng backend URL
- [ ] Build production thành công
- [ ] Static files được serve đúng
- [ ] Routing hoạt động (Angular routes)
- [ ] API calls đến backend thành công

---

## Testing sau khi Deploy

### 1. Test Backend:
```bash
# Health check
curl https://your-backend-url.com/actuator/health

# Test API
curl https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### 2. Test Frontend:
- Mở URL frontend trên browser
- Kiểm tra Console (F12) xem có lỗi không
- Test login/register
- Test các API calls

---

## Troubleshooting

### Backend không start:
- Kiểm tra logs trên Render/Railway dashboard
- Kiểm tra database connection
- Kiểm tra environment variables

### Frontend không load:
- Kiểm tra build command
- Kiểm tra output directory
- Kiểm tra nginx config (nếu dùng Docker)

### CORS errors:
- Kiểm tra CORS config trong backend
- Đảm bảo `FRONTEND_URL` đúng
- Kiểm tra browser console

### Database connection errors:
- Kiểm tra connection string
- Kiểm tra credentials
- Kiểm tra network/firewall rules

---

## Environment Variables Template

### Backend:
```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://host:port/dbname
DATABASE_USERNAME=username
DATABASE_PASSWORD=password
PORT=8080
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend:
```
# Không cần env vars, dùng environment.prod.ts
```

---

## Chi phí ước tính

### Render (Free Tier):
- Backend: Free (có thể sleep sau 15 phút không dùng)
- Frontend: Free
- Database: Đã có (Render PostgreSQL)
- **Tổng: $0/tháng** (hoặc $7/tháng nếu upgrade backend)

### Railway:
- Backend + Frontend: $5/tháng free credit
- Database: Có thể dùng Render DB
- **Tổng: ~$0-5/tháng**

### Vercel + Render:
- Frontend (Vercel): Free
- Backend (Render): Free
- **Tổng: $0/tháng**

---

## Next Steps

1. Chọn platform phù hợp
2. Deploy backend trước
3. Test backend APIs
4. Cập nhật frontend environment
5. Deploy frontend
6. Test toàn bộ ứng dụng
7. Setup custom domain (nếu cần)
