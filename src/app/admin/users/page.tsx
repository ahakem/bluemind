'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth, AdminUser } from '@/lib/AuthContext';

export default function UsersManagement() {
  const { adminUser, createAdminUser, getAdminUsers, deleteAdminUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'editor' as 'admin' | 'editor' | 'author',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = () => {
    setFormData({ email: '', password: '', displayName: '', role: 'author' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({ email: '', password: '', displayName: '', role: 'author' });
  };

  const handleSave = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      showSnackbar('Email and password are required', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showSnackbar('Password must be at least 6 characters', 'error');
      return;
    }

    setSaving(true);
    try {
      await createAdminUser(formData.email, formData.password, formData.displayName, formData.role);
      showSnackbar('User created successfully. Please log back in.', 'success');
      handleCloseDialog();
      fetchUsers();
      // Note: User will be logged out and redirected to login page automatically
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    // Prevent self-deletion
    if (selectedUser.uid === adminUser?.uid) {
      showSnackbar('You cannot delete your own account', 'error');
      setDeleteDialogOpen(false);
      return;
    }

    setSaving(true);
    try {
      await deleteAdminUser(selectedUser.uid);
      showSnackbar('User deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Failed to delete user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Only admins can manage users
  if (adminUser?.role !== 'admin') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography color="text.secondary">
          Only administrators can manage users.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ bgcolor: '#0077be', '&:hover': { bgcolor: '#005a8c' } }}
        >
          Add User
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Admin</strong> users can manage all content and other users. <strong>Editor</strong> users can manage partners, instructors and all blog posts. <strong>Author</strong> users can only create and edit their own draft blog posts.
      </Alert>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                      <Typography color="text.secondary">
                        No admin users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.uid} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={user.avatar} 
                            sx={{ 
                              bgcolor: user.role === 'admin' ? '#ff6b6b' : 
                                       user.role === 'author' ? '#4caf50' : '#0077be',
                              width: 40,
                              height: 40
                            }}
                          >
                            {!user.avatar && (() => {
                              const name = user.displayName || user.email || 'U';
                              if (name.includes('@')) {
                                return name.split('@')[0][0].toUpperCase();
                              }
                              return name[0].toUpperCase();
                            })()}
                          </Avatar>
                          <Box>
                            <Typography component="div" fontWeight={500}>
                              {user.displayName || user.email?.split('@')[0] || 'No name'}
                              {user.uid === adminUser?.uid && (
                                <Chip label="You" size="small" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <IconButton
                          onClick={() => openDeleteDialog(user)}
                          color="error"
                          disabled={user.uid === adminUser?.uid}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Admin User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="John Doe"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              helperText="At least 6 characters"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' | 'author' })}
              >
                <MenuItem value="author">Author - Can create & edit own draft posts</MenuItem>
                <MenuItem value="editor">Editor - Can manage partners, instructors & blog</MenuItem>
                <MenuItem value="admin">Admin - Full access including user management</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: '#0077be', '&:hover': { bgcolor: '#005a8c' } }}
          >
            {saving ? <CircularProgress size={24} /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove &quot;{selectedUser?.displayName || selectedUser?.email}&quot; from admin access?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This will only remove their admin access. The Firebase Auth account will remain active.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Remove Access'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
