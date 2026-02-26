/**
 * Admin Profile Page - Update avatar and display name
 */

'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { useAuth } from '@/lib/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function AdminProfilePage() {
  const { adminUser, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(adminUser?.displayName || '');
  const [avatar, setAvatar] = useState(adminUser?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminUser || !storage) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${adminUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setAvatar(downloadURL);
      setSuccess('Avatar uploaded successfully');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateProfile(displayName, avatar);
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Edit Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={avatar}
            sx={{ width: 120, height: 120, mb: 2, bgcolor: '#0077be', fontSize: '3rem' }}
          >
            {!avatar && (displayName || adminUser?.email || 'A')[0].toUpperCase()}
          </Avatar>

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
          <label htmlFor="avatar-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={uploading ? <CircularProgress size={20} /> : <PhotoCamera />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Avatar'}
            </Button>
          </label>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Maximum 2MB, JPG/PNG/WebP
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 3 }}
          helperText="This name will appear on your blog posts"
        />

        <TextField
          fullWidth
          label="Email"
          value={adminUser?.email}
          disabled
          sx={{ mb: 3 }}
          helperText="Email cannot be changed"
        />

        <TextField
          fullWidth
          label="Role"
          value={adminUser?.role}
          disabled
          sx={{ mb: 4 }}
        />

        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          onClick={handleSave}
          disabled={saving || uploading}
          fullWidth
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Paper>
    </Container>
  );
}
