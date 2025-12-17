# Fix Activities Table Columns

## Vấn đề
Lỗi: `value too long for type character varying(255)` khi insert vào bảng `activities`

## Nguyên nhân
Cột `image_url` và `detected_object` trong database vẫn có giới hạn `VARCHAR(255)`, nhưng dữ liệu gửi lên (đặc biệt là base64 image) dài hơn 255 ký tự.

## Giải pháp

### Cách 1: Tự động (Khuyến nghị)
Restart backend - migration sẽ tự động chạy khi backend khởi động.

### Cách 2: Chạy SQL thủ công
Nếu migration tự động không chạy, chạy SQL sau trong database:

```sql
-- Fix image_url: Change to TEXT (unlimited length)
ALTER TABLE public.activities 
ALTER COLUMN image_url TYPE TEXT USING image_url::TEXT;

-- Fix detected_object: Change to VARCHAR(500)
ALTER TABLE public.activities 
ALTER COLUMN detected_object TYPE VARCHAR(500);
```

### Cách 3: Sử dụng file SQL
File `backend/src/main/resources/fix-activities-columns.sql` đã được tạo sẵn. Chạy file này trong database.

## Kiểm tra
Sau khi fix, kiểm tra bằng SQL:

```sql
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND column_name IN ('image_url', 'detected_object');
```

Kết quả mong đợi:
- `image_url`: `data_type = 'text'`, `character_maximum_length = NULL`
- `detected_object`: `data_type = 'character varying'`, `character_maximum_length = 500`

## Lưu ý
- Migration tự động sẽ chạy mỗi lần backend start
- Nếu vẫn gặp lỗi, kiểm tra logs của backend để xem migration có chạy không
- Nếu migration fail, chạy SQL thủ công như trên
