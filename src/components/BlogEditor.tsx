/**
 * BlogEditor Component - Rich text editor using React Quill
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, TextField, Button, Chip, CircularProgress, MenuItem, Select, FormControl, InputLabel, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { imageService } from '@/lib/adminService';
import 'react-quill/dist/quill.snow.css';

// Polyfill for React 19 compatibility with react-quill
if (typeof window !== 'undefined') {
  const ReactDOM = require('react-dom');
  if (!ReactDOM.findDOMNode) {
    ReactDOM.findDOMNode = (node: any) => {
      if (node instanceof HTMLElement) return node;
      return node?.current || null;
    };
  }
}

// Dynamically import to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return RQ;
  },
  { ssr: false, loading: () => <CircularProgress /> }
);

interface BlogEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
  excerpt: string;
  onExcerptChange: (excerpt: string) => void;
  content: string;
  onContentChange: (content: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  image: string;
  onImageChange: (image: string) => void;
  author: string;
  onAuthorChange: (author: string) => void;
  availableAuthors: Array<{ value: string; label: string }>;
  ctaText: string;
  onCtaTextChange: (text: string) => void;
  ctaLink: string;
  onCtaLinkChange: (link: string) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image'],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
};

export default function BlogEditor({
  title,
  onTitleChange,
  excerpt,
  onExcerptChange,
  content,
  onContentChange,
  tags,
  onTagsChange,
  image,
  onImageChange,
  author,
  onAuthorChange,
  availableAuthors,
  ctaText,
  onCtaTextChange,
  ctaLink,
  onCtaLinkChange,
}: BlogEditorProps) {
  const [tagInput, setTagInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB.');
      return;
    }

    setUploading(true);
    try {
      const url = await imageService.uploadImage(file, 'blog');
      onImageChange(url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError('Upload failed. Please try again or use a URL instead.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Post Title
        </Typography>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter blog post title..."
          variant="outlined"
        />
      </Box>

      {/* Author Selection - Only show for admins/editors */}
      {availableAuthors.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Author
          </Typography>
          <FormControl fullWidth>
            <Select
              value={author}
              onChange={(e) => onAuthorChange(e.target.value)}
              displayEmpty
            >
              {availableAuthors.map((authorOption) => (
                <MenuItem key={authorOption.value} value={authorOption.value}>
                  {authorOption.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Featured Image */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Featured Image
        </Typography>

        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            sx={{ textTransform: 'none' }}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          <Typography variant="body2" color="text.secondary">
            or enter URL below
          </Typography>
        </Box>

        {uploadError && (
          <Alert severity="error" onClose={() => setUploadError(null)} sx={{ mb: 1.5 }}>
            {uploadError}
          </Alert>
        )}

        {/* URL fallback */}
        <TextField
          fullWidth
          size="small"
          value={image}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="https://bluemindfreediving.nl/images/..."
          variant="outlined"
        />
        {image && (
          <Box sx={{ mt: 2, position: 'relative' }}>
            <Box
              component="img"
              src={image}
              alt="preview"
              sx={{ maxWidth: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 1 }}
            />
            <Button
              size="small"
              color="error"
              onClick={() => onImageChange('')}
              sx={{ position: 'absolute', top: 8, right: 8, minWidth: 'auto', bgcolor: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' } }}
            >
              Remove
            </Button>
          </Box>
        )}
      </Box>

      {/* Excerpt */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Excerpt
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="Brief summary of your post..."
          variant="outlined"
        />
      </Box>

      {/* Tags */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Tags
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add tag and press Enter..."
          />
          <Button variant="contained" onClick={handleAddTag}>
            Add Tag
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} variant="outlined" />
          ))}
        </Box>
      </Box>

      {/* Call to Action */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Call to Action (optional)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Add a button at the bottom of the post to drive readers to take action.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={ctaText}
            onChange={(e) => onCtaTextChange(e.target.value)}
            placeholder="e.g. Join Our Next Training"
            label="Button Text"
            variant="outlined"
          />
          <TextField
            fullWidth
            size="small"
            value={ctaLink}
            onChange={(e) => onCtaLinkChange(e.target.value)}
            placeholder="e.g. /training or https://..."
            label="Button Link"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Content Editor */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Content
        </Typography>
        {mounted && (
          <ReactQuill
            modules={modules}
            theme="snow"
            value={content}
            onChange={onContentChange}
            style={{ minHeight: '400px' }}
          />
        )}
      </Box>
    </Box>
  );
}
