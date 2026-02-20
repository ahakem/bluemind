# Admin Panel Setup Guide

## 1. Firebase Project Setup

### Enable Firebase Services
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Enable the following services:
   - **Authentication** → Sign-in method → Email/Password
   - **Firestore Database** → Create database (start in production mode)
   - **Storage** → Get started

### Get Firebase Config
1. Go to Project Settings → General → Your apps
2. Click "Add app" → Web
3. Copy the configuration values

### Add to Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

## 2. Deploy Security Rules

Deploy Firestore and Storage rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

## 3. Create First Admin User

Since there's no admin user yet, you need to manually create one in Firebase:

### Option A: Using Firebase Console
1. Go to Firebase Console → Authentication → Users
2. Click "Add user" and create a user with email/password
3. Copy the User UID
4. Go to Firestore Database → Start collection
5. Create collection: `adminUsers`
6. Add document with ID = User UID
7. Add fields:
   - `email` (string): your email
   - `displayName` (string): Your Name
   - `role` (string): admin
   - `createdAt` (timestamp): (click timestamp and pick current time)

### Option B: Using Firebase CLI
```bash
# Install Firebase Admin SDK
npm install -g firebase-tools

# Login to Firebase
firebase login

# Use the setup script (create this in your project)
node scripts/create-admin.js
```

## 4. Access Admin Panel

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/admin/login`
3. Sign in with your admin credentials
4. You now have access to:
   - `/admin` - Dashboard
   - `/admin/partners` - Manage community partners
   - `/admin/instructors` - Manage guest instructors
   - `/admin/users` - Manage admin users (admin role only)

## Features

### Partners Management
- Add/edit/delete community partners
- Upload and crop partner logos
- Set partner website URL
- Add description (2 lines recommended)

### Guest Instructors Management
- Add/edit/delete guest instructors
- Upload and crop circular profile photos
- Set specialty (e.g., "AIDA Instructor")
- Add bio
- Link to social media or website

### User Management (Admin only)
- Add new admin users
- Set roles (Admin or Editor)
- Remove admin access

## Roles

- **Admin**: Full access to all sections including user management
- **Editor**: Can manage partners and instructors only

## Image Upload

Images are automatically:
- Cropped to the specified aspect ratio
- Converted to WebP format for optimization
- Uploaded to Firebase Storage
- URLs stored in Firestore documents

## Troubleshooting

### "Permission denied" errors
- Make sure Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Verify the user exists in both Firebase Auth AND the `adminUsers` collection

### Images not uploading
- Check Storage rules are deployed: `firebase deploy --only storage:rules`
- Verify Storage is enabled in Firebase Console

### Login not working
- Ensure Email/Password authentication is enabled in Firebase Console
- Check that the user exists in Firebase Auth
- Verify the user has a document in the `adminUsers` collection
