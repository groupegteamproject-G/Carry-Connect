# 🚀 Quick Start Guide

Get your Firebase backend up and running in 5 steps!

## ⚡ Prerequisites

- Firebase account (you already have: groupegteamproject@gmail.com)
- Firebase CLI installed: `npm install -g firebase-tools`
- GitHub repository access

---

## Step 1: Get Firebase Configuration (5 minutes)

1. Open https://console.firebase.google.com/
2. Login: `groupegteamproject@gmail.com` / `groupeg2026`
3. Select project: `carry-connect-g-1d438`
4. Click ⚙️ **Settings** > **Project settings**
5. Scroll to **"Your apps"** > Select Web app
6. Copy all the config values (you'll need them next)

---

## Step 2: Configure GitHub Secrets (10 minutes)

### Get Firebase Token
```bash
firebase login:ci
```
Copy the token that appears.

### Add Secrets to GitHub

1. Go to: https://github.com/its-nadir/Carry-Connect/settings/secrets/actions
2. Click **"New repository secret"**
3. Add these 7 secrets:

```
FIREBASE_TOKEN                          → Token from above
NEXT_PUBLIC_FIREBASE_API_KEY           → From Firebase Console
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN       → carry-connect-g-1d438.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID        → carry-connect-g-1d438
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET    → carry-connect-g-1d438.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID → From Firebase Console
NEXT_PUBLIC_FIREBASE_APP_ID            → From Firebase Console
```

---

## Step 3: Enable Firebase Services (5 minutes)

### Enable Authentication
1. Firebase Console > **Authentication** > **Get started**
2. Click **Email/Password** > Toggle **Enable** > **Save**
3. (Optional) Enable **Google** sign-in

### Verify Firestore
1. Go to **Firestore Database**
2. Should already be created (if not, create it in `europe-west10`)

---

## Step 4: Deploy Security Rules (2 minutes)

```bash
cd Carry-Connect
firebase login
firebase use carry-connect-g-1d438
firebase deploy --only firestore:rules
```

You should see: `✔ firestore: deployed rules successfully`

---

## Step 5: Push to GitHub (1 minute)

```bash
git add .
git commit -m "Add Firebase backend infrastructure"
git push origin main
```

**That's it!** GitHub Actions will automatically build and deploy your app.

Watch the deployment at: https://github.com/its-nadir/Carry-Connect/actions

---

## ✅ Verify It Works

1. **Check deployment**: https://carry-connect-g-1d438.web.app/
2. **Test pages**: Home, Find a Carrier, Messages, Profile
3. **Check database**: Firebase Console > Firestore Database

---

## 🎯 What You Got

✅ Complete Firebase backend  
✅ User authentication (Email + Google)  
✅ Firestore database  
✅ Secure API with proper rules  
✅ Auto-deployment on every push  
✅ Production-ready infrastructure  

---

## 📚 Next Steps

### Want to integrate the backend with your frontend?

See **INTEGRATION_EXAMPLES.md** for copy-paste code examples:
- Load carriers from database
- Add user login/signup
- Implement real-time messaging
- Create trip forms

### Need detailed instructions?

See **SETUP_GUIDE.md** for step-by-step explanations.

### Want to understand the changes?

See **CHANGES_SUMMARY.md** for complete documentation.

---

## 🆘 Need Help?

**Common Issues:**

1. **Build fails**: Make sure all GitHub secrets are set
2. **Permission denied**: Deploy Firestore rules (Step 4)
3. **Firebase not found**: Install Firebase CLI globally

**Still stuck?** Check the troubleshooting section in SETUP_GUIDE.md

---

## 🎉 You're Done!

Your app now has a complete Firebase backend. Start building amazing features! 🚀
