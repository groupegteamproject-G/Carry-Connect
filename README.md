# CarryConnect - Package Delivery Platform

A Next.js web application that connects travelers with people who need to send packages, built with Firebase backend.

## 🚀 Features

- **User Authentication** - Sign up/login with email or Google
- **Find Carriers** - Search for travelers going to your destination
- **Messaging System** - Chat with carriers to arrange delivery
- **User Profiles** - View ratings, reviews, and trip history
- **Trip Management** - Create and manage your trips
- **Real-time Database** - Powered by Firebase Firestore

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **Deployment**: GitHub Actions + Firebase Hosting

## 📋 Prerequisites

- Node.js 20+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase account

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/its-nadir/Carry-Connect.git
cd Carry-Connect
```

### 2. Install Dependencies

```bash
cd next-app
npm install
```

### 3. Configure Firebase

#### Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `carry-connect-g-1d438`
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click on the web app or create one
6. Copy the configuration values

#### Set Environment Variables

Create a `.env.local` file in the `next-app` directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=carry-connect-g-1d438.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=carry-connect-g-1d438
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=carry-connect-g-1d438.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 4. Enable Firebase Services

#### Enable Authentication

1. Go to Firebase Console > Authentication
2. Click "Get Started"
3. Enable Email/Password provider
4. Enable Google provider (optional)

#### Enable Firestore Database

1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Choose "Start in production mode"
4. Select location: `europe-west10`

#### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Run Development Server

```bash
cd next-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Manual Deployment

```bash
# Build the Next.js app
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

### Automatic Deployment with GitHub Actions

The project is configured for automatic deployment on every push to the `main` branch.

#### Setup GitHub Secrets

1. Get your Firebase token:
   ```bash
   firebase login:ci
   ```

2. Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):
   - `FIREBASE_TOKEN` - Token from step 1
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

3. Push to main branch:
   ```bash
   git add .
   git commit -m "Update configuration"
   git push origin main
   ```

The GitHub Actions workflow will automatically build and deploy your app.

## 📁 Project Structure

```
Carry-Connect/
├── next-app/               # Next.js application
│   ├── app/               # App router pages
│   │   ├── components/    # React components
│   │   ├── find-a-carrier/
│   │   ├── messages/
│   │   ├── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/               # Firebase configuration
│   │   ├── firebase.js    # Firebase initialization
│   │   ├── firebase.js    # Firebase initialization
│   │   └── db.js          # Database and Auth helpers
│   ├── public/            # Static assets
│   └── package.json
├── db/                    # Firestore configuration
│   ├── firestore.rules    # Security rules
│   └── firestore.indexes.json
├── .github/
│   └── workflows/
│       └── firebase-hosting.yml
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project
└── deploy.sh             # Deployment script
```

## 🔐 Firebase Security Rules

The Firestore security rules are configured to:
- Allow anyone to read carrier listings
- Require authentication for creating/updating data
- Ensure users can only modify their own data
- Restrict message access to conversation participants

## 📚 API Documentation

### Authentication (`lib/auth.js`)

- `signUp(email, password, displayName)` - Create new user
- `signIn(email, password)` - Sign in user
- `signInWithGoogle()` - Sign in with Google
- `logOut()` - Sign out user
- `getCurrentUser()` - Get current user

### Firestore (`lib/firestore.js`)

#### Carriers
- `getCarriers(filters)` - Get all carriers with optional filters
- `getCarrier(carrierId)` - Get single carrier
- `createCarrier(carrierData)` - Create new carrier listing
- `updateCarrier(carrierId, updates)` - Update carrier

#### Users
- `getUserProfile(userId)` - Get user profile
- `setUserProfile(userId, profileData)` - Update user profile

#### Messages
- `getConversations(userId)` - Get user's conversations
- `getMessages(conversationId)` - Get messages in conversation
- `sendMessage(conversationId, senderId, text)` - Send message

#### Trips
- `getUserTrips(userId)` - Get user's trips
- `createTrip(tripData)` - Create new trip

## 🌐 Live Website

- **Production**: https://carry-connect-g-1d438.web.app/
- **Firebase Console**: https://console.firebase.google.com/project/carry-connect-g-1d438

## 👥 Team

- **Email**: groupegteamproject@gmail.com
- **GitHub**: https://github.com/its-nadir/Carry-Connect

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Build Errors

If you encounter build errors:
```bash
cd next-app
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Firebase Deployment Issues

If deployment fails:
```bash
firebase login
firebase use carry-connect-g-1d438
firebase deploy
```

### Environment Variables Not Working

Make sure `.env.local` is in the `next-app` directory and all variables start with `NEXT_PUBLIC_`.

## 📞 Support

For issues or questions, please open an issue on GitHub.
