# Hướng dẫn sửa lỗi Database

## Vấn đề
Bảng `users` đã có dữ liệu nhưng thiếu các cột mới (green_points, rank, streak, etc.). Hibernate không thể thêm cột NOT NULL vào bảng đã có dữ liệu.

## Giải pháp

### Cách 1: Chạy SQL Script trực tiếp (Khuyến nghị)

1. Kết nối đến database PostgreSQL
2. Chạy các lệnh SQL sau:

```sql
-- Thêm các cột mới (cho phép NULL)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS green_points INTEGER;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS rank VARCHAR(100);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS streak INTEGER;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Cập nhật giá trị mặc định cho các record cũ
UPDATE public.users 
SET green_points = 0 
WHERE green_points IS NULL;

UPDATE public.users 
SET rank = 'Mầm Non Tích Cực' 
WHERE rank IS NULL;

UPDATE public.users 
SET streak = 0 
WHERE streak IS NULL;

UPDATE public.users 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

UPDATE public.users 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;
```

### Cách 2: Sử dụng psql command line

```bash
psql -h dpg-d50592ggjchc73d8oj2g-a.singapore-postgres.render.com -U environment -d environment_8es2 -f src/main/resources/data-migration.sql
```

### Cách 3: Sử dụng Database Tool
- Mở pgAdmin, DBeaver, hoặc tool tương tự
- Kết nối đến database
- Chạy script SQL từ file `backend/src/main/resources/data-migration.sql`

## Sau khi chạy script

1. Restart backend
2. Kiểm tra logs xem có lỗi không
3. Test API endpoints

## Lưu ý

- Script sử dụng `IF NOT EXISTS` nên an toàn chạy nhiều lần
- Các giá trị mặc định sẽ được set cho tất cả record cũ
- Record mới sẽ tự động có giá trị mặc định từ entity
