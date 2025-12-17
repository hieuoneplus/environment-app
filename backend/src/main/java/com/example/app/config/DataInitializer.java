package com.example.app.config;

import com.example.app.model.entity.Habit;
import com.example.app.model.entity.Location;
import com.example.app.model.entity.Reward;
import com.example.app.model.entity.User;
import com.example.app.repo.HabitRepository;
import com.example.app.repo.LocationRepository;
import com.example.app.repo.RewardRepository;
import com.example.app.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final HabitRepository habitRepository;
    private final RewardRepository rewardRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        migrateDatabase();
        initializeHabits();
        initializeRewards();
        initializeLocations();
        log.info("Data initialization completed");
    }

    private void migrateDatabase() {
        try {
            log.info("Starting database migration...");
            
            // Check and add columns if they don't exist
            jdbcTemplate.execute(
                "DO $$ " +
                "BEGIN " +
                "  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='green_points') THEN " +
                "    ALTER TABLE public.users ADD COLUMN green_points INTEGER; " +
                "  END IF; " +
                "  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='rank') THEN " +
                "    ALTER TABLE public.users ADD COLUMN rank VARCHAR(100); " +
                "  END IF; " +
                "  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='streak') THEN " +
                "    ALTER TABLE public.users ADD COLUMN streak INTEGER; " +
                "  END IF; " +
                "  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_activity_date') THEN " +
                "    ALTER TABLE public.users ADD COLUMN last_activity_date DATE; " +
                "  END IF; " +
                "  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN " +
                "    ALTER TABLE public.users ADD COLUMN avatar_url VARCHAR(500); " +
                "  END IF; " +
                "  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN " +
                "    ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP; " +
                "  END IF; " +
                "  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN " +
                "    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP; " +
                "  END IF; " +
                "END $$;"
            );

            // Update existing records with default values
            jdbcTemplate.update("UPDATE public.users SET green_points = 0 WHERE green_points IS NULL");
            jdbcTemplate.update("UPDATE public.users SET rank = 'Mầm Non Tích Cực' WHERE rank IS NULL");
            jdbcTemplate.update("UPDATE public.users SET streak = 0 WHERE streak IS NULL");
            jdbcTemplate.update("UPDATE public.users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL");
            jdbcTemplate.update("UPDATE public.users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL");
            
            // Add location_type column if it doesn't exist
            try {
                jdbcTemplate.execute(
                    "DO $$ " +
                    "BEGIN " +
                    "  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='locations' AND column_name='location_type') THEN " +
                    "    ALTER TABLE public.locations ADD COLUMN location_type VARCHAR(50); " +
                    "  END IF; " +
                    "END $$;"
                );
                log.info("Location type column migration completed");
            } catch (Exception e) {
                log.warn("Location type column migration skipped: {}", e.getMessage());
            }

            // Create move_tracking table if it doesn't exist
            try {
                jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS public.move_tracking (" +
                    "  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), " +
                    "  user_id UUID NOT NULL REFERENCES public.users(id), " +
                    "  mode VARCHAR(20) NOT NULL, " +
                    "  start_latitude NUMERIC(10,8), " +
                    "  start_longitude NUMERIC(11,8), " +
                    "  end_latitude NUMERIC(10,8), " +
                    "  end_longitude NUMERIC(11,8), " +
                    "  distance_km NUMERIC(10,2), " +
                    "  points_earned INTEGER DEFAULT 0, " +
                    "  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                    "  ended_at TIMESTAMP, " +
                    "  is_active BOOLEAN NOT NULL DEFAULT true " +
                    ");"
                );
                log.info("Move tracking table migration completed");
            } catch (Exception e) {
                log.warn("Move tracking table migration skipped: {}", e.getMessage());
            }

            // Fix activities table columns if needed
            try {
                log.info("Checking activities table schema...");
                
                // Check current column types (optional, for logging)
                try {
                    String imageUrlType = jdbcTemplate.queryForObject(
                        "SELECT data_type || CASE WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')' ELSE '' END " +
                        "FROM information_schema.columns " +
                        "WHERE table_name='activities' AND column_name='image_url'",
                        String.class
                    );
                    log.info("Current image_url type: {}", imageUrlType);
                } catch (Exception e) {
                    log.warn("Could not check image_url type: {}", e.getMessage());
                }
                
                try {
                    String detectedObjectType = jdbcTemplate.queryForObject(
                        "SELECT data_type || CASE WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')' ELSE '' END " +
                        "FROM information_schema.columns " +
                        "WHERE table_name='activities' AND column_name='detected_object'",
                        String.class
                    );
                    log.info("Current detected_object type: {}", detectedObjectType);
                } catch (Exception e) {
                    log.warn("Could not check detected_object type: {}", e.getMessage());
                }
                
                // Fix image_url: Always try to convert to TEXT if it's not already
                jdbcTemplate.execute(
                    "DO $$ " +
                    "BEGIN " +
                    "  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='image_url') THEN " +
                    "    IF (SELECT data_type FROM information_schema.columns WHERE table_name='activities' AND column_name='image_url') != 'text' THEN " +
                    "      ALTER TABLE public.activities ALTER COLUMN image_url TYPE TEXT USING image_url::TEXT; " +
                    "      RAISE NOTICE 'Updated image_url to TEXT'; " +
                    "    END IF; " +
                    "  END IF; " +
                    "END $$;"
                );
                
                // Fix detected_object: Update to VARCHAR(500) if smaller
                jdbcTemplate.execute(
                    "DO $$ " +
                    "DECLARE " +
                    "  max_len INTEGER; " +
                    "BEGIN " +
                    "  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='detected_object') THEN " +
                    "    SELECT COALESCE(character_maximum_length, 0) INTO max_len " +
                    "    FROM information_schema.columns " +
                    "    WHERE table_name='activities' AND column_name='detected_object'; " +
                    "    " +
                    "    IF max_len < 500 THEN " +
                    "      ALTER TABLE public.activities ALTER COLUMN detected_object TYPE VARCHAR(500); " +
                    "      RAISE NOTICE 'Updated detected_object to VARCHAR(500)'; " +
                    "    END IF; " +
                    "  END IF; " +
                    "END $$;"
                );
                
                log.info("Activities table migration completed successfully");
            } catch (Exception e) {
                log.error("Activities table migration failed: {}", e.getMessage(), e);
                // Don't skip - this is critical, try direct SQL
                try {
                    log.info("Attempting direct SQL migration...");
                    jdbcTemplate.execute("ALTER TABLE public.activities ALTER COLUMN image_url TYPE TEXT USING image_url::TEXT");
                    jdbcTemplate.execute("ALTER TABLE public.activities ALTER COLUMN detected_object TYPE VARCHAR(500)");
                    log.info("Direct SQL migration succeeded");
                } catch (Exception e2) {
                    log.error("Direct SQL migration also failed: {}", e2.getMessage());
                    // Continue anyway - might already be fixed
                }
            }
            
            log.info("Database migration completed successfully");
        } catch (Exception e) {
            log.error("Error during database migration: {}", e.getMessage());
            // Don't fail startup, just log the error
        }
    }

    private void initializeHabits() {
        // Clear old habits and create new ones
        if (habitRepository.count() == 0) {
//        habitRepository.deleteAll();

            Habit habit1 = new Habit();
            habit1.setName("Mang bình nước cá nhân");
            habit1.setPoints(50);
            habit1.setDescription("Mang bình nước cá nhân thay vì mua chai nhựa dùng một lần");
            habit1.setIconName("water");
            habit1.setIsActive(true);
            habitRepository.save(habit1);

            Habit habit2 = new Habit();
            habit2.setName("Từ chối túi nilon");
            habit2.setPoints(30);
            habit2.setDescription("Từ chối túi nilon khi mua sắm, sử dụng túi tái sử dụng");
            habit2.setIconName("bag");
            habit2.setIsActive(true);
            habitRepository.save(habit2);

            Habit habit3 = new Habit();
            habit3.setName("Phân loại rác tại nguồn");
            habit3.setPoints(100);
            habit3.setDescription("Phân loại rác tái chế, rác hữu cơ và rác thải khác");
            habit3.setIconName("trash");
            habit3.setIsActive(true);
            habitRepository.save(habit3);

            Habit habit4 = new Habit();
            habit4.setName("Không dùng chai nhựa dùng một lần");
            habit4.setPoints(40);
            habit4.setDescription("Tránh sử dụng chai nhựa dùng một lần, ưu tiên đồ tái sử dụng");
            habit4.setIconName("close-circle");
            habit4.setIsActive(true);
            habitRepository.save(habit4);

            Habit habit5 = new Habit();
            habit5.setName("Mang túi tote khi mua sắm");
            habit5.setPoints(25);
            habit5.setDescription("Mang túi tote hoặc túi vải khi đi mua sắm");
            habit5.setIconName("bag-handle");
            habit5.setIsActive(true);
            habitRepository.save(habit5);

            Habit habit6 = new Habit();
            habit6.setName("Ăn chay hoặc giảm thịt");
            habit6.setPoints(80);
            habit6.setDescription("Ăn chay hoặc giảm tiêu thụ thịt để bảo vệ môi trường");
            habit6.setIconName("leaf");
            habit6.setIsActive(true);
            habitRepository.save(habit6);

            Habit habit7 = new Habit();
            habit7.setName("Đi bộ/xe đạp thay xe máy");
            habit7.setPoints(60);
            habit7.setDescription("Đi bộ hoặc đạp xe thay vì sử dụng xe máy/ô tô");
            habit7.setIconName("bicycle");
            habit7.setIsActive(true);
            habitRepository.save(habit7);

            log.info("Initialized {} habits", habitRepository.count());
        }
    }

    private void initializeRewards() {
        // Clear old rewards and create new ones
        if (rewardRepository.count() == 0) {
//        rewardRepository.deleteAll();

            Reward reward1 = new Reward();
            reward1.setName("Mã giảm giá 10k (Shopee/Grab/Lazada)");
            reward1.setPoints(100);
            reward1.setCategory("ELECTRONIC_VOUCHER");
            reward1.setImageEmoji("🎫");
            reward1.setDescription("Mã giảm giá 10.000đ áp dụng cho Shopee, Grab hoặc Lazada");
            reward1.setIsActive(true);
            rewardRepository.save(reward1);

            Reward reward2 = new Reward();
            reward2.setName("Thẻ nạp điện thoại 20k");
            reward2.setPoints(200);
            reward2.setCategory("ELECTRONIC_VOUCHER");
            reward2.setImageEmoji("📱");
            reward2.setDescription("Thẻ nạp điện thoại trị giá 20.000đ");
            reward2.setIsActive(true);
            rewardRepository.save(reward2);

            Reward reward3 = new Reward();
            reward3.setName("Voucher Highlands Coffee / Starbucks 30k");
            reward3.setPoints(300);
            reward3.setCategory("FOOD_DRINK");
            reward3.setImageEmoji("☕");
            reward3.setDescription("Voucher 30.000đ tại Highlands Coffee hoặc Starbucks");
            reward3.setIsActive(true);
            rewardRepository.save(reward3);

            Reward reward4 = new Reward();
            reward4.setName("Bộ ống hút Inox & cọ rửa (kèm túi vải)");
            reward4.setPoints(400);
            reward4.setCategory("PERSONAL_ITEM");
            reward4.setImageEmoji("🥤");
            reward4.setDescription("Bộ ống hút inox cao cấp kèm cọ rửa và túi vải đựng");
            reward4.setIsActive(true);
            rewardRepository.save(reward4);

            Reward reward5 = new Reward();
            reward5.setName("Sen đá / Xương rồng để bàn");
            reward5.setPoints(500);
            reward5.setCategory("GREEN_GIFT");
            reward5.setImageEmoji("🌵");
            reward5.setDescription("Cây sen đá hoặc xương rồng nhỏ xinh để bàn làm việc");
            reward5.setIsActive(true);
            rewardRepository.save(reward5);

            Reward reward6 = new Reward();
            reward6.setName("Túi vải Canvas (Tote bag) thiết kế riêng");
            reward6.setPoints(600);
            reward6.setCategory("FASHION");
            reward6.setImageEmoji("👜");
            reward6.setDescription("Túi vải Canvas thân thiện môi trường với thiết kế độc quyền");
            reward6.setIsActive(true);
            rewardRepository.save(reward6);

            Reward reward7 = new Reward();
            reward7.setName("Vé tham gia Workshop (Làm nến/Tái chế)");
            reward7.setPoints(800);
            reward7.setCategory("EXPERIENCE");
            reward7.setImageEmoji("🕯️");
            reward7.setDescription("Vé tham gia workshop làm nến hoặc tái chế đồ dùng");
            reward7.setIsActive(true);
            rewardRepository.save(reward7);

            Reward reward8 = new Reward();
            reward8.setName("Quyên góp 01 cây rừng (Dự án Trồng Rừng)");
            reward8.setPoints(1000);
            reward8.setCategory("SOCIAL_IMPACT");
            reward8.setImageEmoji("🌲");
            reward8.setDescription("Quyên góp 1 cây rừng cho dự án trồng rừng bảo vệ môi trường");
            reward8.setIsActive(true);
            rewardRepository.save(reward8);

            Reward reward9 = new Reward();
            reward9.setName("Bình giữ nhiệt Inox cao cấp (500ml)");
            reward9.setPoints(1500);
            reward9.setCategory("PERSONAL_ITEM");
            reward9.setImageEmoji("🧊");
            reward9.setDescription("Bình giữ nhiệt inox cao cấp dung tích 500ml, giữ nhiệt 12-24 giờ");
            reward9.setIsActive(true);
            rewardRepository.save(reward9);

            log.info("Initialized {} rewards", rewardRepository.count());
        }
    }

    private void initializeLocations() {
        if (locationRepository.count() == 0) {
            // Trạm tái chế
            Location recycle1 = new Location();
            recycle1.setName("Trạm Tái Chế Quận Cầu giấy 1");
            recycle1.setAddress("76-82 Trần Quốc Vượng, Dịch Vọng Hậu, Cầu Giấy, Hà Nội, Việt Nam");
            recycle1.setLatitude(new BigDecimal("21.034281"));
            recycle1.setLongitude(new BigDecimal("105.783358"));
            recycle1.setPointsAvailable(100);
            recycle1.setDescription("Thu gom vỏ hộp sữa, chai nhựa");
            recycle1.setLocationType("RECYCLE_STATION");
            recycle1.setIsActive(true);
            locationRepository.save(recycle1);

            Location recycle2 = new Location();
            recycle2.setName("Trạm Tái Chế Quận Cầu giấy 2");
            recycle2.setAddress("36 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội");
            recycle2.setLatitude(new BigDecimal("21.036688"));
            recycle2.setLongitude(new BigDecimal("105.787092"));
            recycle2.setPointsAvailable(100);
            recycle2.setDescription("Thu gom vỏ hộp sữa, chai nhựa");
            recycle2.setLocationType("RECYCLE_STATION");
            recycle2.setIsActive(true);
            locationRepository.save(recycle2);

            // Điểm thu gom pin
            Location battery1 = new Location();
            battery1.setName("Điểm Thu Gom Pin Quận Cầu giấy 1");
            battery1.setAddress("77 Trần Quốc Hoàn, Dịch Vọng Hậu, Cầu Giấy, Hà Nội");
            battery1.setLatitude(new BigDecimal("21.041786"));
            battery1.setLongitude(new BigDecimal("105.783688"));
            battery1.setPointsAvailable(150);
            battery1.setDescription("Thu gom pin điện tử, pin cũ");
            battery1.setLocationType("BATTERY_COLLECTION");
            battery1.setIsActive(true);
            locationRepository.save(battery1);

            Location battery2 = new Location();
            battery2.setName("Điểm Thu Gom Pin Quận Cầu giấy 2");
            battery2.setAddress("89 Đ. Nguyễn Phong Sắc, Dịch Vọng Hậu, Cầu Giấy, Hà Nội");
            battery2.setLatitude(new BigDecimal("21.039112"));
            battery2.setLongitude(new BigDecimal("105.790340"));
            battery2.setPointsAvailable(150);
            battery2.setDescription("Thu gom pin điện tử, pin cũ");
            battery2.setLocationType("BATTERY_COLLECTION");
            battery2.setIsActive(true);
            locationRepository.save(battery2);

            // Cửa hàng Xanh
            Location store1 = new Location();
            store1.setName("Cửa Hàng Xanh Green Wave");
            store1.setAddress("241 Đ. Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội");
            store1.setLatitude(new BigDecimal("21.035914"));
            store1.setLongitude(new BigDecimal("105.783046"));
            store1.setPointsAvailable(200);
            store1.setDescription("Đổi điểm GP lấy voucher, sản phẩm xanh");
            store1.setLocationType("GREEN_STORE");
            store1.setIsActive(true);
            locationRepository.save(store1);

            Location store2 = new Location();
            store2.setName("Cửa Hàng Xanh Eco Shop");
            store2.setAddress("P. Phan Văn Trường, Dịch Vọng Hậu, Cầu Giấy, Hà Nội");
            store2.setLatitude(new BigDecimal("21.036958"));
            store2.setLongitude(new BigDecimal("105.785976"));
            store2.setPointsAvailable(200);
            store2.setDescription("Đổi điểm GP lấy voucher, sản phẩm xanh");
            store2.setLocationType("GREEN_STORE");
            store2.setIsActive(true);
            locationRepository.save(store2);

            log.info("Initialized {} locations", locationRepository.count());
        }
    }
}
