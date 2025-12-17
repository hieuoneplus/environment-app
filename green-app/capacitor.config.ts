import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.environment.greenapp',
  appName: 'Green App',
  webDir: 'dist/green-app/browser',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'App cần quyền camera để chụp ảnh và quét mã',
        photos: 'App cần quyền truy cập ảnh để lưu ảnh đã chụp'
      }
    },
    Geolocation: {
      permissions: {
        location: 'App cần quyền vị trí để hiển thị bản đồ và theo dõi Green Move'
      }
    }
  }
};

export default config;
