# Quick Deploy Guide - Render (5 phút)

## Bước 1: Deploy Backend (2 phút)

1. **Vào https://render.com** → Đăng nhập bằng GitHub

2. **New + → Web Service**

3. **Connect GitHub repository**

4. **Cấu hình:**
   - **Name**: `green-app-backend`
   - **Environment**: `Java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
   - **Root Directory**: `backend`

5. **Environment Variables:**
   ```
   SPRING_PROFILES_ACTIVE=prod
   DATABASE_URL=jdbc:postgresql://dpg-d50592ggjchc73d8oj2g-a.singapore-postgres.render.com:5432/environment_8es2
   DATABASE_USERNAME=environment
   DATABASE_PASSWORD=b1ZG1otMAGu551mfR07n16W3WlgBU2Bk
   PORT=8080
   ```

6. **Click "Create Web Service"**

7. **Chờ build xong, copy URL**: `https://green-app-backend-xxx.onrender.com`

---

## Bước 2: Deploy Frontend (2 phút)

1. **Cập nhật `green-app/src/environments/environment.prod.ts`:**
   ```typescript
   export const environment = {
     apiBase: 'https://green-app-backend-xxx.onrender.com', // URL backend vừa lấy
     production: true
   };
   ```

2. **Commit và push lên GitHub**

3. **Trên Render: New + → Static Site**

4. **Connect GitHub repository**

5. **Cấu hình:**
   - **Name**: `green-app-frontend`
   - **Build Command**: `cd green-app && npm install && npm run build:prod`
   - **Publish Directory**: `green-app/dist/green-app/browser`
   - **Root Directory**: (để trống)

6. **Click "Create Static Site"**

7. **Chờ build xong, copy URL**: `https://green-app-frontend-xxx.onrender.com`

---

## Bước 3: Cập nhật CORS (1 phút)

1. **Vào Backend service trên Render**

2. **Environment → Add:**
   ```
   FRONTEND_URL=https://green-app-frontend-xxx.onrender.com
   ```

3. **Click "Save Changes"** → Render sẽ tự động redeploy

---

## Xong! 🎉

- **Backend**: `https://green-app-backend-xxx.onrender.com`
- **Frontend**: `https://green-app-frontend-xxx.onrender.com`

**Test ngay:**
- Mở frontend URL trên browser
- Đăng ký/Đăng nhập
- Kiểm tra mọi tính năng hoạt động

---

## Lưu ý

- **Free tier có thể sleep** sau 15 phút không dùng → Request đầu tiên sẽ chậm (~30s)
- **Upgrade lên Starter ($7/tháng)** để không bị sleep
- **Custom domain**: Có thể thêm trong Render dashboard
