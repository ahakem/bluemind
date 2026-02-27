# Debug Permission Issues

## Check These in Firestore Console

### 1. Check Author's adminUsers Document
1. Go to Firestore → `adminUsers` collection
2. Find document with ID = your author's UID
3. Verify it has these fields:
   - `email`: (your email)
   - `displayName`: (your name)
   - `role`: **must be exactly "author"** (lowercase, no spaces)
   - `createdAt`: (timestamp)

### 2. Check Blog Post Document
1. Go to Firestore → `blog_posts` collection
2. Find your blog post
3. Verify it has these fields:
   - `author`: (should be the UID that matches your adminUsers document ID)
   - `status`: (probably "draft")

### 3. Verify Database Name
1. Check Firebase Console → Firestore Database
2. Look at the top - is it "(default)" or "landing"?
3. If it's "landing", the rules use `{database}` variable which should work

## Common Issues

### Issue: Role field has wrong value
- **Problem**: Role might be "Author" instead of "author" (case sensitive!)
- **Fix**: Edit the document in Firestore, change `role` to lowercase "author"

### Issue: adminUsers document doesn't exist
- **Problem**: User was created in Firebase Auth but not in adminUsers collection
- **Fix**: Create a document in `adminUsers` collection with ID = user UID and add the fields above

### Issue: Old blog posts have email/displayName in author field
- **Problem**: Posts created before the fix still have old author format
- **Fix**: Delete old test posts, or manually update them in Firestore to have the UID

## Quick Test
1. Open browser console on the admin blog page
2. Run: `firebase.auth().currentUser.uid` - copy this UID
3. Go to Firestore → `blog_posts` → your post
4. Verify the `author` field matches the UID from step 2

## If Still Not Working
The issue might be with how Firestore rules handle the `get()` call. Try this simpler rule temporarily:

```
match /blog_posts/{postId} {
  // Temporary debug rule - allow authors to read their own posts  
  allow read: if request.auth != null && 
    resource.data.author == request.auth.uid;
}
```

If this works, the issue is with the role check `get()` call.
