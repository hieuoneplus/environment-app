# Fix: Database error "value too long for type character varying(255)"

## Vấn đề

Khi submit activity với ảnh base64, gặp lỗi:
```
ERROR: value too long for type character varying(255)
```

## Nguyên nhân

Column `image_url` trong bảng `activities` đang là `VARCHAR(255)`, nhưng base64 data URL có thể rất dài (>10,000 ký tự).

## Giải pháp

### Cách 1: Tự động migration (Đã thêm vào DataInitializer)

Backend sẽ tự động fix khi start:
- `image_url` → `TEXT` (unlimited length)
- `detected_object` → `VARCHAR(500)`

### Cách 2: Manual SQL (Nếu cần)

Chạy SQL script:
```sql
-- Fix image_url column
ALTER TABLE public.activities 
ALTER COLUMN image_url TYPE TEXT;

-- Fix detected_object column
ALTER TABLE public.activities 
ALTER COLUMN detected_object TYPE VARCHAR(500);
```

File SQL đã được tạo: `backend/src/main/resources/data-migration-activities.sql`

### Cách 3: Dùng Hibernate (Đã update entity)

Entity `Activity.java` đã được update:
```java
@Column(name = "image_url", columnDefinition = "TEXT")
private String imageUrl;
```

Nếu `ddl-auto=update`, Hibernate sẽ tự động alter column.

## Verify

Sau khi fix, verify:
```sql
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND column_name IN ('image_url', 'detected_object');
```

Kết quả mong đợi:
- `image_url`: `text` (không có max length)
- `detected_object`: `character varying(500)`

## Lưu ý

1. **Base64 rất dài** - Cân nhắc upload ảnh lên storage và chỉ lưu URL
2. **Performance** - TEXT column có thể chậm hơn VARCHAR, nhưng cần thiết cho base64
3. **Backup** - Backup database trước khi alter column

## Next Steps

Sau khi fix database, test lại:
1. Chụp ảnh
2. Submit activity
3. Verify không còn lỗi
