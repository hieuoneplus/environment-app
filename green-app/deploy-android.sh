#!/bin/bash

echo "🚀 Building for Android..."

# Build production
echo "📦 Building production bundle..."
npm run build:prod

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Open Android Studio
echo "📱 Opening Android Studio..."
npx cap open android

echo "✅ Done! Android Studio should open now."
echo "👉 In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)"
