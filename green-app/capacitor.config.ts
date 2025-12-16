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
    }
  }
};

export default config;
