/**
 * BlogCard Component - Display blog post summary
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActionArea,
} from '@mui/material';
import Link from 'next/link';
import { BlogPost } from '@/types/admin';

interface BlogCardProps {
  post: BlogPost;
  adminMode?: boolean;
  onEdit?: (id: string) => void;
}

export default function BlogCard({ post, adminMode, onEdit }: BlogCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(post.publishedAt || post.createdAt);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: adminMode ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 4,
        },
      }}
      onClick={() => adminMode && onEdit?.(post.id)}
    >
      <CardActionArea component={!adminMode ? Link : 'div'} href={!adminMode ? `/blog/${post.slug}` : '#'}>
        <CardMedia component="img" height="200" image={post.image} alt={post.title} sx={{ objectFit: 'cover' }} />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography component="h3" variant="h6" sx={{ flex: 1, lineHeight: 1.3 }}>
              {post.title}
            </Typography>
            {adminMode && (
              <Chip
                label={post.status}
                size="small"
                sx={{
                  ml: 1,
                  backgroundColor:
                    post.status === 'published'
                      ? '#4caf50'
                      : post.status === 'review'
                        ? '#ff9800'
                        : '#9e9e9e',
                  color: 'white',
                }}
              />
            )}
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 1, lineHeight: 1.5 }}>
            {post.excerpt}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {post.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              {formattedDate}
            </Typography>
            {adminMode && post.views !== undefined && (
              <Typography variant="caption" color="textSecondary">
                {post.views} views
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
