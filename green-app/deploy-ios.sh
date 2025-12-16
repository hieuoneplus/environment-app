#!/bin/bash

echo "🚀 Building for iOS..."

# Build production
echo "📦 Building production bundle..."
npm run build:prod

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync ios

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
cd ios/App
pod install
cd ../..

# Open Xcode
echo "📱 Opening Xcode..."
npx cap open ios

echo "✅ Done! Xcode should open now."
echo "👉 In Xcode: Select device → Click Run (▶️)"
