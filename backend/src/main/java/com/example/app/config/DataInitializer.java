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
            
            log.info("Database migration completed successfully");
        } catch (Exception e) {
            log.error("Error during database migration: {}", e.getMessage());
            // Don't fail startup, just log the error
        }
    }

    private void initializeHabits() {
        if (habitRepository.count() == 0) {
            Habit habit1 = new Habit();
            habit1.setName("Mang bình nước");
            habit1.setPoints(50);
            habit1.setDescription("Mang bình nước cá nhân thay vì mua chai nhựa");
            habit1.setIconName("water");
            habit1.setIsActive(true);
            habitRepository.save(habit1);

            Habit habit2 = new Habit();
            habit2.setName("Phân loại rác");
            habit2.setPoints(100);
            habit2.setDescription("Phân loại rác tái chế và rác thải");
            habit2.setIconName("trash");
            habit2.setIsActive(true);
            habitRepository.save(habit2);

            Habit habit3 = new Habit();
            habit3.setName("Đi xe buýt");
            habit3.setPoints(75);
            habit3.setDescription("Sử dụng phương tiện công cộng");
            habit3.setIconName("bus");
            habit3.setIsActive(true);
            habitRepository.save(habit3);

            log.info("Initialized {} habits", habitRepository.count());
        }
    }

    private void initializeRewards() {
        if (rewardRepository.count() == 0) {
            Reward reward1 = new Reward();
            reward1.setName("Sen đá mini");
            reward1.setPoints(500);
            reward1.setCategory("plant");
            reward1.setImageEmoji("🌱");
            reward1.setDescription("Cây sen đá nhỏ xinh để bàn làm việc");
            reward1.setIsActive(true);
            rewardRepository.save(reward1);

            Reward reward2 = new Reward();
            reward2.setName("Túi vải Canvas");
            reward2.setPoints(800);
            reward2.setCategory("plant");
            reward2.setImageEmoji("👜");
            reward2.setDescription("Túi vải thân thiện môi trường");
            reward2.setIsActive(true);
            rewardRepository.save(reward2);

            Reward reward3 = new Reward();
            reward3.setName("Voucher 20%");
            reward3.setPoints(300);
            reward3.setCategory("voucher");
            reward3.setImageEmoji("🎫");
            reward3.setDescription("Voucher giảm giá 20% tại cửa hàng đối tác");
            reward3.setIsActive(true);
            rewardRepository.save(reward3);

            Reward reward4 = new Reward();
            reward4.setName("Ống hút tre");
            reward4.setPoints(200);
            reward4.setCategory("plant");
            reward4.setImageEmoji("🥤");
            reward4.setDescription("Bộ ống hút tre có thể tái sử dụng");
            reward4.setIsActive(true);
            rewardRepository.save(reward4);

            log.info("Initialized {} rewards", rewardRepository.count());
        }
    }

    private void initializeLocations() {
        if (locationRepository.count() == 0) {
            Location location1 = new Location();
            location1.setName("Sạp Chàng Sen");
            location1.setAddress("123 Đường ABC, Quận 1, TP.HCM");
            location1.setLatitude(new BigDecimal("10.7769"));
            location1.setLongitude(new BigDecimal("106.7009"));
            location1.setPointsAvailable(50);
            location1.setDescription("Cửa hàng thân thiện môi trường");
            location1.setIsActive(true);
            locationRepository.save(location1);

            Location location2 = new Location();
            location2.setName("Trạm Xe Buýt Số 1");
            location2.setAddress("456 Đường XYZ, Quận 2, TP.HCM");
            location2.setLatitude(new BigDecimal("10.7869"));
            location2.setLongitude(new BigDecimal("106.7109"));
            location2.setPointsAvailable(75);
            location2.setDescription("Check-in khi sử dụng xe buýt");
            location2.setIsActive(true);
            locationRepository.save(location2);

            log.info("Initialized {} locations", locationRepository.count());
        }
    }
}
