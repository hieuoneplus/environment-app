# Deployment Checklist

## Trước khi Deploy

### Backend
- [ ] Database credentials đã được lưu an toàn (không commit vào git)
- [ ] `application.properties` sử dụng environment variables
- [ ] CORS config cho phép frontend URL
- [ ] Build thành công: `mvn clean package`
- [ ] Test local: `java -jar target/*.jar`

### Frontend
- [ ] `environment.prod.ts` có đúng backend URL
- [ ] Build production thành công: `npm run build:prod`
- [ ] Test local build: Serve `dist/green-app/browser` và test

### Code
- [ ] Code đã commit và push lên GitHub
- [ ] Không có sensitive data trong code
- [ ] `.gitignore` đã cấu hình đúng

---

## Deploy Backend

### Render
- [ ] Tạo Web Service
- [ ] Connect GitHub repository
- [ ] Set Root Directory: `backend`
- [ ] Set Build Command: `mvn clean package -DskipTests`
- [ ] Set Start Command: `java -jar target/*.jar`
- [ ] Add Environment Variables:
  - [ ] `SPRING_PROFILES_ACTIVE=prod`
  - [ ] `DATABASE_URL`
  - [ ] `DATABASE_USERNAME`
  - [ ] `DATABASE_PASSWORD`
  - [ ] `PORT=8080`
  - [ ] `FRONTEND_URL` (sẽ set sau khi deploy frontend)
- [ ] Deploy và chờ build xong
- [ ] Copy backend URL

### Railway
- [ ] New Project → Deploy from GitHub
- [ ] Select repository
- [ ] Railway auto-detect Dockerfile
- [ ] Add Environment Variables (giống Render)
- [ ] Deploy

---

## Deploy Frontend

### Render Static Site
- [ ] Update `environment.prod.ts` với backend URL
- [ ] Commit và push changes
- [ ] New Static Site trên Render
- [ ] Connect GitHub repository
- [ ] Set Build Command: `cd green-app && npm install && npm run build:prod`
- [ ] Set Publish Directory: `green-app/dist/green-app/browser`
- [ ] Deploy và chờ build xong
- [ ] Copy frontend URL

### Vercel
- [ ] Update `environment.prod.ts`
- [ ] Commit và push
- [ ] Import project trên Vercel
- [ ] Framework: Angular
- [ ] Build Command: `cd green-app && npm run build:prod`
- [ ] Output Directory: `green-app/dist/green-app/browser`
- [ ] Deploy

---

## Sau khi Deploy

### Backend
- [ ] Test health endpoint: `curl https://backend-url/actuator/health`
- [ ] Test API: `curl https://backend-url/api/auth/login ...`
- [ ] Check logs trên dashboard
- [ ] Verify database connection

### Frontend
- [ ] Mở frontend URL trên browser
- [ ] Check Console (F12) - không có errors
- [ ] Test đăng ký
- [ ] Test đăng nhập
- [ ] Test các tính năng chính

### CORS
- [ ] Update `FRONTEND_URL` trong backend environment variables
- [ ] Redeploy backend (hoặc đợi auto-redeploy)
- [ ] Test API calls từ frontend

---

## Testing Checklist

### Authentication
- [ ] Đăng ký thành công
- [ ] Đăng nhập thành công
- [ ] Logout hoạt động
- [ ] Session được lưu đúng

### Features
- [ ] Home page load được
- [ ] Dashboard hiển thị data
- [ ] Habits toggle hoạt động
- [ ] Rewards hiển thị
- [ ] Camera/Activity submit được
- [ ] Profile load được

### Performance
- [ ] Page load < 3s
- [ ] API responses < 1s
- [ ] Images load đúng
- [ ] No console errors

---

## Monitoring

### Setup (Optional)
- [ ] Add error tracking (Sentry, etc.)
- [ ] Add analytics (Google Analytics, etc.)
- [ ] Setup uptime monitoring (UptimeRobot, etc.)

### Regular Checks
- [ ] Check backend logs weekly
- [ ] Monitor database usage
- [ ] Check error rates
- [ ] Review user feedback

---

## Troubleshooting

### Backend không start
1. Check logs trên Render/Railway
2. Verify environment variables
3. Check database connection
4. Verify Java version (17)

### Frontend không load
1. Check build logs
2. Verify output directory
3. Check nginx config (nếu dùng Docker)
4. Check browser console

### CORS errors
1. Verify `FRONTEND_URL` trong backend
2. Check CORS config
3. Verify frontend URL format (https://)
4. Check browser console

### Database errors
1. Verify connection string
2. Check credentials
3. Check database status
4. Verify network access

---

## Security Checklist

- [ ] Database password không commit vào git
- [ ] Environment variables được set đúng
- [ ] CORS chỉ cho phép frontend URL
- [ ] HTTPS enabled (Render tự động)
- [ ] No sensitive data trong logs
- [ ] API endpoints có validation

---

## Cost Optimization

- [ ] Use free tier nếu đủ
- [ ] Monitor usage
- [ ] Optimize database queries
- [ ] Enable caching nếu cần
- [ ] Consider CDN cho static assets

---

## Documentation

- [ ] Update README với deployment URLs
- [ ] Document environment variables
- [ ] Document troubleshooting steps
- [ ] Share credentials với team (an toàn)
