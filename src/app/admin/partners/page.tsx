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
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageCropper from '@/components/admin/ImageCropper';
import { partnersService, imageService } from '@/lib/adminService';
import { Partner } from '@/types/admin';

export default function PartnersManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    socialLink: '',
    socialPlatform: 'Instagram',
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const data = await partnersService.getAll();
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
      showSnackbar('Failed to load partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (partner?: Partner) => {
    if (partner) {
      setSelectedPartner(partner);
      setFormData({
        name: partner.name,
        description: partner.description,
        website: partner.website || '',
        socialLink: partner.socialLink || '',
        socialPlatform: partner.socialPlatform || 'Instagram',
      });
    } else {
      setSelectedPartner(null);
      setFormData({ name: '', description: '', website: '', socialLink: '', socialPlatform: 'Instagram' });
    }
    setImageBlob(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPartner(null);
    setFormData({ name: '', description: '', website: '', socialLink: '', socialPlatform: 'Instagram' });
    setImageBlob(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showSnackbar('Partner name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let logoUrl = selectedPartner?.logo || '';

      // Upload new image if provided
      if (imageBlob) {
        logoUrl = await imageService.uploadImage(imageBlob, 'partners');
      }

      if (selectedPartner) {
        // Update existing partner
        await partnersService.update(selectedPartner.id, {
          ...formData,
          logo: logoUrl,
        });
        showSnackbar('Partner updated successfully', 'success');
      } else {
        // Create new partner
        await partnersService.create({
          ...formData,
          logo: logoUrl,
        });
        showSnackbar('Partner created successfully', 'success');
      }

      handleCloseDialog();
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      showSnackbar('Failed to save partner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPartner) return;

    setSaving(true);
    try {
      await partnersService.delete(selectedPartner.id);
      showSnackbar('Partner deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedPartner(null);
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      showSnackbar('Failed to delete partner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (partner: Partner) => {
    setSelectedPartner(partner);
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
          Partners Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#0077be', '&:hover': { bgcolor: '#005a8c' } }}
        >
          Add Partner
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Logo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Website</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                      <Typography color="text.secondary">
                        No partners yet. Click &quot;Add Partner&quot; to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id} hover>
                      <TableCell>
                        {partner.logo ? (
                          <Box
                            component="img"
                            src={partner.logo}
                            alt={partner.name}
                            sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              bgcolor: 'grey.200',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              No Logo
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{partner.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {partner.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {partner.website && (
                          <Button
                            component="a"
                            href={partner.website}
                            target="_blank"
                            size="small"
                            sx={{ textTransform: 'none' }}
                          >
                            Visit
                          </Button>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <IconButton onClick={() => handleOpenDialog(partner)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => openDeleteDialog(partner)} color="error">
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
        <DialogTitle>{selectedPartner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" mb={1}>Partner Logo</Typography>
              <ImageCropper
                onImageCropped={setImageBlob}
                aspectRatio={1}
                label="Upload Logo"
                currentImage={selectedPartner?.logo}
              />
            </Box>
            <TextField
              fullWidth
              label="Partner Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              helperText="Brief description (2-3 lines recommended)"
            />
            <TextField
              fullWidth
              label="Website URL"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
            <Box>
              <Typography variant="subtitle2" mb={1}>Social Media</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  select
                  label="Social Platform"
                  value={formData.socialPlatform}
                  onChange={(e) => setFormData({ ...formData, socialPlatform: e.target.value })}
                >
                  {['Instagram', 'Facebook', 'LinkedIn', 'WhatsApp', 'Website', 'YouTube', 'TikTok'].map((platform) => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Social Profile URL"
                  value={formData.socialLink}
                  onChange={(e) => setFormData({ ...formData, socialLink: e.target.value })}
                  placeholder="https://instagram.com/username"
                />
              </Box>
            </Box>
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
            {saving ? <CircularProgress size={24} /> : selectedPartner ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Partner</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{selectedPartner?.name}&quot;? This action cannot be undone.
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
