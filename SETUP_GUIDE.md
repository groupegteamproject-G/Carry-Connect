# CarryConnect - Complete Setup Guide

This guide will walk you through setting up the complete Firebase backend for your CarryConnect Next.js application.

## 📋 Table of Contents

1. [Get Firebase Configuration](#1-get-firebase-configuration)
2. [Configure GitHub Secrets](#2-configure-github-secrets)
3. [Enable Firebase Services](#3-enable-firebase-services)
4. [Deploy Firestore Rules](#4-deploy-firestore-rules)
5. [Seed Initial Data](#5-seed-initial-data-optional)
6. [Test Locally](#6-test-locally)
7. [Deploy to Production](#7-deploy-to-production)

---

## 1. Get Firebase Configuration

### Step 1.1: Access Firebase Console

1. Go to https://console.firebase.google.com/
2. Login with: **groupegteamproject@gmail.com** / **groupeg2026**
3. Select project: **carry-connect-g-1d438**

### Step 1.2: Get Configuration Values

1. Click on the **Settings (gear icon)** > **Project settings**
2. Scroll down to **"Your apps"** section
3. If you don't see a web app, click **"Add app"** > **Web (</>)**
4. You'll see configuration like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "carry-connect-g-1d438.firebaseapp.com",
  projectId: "carry-connect-g-1d438",
  storageBucket: "carry-connect-g-1d438.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123..."
};
```

**Copy these values** - you'll need them in the next steps.

---

## 2. Configure GitHub Secrets

### Step 2.1: Get Firebase Token

On your local computer, open terminal/command prompt:

```bash
firebase login:ci
```

This will open a browser for authentication. Login and copy the token that appears.

### Step 2.2: Add Secrets to GitHub

1. Go to https://github.com/its-nadir/Carry-Connect
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **"New repository secret"**
4. Add the following secrets one by one:

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_TOKEN` | Token from Step 2.1 |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | carry-connect-g-1d438.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | carry-connect-g-1d438 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | carry-connect-g-1d438.firebasestorage.app |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase config |

---

## 3. Enable Firebase Services

### Step 3.1: Enable Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click **"Get started"**
3. Click on **Email/Password** provider
4. Toggle **Enable** and click **Save**
5. (Optional) Enable **Google** provider for social login

### Step 3.2: Verify Firestore Database

1. Go to **Build** > **Firestore Database**
2. You should see it's already created
3. If not, click **"Create database"**
   - Choose **"Start in production mode"**
   - Select location: **europe-west10**

### Step 3.3: Enable Storage (Optional)

1. Go to **Build** > **Storage**
2. Click **"Get started"**
3. Accept default security rules
4. Choose location: **europe-west10**

---

## 4. Deploy Firestore Rules

The new security rules allow authenticated users to interact with the database properly.

### Step 4.1: Login to Firebase CLI

On your local computer:

```bash
firebase login
```

### Step 4.2: Select Project

```bash
cd Carry-Connect
firebase use carry-connect-g-1d438
```

### Step 4.3: Deploy Rules

```bash
firebase deploy --only firestore:rules
```

You should see:
```
✔  firestore: deployed rules successfully
```

---

## 5. Seed Initial Data (Optional)

To populate the database with sample carriers and users:

### Step 5.1: Get Service Account Key

1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Click **"Generate new private key"**
3. Save the JSON file as `serviceAccountKey.json` in the `scripts/` folder

### Step 5.2: Install Dependencies

```bash
npm install firebase-admin
```

### Step 5.3: Run Seed Script

```bash
node scripts/seed-data.js
```

This will add sample carriers and users to your database.

---

## 6. Test Locally

### Step 6.1: Create Environment File

In the `next-app` directory, create `.env.local`:

```bash
cd next-app
cp .env.local.example .env.local
```

### Step 6.2: Edit Environment File

Open `.env.local` and add your Firebase configuration from Step 1:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=carry-connect-g-1d438.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=carry-connect-g-1d438
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=carry-connect-g-1d438.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### Step 6.3: Install Dependencies

```bash
npm install
```

### Step 6.4: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 6.5: Test Features

- ✅ Homepage loads correctly
- ✅ Find a Carrier page shows carriers
- ✅ Messages page displays
- ✅ Profile page displays

---

## 7. Deploy to Production

### Option A: Automatic Deployment (Recommended)

Once GitHub secrets are configured (Step 2), deployment is automatic:

```bash
git add .
git commit -m "Configure Firebase backend"
git push origin main
```

GitHub Actions will automatically:
1. Install dependencies
2. Build the Next.js app
3. Deploy to Firebase Hosting

Check the **Actions** tab on GitHub to see deployment progress.

### Option B: Manual Deployment

```bash
# Build the app
cd next-app
npm run build

# Deploy to Firebase
cd ..
firebase deploy
```

Or use the deployment script:

```bash
./deploy.sh
```

---

## ✅ Verification

After deployment, verify everything works:

1. **Visit the website**: https://carry-connect-g-1d438.web.app/
2. **Check pages load**: Home, Find a Carrier, Messages, Profile
3. **Test authentication**: Try signing up (if implemented)
4. **Check Firestore**: Go to Firebase Console > Firestore Database to see data

---

## 🎯 What's Been Set Up

### Frontend Integration
- ✅ Firebase SDK integrated in Next.js
- ✅ Authentication helpers (`lib/auth.js`)
- ✅ Firestore database helpers (`lib/firestore.js`)
- ✅ Environment variables configured

### Backend Services
- ✅ Firebase Authentication (Email/Password, Google)
- ✅ Firestore Database with proper security rules
- ✅ Firebase Hosting for Next.js app

### Database Schema
- ✅ `carriers` - Trip listings
- ✅ `users` - User profiles
- ✅ `trips` - User trips
- ✅ `conversations` - Messages between users
- ✅ `reviews` - User reviews
- ✅ `bookings` - Package bookings

### Deployment
- ✅ GitHub Actions workflow for auto-deployment
- ✅ Next.js configured for static export
- ✅ Firebase Hosting configured

---

## 🔄 Next Steps

### Integrate Backend with Frontend

Now that the backend is set up, you need to update your frontend pages to use the Firebase functions:

#### 1. Update Find a Carrier Page

```javascript
// In app/find-a-carrier/page.jsx
import { useEffect, useState } from 'react';
import { getCarriers } from '../lib/firestore';

export default function FindCarrierPage() {
  const [carriers, setCarriers] = useState([]);

  useEffect(() => {
    async function loadCarriers() {
      const data = await getCarriers();
      setCarriers(data);
    }
    loadCarriers();
  }, []);

  // Rest of your component...
}
```

#### 2. Add Authentication

Create a login page and use the auth functions:

```javascript
import { signIn, signUp } from '../lib/auth';

// In your login component
const handleLogin = async (email, password) => {
  try {
    await signIn(email, password);
    // Redirect to profile or home
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

#### 3. Protect Routes

Create an authentication context to protect routes that require login.

---

## 🐛 Troubleshooting

### Issue: "Firebase not defined"
**Solution**: Make sure you've created `.env.local` with all Firebase configuration values.

### Issue: "Permission denied" in Firestore
**Solution**: Deploy the new security rules: `firebase deploy --only firestore:rules`

### Issue: GitHub Actions deployment fails
**Solution**: Verify all GitHub secrets are correctly set (Step 2.2).

### Issue: Build fails with "output: export" error
**Solution**: Make sure `next.config.ts` has `output: 'export'` and `images.unoptimized: true`.

---

## 📞 Need Help?

- Check the [README.md](README.md) for API documentation
- Review Firebase Console for errors
- Check GitHub Actions logs for deployment issues
- Verify all environment variables are set correctly

---

## 🎉 Congratulations!

Your CarryConnect app now has a complete Firebase backend with:
- User authentication
- Real-time database
- Secure API
- Automatic deployment

You can now focus on integrating these backend services into your frontend pages!
