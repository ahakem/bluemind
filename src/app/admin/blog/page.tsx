/**
 * Admin Blog Management Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Edit, Delete, Visibility, PreviewOutlined } from '@mui/icons-material';
import BlogEditor from '@/components/BlogEditor';
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishBlogPost,
  approveBlogPost,
  rejectBlogPost,
  submitForReview,
  generateSlug,
} from '@/lib/blogService';
import { BlogPost, BlogDraft } from '@/types/admin';
import { useAuth } from '@/lib/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`blog-tabpanel-${index}`}
      aria-labelledby={`blog-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminBlogPage() {
  const { user, adminUser, getAdminUsers } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [availableAuthors, setAvailableAuthors] = useState<Array<{ value: string; label: string }>>([]);

  // Dialog states
  const [openEditor, setOpenEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<BlogDraft>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    tags: [],
    status: 'draft',
    author: adminUser?.uid || '',
    ...(adminUser?.avatar && { authorAvatar: adminUser.avatar }),
    ...(adminUser?.displayName && { authorDisplayName: adminUser.displayName }),
  });

  // Load authors (only for admins/editors, authors auto-select themselves)
  useEffect(() => {
    const fetchAuthors = async () => {
      // Authors don't need to see the author list - they auto-select themselves
      if (adminUser?.role === 'author') {
        setAvailableAuthors([]);
        return;
      }

      try {
        const users = await getAdminUsers();
        const authors = users.map(u => ({
          value: u.uid,
          label: `${u.displayName || u.email.split('@')[0]} (${u.role})`,
        }));
        setAvailableAuthors(authors);
      } catch (err) {
        console.error('Failed to fetch authors:', err);
      }
    };
    fetchAuthors();
  }, []);

  // Load posts
  useEffect(() => {
    loadPosts();
  }, [tab]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: BlogPost[];
      
      if (adminUser?.role === 'author') {
        // Authors see all their posts (draft + review) in the drafts tab
        // This way they can see posts they've submitted for review
        const drafts = await getBlogPosts('draft', adminUser.uid);
        const reviews = await getBlogPosts('review', adminUser.uid);
        data = [...drafts, ...reviews].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      } else {
        // Admin/editor see posts by tab
        const statusFilter = tab === 0 ? 'draft' : tab === 1 ? 'review' : 'published';
        data = await getBlogPosts(statusFilter);
      }
      
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts:', err);
      // Don't show error for authors with no posts, just show empty state
      if (adminUser?.role !== 'author') {
        setError('Failed to load blog posts');
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const newFormData: BlogDraft = {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      tags: [],
      status: 'draft',
      author: adminUser?.uid || '',
    };
    if (adminUser?.avatar) {
      newFormData.authorAvatar = adminUser.avatar;
    }
    if (adminUser?.displayName) {
      newFormData.authorDisplayName = adminUser.displayName;
    }
    setFormData(newFormData);
    setEditingPost(null);
  };

  const handleOpenEditor = (post?: BlogPost) => {
    if (post) {
      // Prevent authors from editing posts under review
      if (adminUser?.role === 'author' && post.status !== 'draft') {
        setError('You can only edit draft posts. Posts under review cannot be edited.');
        return;
      }
      
      setEditingPost(post);
      const newFormData: BlogDraft = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        tags: post.tags,
        status: post.status,
        author: post.author,
      };
      // Only include authorAvatar if it exists
      if (post.authorAvatar || adminUser?.avatar) {
        newFormData.authorAvatar = post.authorAvatar || adminUser?.avatar;
      }
      // Only include authorDisplayName if it exists
      if (post.authorDisplayName || adminUser?.displayName) {
        newFormData.authorDisplayName = post.authorDisplayName || adminUser?.displayName;
      }
      setFormData(newFormData);
    } else {
      resetForm();
    }
    setOpenEditor(true);
  };

  const handleCloseEditor = () => {
    setOpenEditor(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      setError('Please fill in title, excerpt, and content');
      return;
    }

    // Prevent authors from publishing
    if (adminUser?.role === 'author' && formData.status !== 'draft') {
      setError('Authors can only save posts as drafts');
      return;
    }

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const author = formData.author || adminUser?.uid || '';
      const authorAvatar = adminUser?.avatar;
      const authorDisplayName = adminUser?.displayName;

      if (editingPost) {
        const updateData: Partial<BlogPost> = {
          ...formData,
          slug,
          author,
        };
        // Only include authorAvatar if it's defined
        if (authorAvatar) {
          updateData.authorAvatar = authorAvatar;
        }
        // Only include authorDisplayName if it's defined
        if (authorDisplayName) {
          updateData.authorDisplayName = authorDisplayName;
        }
        await updateBlogPost(editingPost.id, updateData);
        setSuccess('Post updated successfully');
      } else {
        const createData: any = {
          ...formData,
          slug,
        };
        // Only include authorAvatar if it's defined
        if (authorAvatar) {
          createData.authorAvatar = authorAvatar;
        }
        // Only include authorDisplayName if it's defined
        if (authorDisplayName) {
          createData.authorDisplayName = authorDisplayName;
        }
        await createBlogPost(createData, author);
        setSuccess('Post created successfully');
      }

      handleCloseEditor();
      loadPosts();
    } catch (err) {
      setError('Failed to save post');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;
    try {
      await deleteBlogPost(deletePostId);
      setSuccess('Post deleted successfully');
      setOpenConfirmDelete(false);
      setDeletePostId(null);
      loadPosts();
    } catch (err) {
      setError('Failed to delete post');
      console.error(err);
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      await publishBlogPost(postId);
      setSuccess('Post published successfully');
      loadPosts();
    } catch (err) {
      setError('Failed to publish post');
      console.error(err);
    }
  };

  const handleSubmitForReview = async (postId: string) => {
    try {
      await submitForReview(postId);
      setSuccess('Post submitted for review');
      loadPosts();
    } catch (err) {
      setError('Failed to submit for review');
      console.error(err);
    }
  };

  const handleApprove = async (postId: string) => {
    try {
      await approveBlogPost(postId, adminUser?.displayName || adminUser?.email || 'Admin');
      setSuccess('Post approved and published');
      loadPosts();
    } catch (err) {
      setError('Failed to approve post');
      console.error(err);
    }
  };

  const handleReject = async (postId: string) => {
    try {
      await rejectBlogPost(postId);
      setSuccess('Post returned to draft');
      loadPosts();
    } catch (err) {
      setError('Failed to reject post');
      console.error(err);
    }
  };

  const handlePreview = (post: BlogPost) => {
    setPreviewPost(post);
    setOpenPreview(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Blog Management
        </Typography>
        <Button variant="contained" onClick={() => handleOpenEditor()}>
          Create New Post
        </Button>
      </Box>

      {adminUser?.role === 'author' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          As an <strong>Author</strong>, you can create and edit your draft posts, and submit them for review. This tab shows all your posts (drafts and under review).
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)} aria-label="blog-tabs">
          <Tab label={adminUser?.role === 'author' ? 'My Posts' : 'Drafts'} id="blog-tab-0" />
          {adminUser?.role !== 'author' && <Tab label="Under Review" id="blog-tab-1" />}
          {adminUser?.role !== 'author' && <Tab label="Published" id="blog-tab-2" />}
        </Tabs>
      </Paper>

      {/* Posts Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>
            No posts in this category
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Views</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{post.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          post.status === 'published'
                            ? '#4caf50'
                            : post.status === 'review'
                              ? '#ff9800'
                              : '#9e9e9e',
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{post.views}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit',
                    }).format(post.createdAt)}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" onClick={() => handlePreview(post)} title="Preview">
                      <Visibility fontSize="small" />
                    </IconButton>
                    {/* Authors can only edit drafts, not posts under review */}
                    {(adminUser?.role !== 'author' || post.status === 'draft') && (
                      <IconButton size="small" onClick={() => handleOpenEditor(post)} title="Edit">
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {/* Only admins can delete */}
                    {adminUser?.role === 'admin' && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeletePostId(post.id);
                          setOpenConfirmDelete(true);
                        }}
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}

                    {/* Status-specific actions */}
                    {post.status === 'draft' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSubmitForReview(post.id)}
                        sx={{ ml: 1 }}
                      >
                        Submit Review
                      </Button>
                    )}
                    {/* Only admins/editors can approve/reject */}
                    {post.status === 'review' && adminUser?.role !== 'author' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleApprove(post.id)}
                          sx={{ ml: 0.5 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleReject(post.id)}
                          sx={{ ml: 0.5 }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Editor Modal */}
      <Dialog open={openEditor} onClose={handleCloseEditor} maxWidth="lg" fullWidth>
        <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
        <DialogContent dividers>
          <BlogEditor
            title={formData.title}
            onTitleChange={(v) => setFormData({ ...formData, title: v })}
            excerpt={formData.excerpt}
            onExcerptChange={(v) => setFormData({ ...formData, excerpt: v })}
            content={formData.content}
            onContentChange={(v) => setFormData({ ...formData, content: v })}
            tags={formData.tags}
            onTagsChange={(v) => setFormData({ ...formData, tags: v })}
            image={formData.image}
            onImageChange={(v) => setFormData({ ...formData, image: v })}
            author={formData.author || ''}
            onAuthorChange={(v) => setFormData({ ...formData, author: v })}
            availableAuthors={adminUser?.role === 'author' ? [] : availableAuthors}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditor}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingPost ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Preview: {previewPost?.title}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {previewPost && (
            <Box>
              {previewPost.image && (
                <Box
                  component="img"
                  src={previewPost.image}
                  alt={previewPost.title}
                  sx={{ width: '100%', mb: 3, borderRadius: 1 }}
                />
              )}
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                {previewPost.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
                {previewPost.excerpt}
              </Typography>
              <Box
                sx={{
                  '& h1': { mt: 2, mb: 1, fontSize: '1.5rem' },
                  '& p': { mb: 1.5, lineHeight: 1.6 },
                  '& img': { maxWidth: '100%', height: 'auto' },
                }}
                dangerouslySetInnerHTML={{ __html: previewPost.content }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={openConfirmDelete} onClose={() => setOpenConfirmDelete(false)}>
        <DialogTitle>Delete Post?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this post? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
