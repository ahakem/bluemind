# Test Author Permissions

## Steps to Test

### 1. Verify Your Setup in Firestore Console

**Check adminUsers Document:**
1. Firebase Console → Firestore Database → `adminUsers` collection
2. Find document with ID = your user's UID
3. Verify these fields exist:
   - `role`: "author" (must be lowercase)
   - `email`: (your email)
   - `displayName`: (your name)

**Check Blog Post:**
1. Go to `blog_posts` collection
2. Open your blog post
3. Verify:
   - `author` field = your UID (same as adminUsers document ID)
   - `status` = "draft"

### 2. Deploy Updated Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Test in Browser

1. Log out and log back in (to refresh permissions)
2. Go to `/admin/blog`
3. You should now see your blog post

## What Changed

**Before:** Rule checked both role AND author match:
```
get(...adminUsers/uid).data.role == 'author' AND 
resource.data.author == request.auth.uid
```

**After:** Rule only checks author match:
```
request.auth != null AND 
resource.data.author == request.auth.uid
```

This is simpler and more reliable. Any authenticated user can read posts where they are the author.

## If It Still Doesn't Work

Add this to your browser console when on `/admin/blog`:

```javascript
// Check your current user UID
console.log('Current UID:', firebase.auth().currentUser?.uid);

// Try to manually fetch blog posts
const db = firebase.firestore();
db.collection('blog_posts')
  .where('author', '==', firebase.auth().currentUser.uid)
  .get()
  .then(snapshot => {
    console.log('Found posts:', snapshot.size);
    snapshot.forEach(doc => console.log(doc.id, doc.data()));
  })
  .catch(err => console.error('Error:', err));
```

This will show if the issue is with the rules or the code.
