#!/bin/bash

# Deployment script for CarryConnect Next.js app to Firebase

echo "🚀 Starting deployment process..."

# Navigate to next-app directory
cd next-app

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building Next.js app..."
npm run build

echo "📤 Deploying to Firebase..."
cd ..
firebase deploy

echo "✅ Deployment complete!"
