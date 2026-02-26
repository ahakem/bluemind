/**
 * BlogEditor Component - Rich text editor using React Quill
 */

'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, TextField, Button, Chip, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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
}: BlogEditorProps) {
  const [tagInput, setTagInput] = useState('');
  const [mounted, setMounted] = useState(false);

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

      {/* Author Selection */}
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

      {/* Image URL */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Featured Image URL
        </Typography>
        <TextField
          fullWidth
          value={image}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="https://bluemindfreediving.nl/images/..."
          variant="outlined"
        />
        {image && (
          <Box
            component="img"
            src={image}
            alt="preview"
            sx={{ mt: 2, maxWidth: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 1 }}
          />
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
