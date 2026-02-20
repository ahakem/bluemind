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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageCropper from '@/components/admin/ImageCropper';
import { instructorsService, imageService } from '@/lib/adminService';
import { GuestInstructor } from '@/types/admin';

const socialPlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'WhatsApp', 'Website', 'YouTube', 'TikTok'];

export default function InstructorsManagement() {
  const [instructors, setInstructors] = useState<GuestInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedInstructor, setSelectedInstructor] = useState<GuestInstructor | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    bio: '',
    socialLink: '',
    socialPlatform: 'Instagram',
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const data = await instructorsService.getAll();
      setInstructors(data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      showSnackbar('Failed to load instructors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (instructor?: GuestInstructor) => {
    if (instructor) {
      setSelectedInstructor(instructor);
      setFormData({
        name: instructor.name,
        specialty: instructor.specialty,
        bio: instructor.bio,
        socialLink: instructor.socialLink,
        socialPlatform: instructor.socialPlatform,
      });
    } else {
      setSelectedInstructor(null);
      setFormData({ name: '', specialty: '', bio: '', socialLink: '', socialPlatform: 'Instagram' });
    }
    setImageBlob(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedInstructor(null);
    setFormData({ name: '', specialty: '', bio: '', socialLink: '', socialPlatform: 'Instagram' });
    setImageBlob(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showSnackbar('Instructor name is required', 'error');
      return;
    }

    if (!formData.specialty.trim()) {
      showSnackbar('Specialty is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = selectedInstructor?.image || '';

      // Upload new image if provided
      if (imageBlob) {
        imageUrl = await imageService.uploadImage(imageBlob, 'instructors');
      }

      if (selectedInstructor) {
        // Update existing instructor
        await instructorsService.update(selectedInstructor.id, {
          ...formData,
          image: imageUrl,
        });
        showSnackbar('Instructor updated successfully', 'success');
      } else {
        // Create new instructor
        await instructorsService.create({
          ...formData,
          image: imageUrl,
        });
        showSnackbar('Instructor created successfully', 'success');
      }

      handleCloseDialog();
      fetchInstructors();
    } catch (error) {
      console.error('Error saving instructor:', error);
      showSnackbar('Failed to save instructor', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInstructor) return;

    setSaving(true);
    try {
      await instructorsService.delete(selectedInstructor.id);
      showSnackbar('Instructor deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedInstructor(null);
      fetchInstructors();
    } catch (error) {
      console.error('Error deleting instructor:', error);
      showSnackbar('Failed to delete instructor', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (instructor: GuestInstructor) => {
    setSelectedInstructor(instructor);
    setDeleteDialogOpen(true);
  };

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
          Guest Instructors Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#0077be', '&:hover': { bgcolor: '#005a8c' } }}
        >
          Add Instructor
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Photo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Specialty</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Bio</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Social</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instructors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                      <Typography color="text.secondary">
                        No instructors yet. Click &quot;Add Instructor&quot; to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  instructors.map((instructor) => (
                    <TableRow key={instructor.id} hover>
                      <TableCell>
                        <Avatar
                          src={instructor.image}
                          alt={instructor.name}
                          sx={{ width: 50, height: 50 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{instructor.name}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: 'rgba(0, 119, 190, 0.1)',
                            color: '#0077be',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                          }}
                        >
                          {instructor.specialty}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {instructor.bio}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {instructor.socialLink && (
                          <Button
                            component="a"
                            href={instructor.socialLink}
                            target="_blank"
                            size="small"
                            sx={{ textTransform: 'none' }}
                          >
                            {instructor.socialPlatform}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <IconButton onClick={() => handleOpenDialog(instructor)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => openDeleteDialog(instructor)} color="error">
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedInstructor ? 'Edit Instructor' : 'Add New Instructor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" mb={1}>Profile Photo (Circular)</Typography>
              <ImageCropper
                onImageCropped={setImageBlob}
                aspectRatio={1}
                circular={true}
                label="Upload Photo"
                currentImage={selectedInstructor?.image}
              />
            </Box>
            <TextField
              fullWidth
              label="Instructor Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="e.g., AIDA Instructor, Depth Specialist"
              required
            />
            <TextField
              fullWidth
              label="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              multiline
              rows={3}
              helperText="Brief bio about the instructor"
            />
            <FormControl fullWidth>
              <InputLabel>Social Platform</InputLabel>
              <Select
                value={formData.socialPlatform}
                label="Social Platform"
                onChange={(e) => setFormData({ ...formData, socialPlatform: e.target.value })}
              >
                {socialPlatforms.map((platform) => (
                  <MenuItem key={platform} value={platform}>{platform}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Social Link / Website"
              value={formData.socialLink}
              onChange={(e) => setFormData({ ...formData, socialLink: e.target.value })}
              placeholder="https://instagram.com/username"
            />
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
            {saving ? <CircularProgress size={24} /> : selectedInstructor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Instructor</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{selectedInstructor?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Delete'}
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
