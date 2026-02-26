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
    author: adminUser?.displayName || adminUser?.email || '',
    authorAvatar: adminUser?.avatar || undefined,
  });

  // Load authors
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const users = await getAdminUsers();
        const authors = users.map(u => ({
          value: u.displayName || u.email,
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
      const statusFilter = tab === 0 ? 'draft' : tab === 1 ? 'review' : 'published';
      const data = await getBlogPosts(statusFilter);
      setPosts(data);
    } catch (err) {
      setError('Failed to load blog posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      tags: [],
      status: 'draft',
      author: adminUser?.displayName || adminUser?.email || '',
      authorAvatar: adminUser?.avatar || undefined,
    });
    setEditingPost(null);
  };

  const handleOpenEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        tags: post.tags,
        status: post.status,
        author: post.author || adminUser?.displayName || adminUser?.email || '',
        authorAvatar: post.authorAvatar || adminUser?.avatar || undefined,
      });
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

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const author = formData.author || adminUser?.displayName || adminUser?.email || 'Admin';
      const authorAvatar = adminUser?.avatar;

      if (editingPost) {
        await updateBlogPost(editingPost.id, {
          ...formData,
          slug,
          author,
          authorAvatar,
        } as Partial<BlogPost>);
        setSuccess('Post updated successfully');
      } else {
        await createBlogPost(
          {
            ...formData,
            slug,
            authorAvatar,
          },
          author
        );
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
          <Tab label="Drafts" id="blog-tab-0" />
          <Tab label="Under Review" id="blog-tab-1" />
          <Tab label="Published" id="blog-tab-2" />
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
                    <IconButton size="small" onClick={() => handleOpenEditor(post)} title="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
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
                    {post.status === 'review' && (
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
            availableAuthors={availableAuthors}
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
              <Box
                component="img"
                src={previewPost.image}
                alt={previewPost.title}
                sx={{ width: '100%', mb: 3, borderRadius: 1 }}
              />
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
