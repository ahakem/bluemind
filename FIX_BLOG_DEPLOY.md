# Fix Blog Posts and Deploy

## What Changed

### 1. Query Optimization
- **Changed ordering**: Now uses `updatedAt` instead of `publishedAt` (works for all statuses including drafts)
- **Fixed constraint order**: Proper order for Firestore composite index

### 2. Security Rules
- **Optimized rule evaluation**: Checks simple author match BEFORE expensive role lookups
- **Order**: published → author match → admin/editor check

### 3. Indexes
- Created `firestore.indexes.json` with required composite indexes
- Added to `firebase.json` configuration

## Deploy Everything

```bash
# Deploy rules and indexes together
firebase deploy --only firestore

# This deploys:
# - firestore.rules (security rules)
# - firestore.indexes.json (composite indexes)
```

## Important: Check Existing Posts

If you created any blog posts BEFORE this fix, they may have the wrong author format.

### Check in Firestore Console

1. Go to Firestore → `blog_posts` collection
2. Open each post
3. Check the `author` field:
   - ✅ **Correct**: Looks like `xYz123AbC...` (28-character UID)
   - ❌ **Wrong**: Looks like email or displayName

### Fix Wrong Author Format

If any posts have email/displayName in the `author` field:

**Option 1: Delete and recreate** (easiest)
- Delete the post in admin panel
- Create it again (it will use the correct UID)

**Option 2: Manual fix in Firestore Console**
1. Get your UID: 
   - Go to Firebase Console → Authentication → Users
   - Find your user, copy the UID
2. Go to Firestore → `blog_posts` → the post
3. Edit the `author` field
4. Paste your UID
5. Save

## Test After Deploy

1. **Log out completely** (to clear cached tokens)
2. **Log back in as author**
3. Go to `/admin/blog`
4. You should see your posts without errors

## If Still Getting Permission Errors

Check these in order:

**1. Verify rules are deployed:**
```bash
firebase deploy --only firestore:rules
```

**2. Check your adminUsers document:**
- Firebase Console → Firestore → `adminUsers` collection
- Find document with ID = your UID
- Verify it has `role: "author"` (lowercase)

**3. Check blog post author field:**
- Firestore → `blog_posts` collection
- Open your post
- Verify `author` field = your UID (same as adminUsers document ID)

**4. Wait for indexes to build:**
- Go to Firestore → Indexes tab
- Check if indexes are "Building" or "Enabled"
- Building can take 2-5 minutes

**5. Check browser console:**
```javascript
// Get your current UID
firebase.auth().currentUser.uid

// Try manual query
const db = firebase.firestore();
db.collection('blog_posts')
  .where('author', '==', firebase.auth().currentUser.uid)
  .where('status', '==', 'draft')
  .orderBy('updatedAt', 'desc')
  .get()
  .then(snap => console.log('Found:', snap.size))
  .catch(err => console.error('Error:', err));
```

## Index Build Status

After deploying, check index status:
- Go to: https://console.firebase.google.com/project/bluemind-landing/firestore/databases/landing/indexes
- Wait for all indexes to show "Enabled" (not "Building")
- This can take 2-5 minutes for small collections

## Common Issues

**"Index building" - Query works but slow**
- Indexes are being created
- Wait 2-5 minutes, refresh page
- Check Firestore Console → Indexes tab

**"Missing permissions" - Query fails completely**
- Rules not deployed: `firebase deploy --only firestore:rules`
- Wrong author format: Check posts have UID not email
- Need to log out/in to refresh auth token

**"Index already exists" error**
- The index you created manually conflicts with firestore.indexes.json
- Firebase will use the existing one, this is fine
- Or delete manual index and let Firebase create from config file
