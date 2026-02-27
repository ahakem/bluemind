/**
 * Blog Index Page - SEO optimized with server-side rendering
 */

import React from 'react';
import { Container, Box, Typography, Chip, Card, CardContent, CardMedia, Avatar } from '@mui/material';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedPosts, getAuthorInfo } from '@/lib/blogService';
import type { BlogPost } from '@/types/admin';

export const metadata: Metadata = {
  title: 'Blog | Blue Mind Freediving',
  description: 'Read articles about freediving, AIDA training, and breath-hold courses. Tips, techniques, and insights from our expert instructors.',
  keywords: 'freediving blog, AIDA training, breath-hold techniques, freediving courses, Amsterdam',
  openGraph: {
    type: 'website',
    locale: 'en_NL',
    url: 'https://bluemindfreediving.nl/blog',
    siteName: 'Blue Mind Freediving',
    title: 'Freediving Blog | Blue Mind',
    description: 'Articles and tips about freediving training and techniques',
  },
};

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let error = false;

  try {
    posts = await getPublishedPosts();
    
    // Fetch author info for all posts with error handling
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        try {
          const authorInfo = post.author ? await getAuthorInfo(post.author) : null;
          const authorDisplayName = authorInfo?.displayName || 'Admin';
          return {
            ...post,
            authorDisplayName,
            authorAvatar: authorInfo?.avatar || post.authorAvatar,
          };
        } catch (err) {
          console.error(`Error fetching author info for ${post.author}:`, err);
          return {
            ...post,
            authorDisplayName: 'Admin',
            authorAvatar: post.authorAvatar,
          };
        }
      })
    );
    posts = postsWithAuthors;
  } catch (err) {
    console.error('Error loading blog posts:', err);
    error = true;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 8 }}>
        <Typography
          component="h1"
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #0056b3 0%, #00a8ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Freediving Blog
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Tips, techniques, and insights from our community
        </Typography>
      </Box>

      {error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error">
            Error loading blog posts. Please try again later.
          </Typography>
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="textSecondary">
            No blog posts yet. Check back soon!
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 4,
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}/`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {post.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.image}
                    alt={post.title}
                  />
                )}
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    component="h2"
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1, color: 'inherit' }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2, flex: 1 }}
                  >
                    {post.excerpt}
                  </Typography>
                  {post.tags && post.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {post.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {post.tags.length > 2 && (
                        <Chip label={`+${post.tags.length - 2}`} size="small" />
                      )}
                    </Box>
                  )}
                  
                  {/* Author and Date */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                    {(post as any).authorAvatar ? (
                      <Avatar 
                        src={(post as any).authorAvatar}
                        alt={(post as any).authorDisplayName}
                        sx={{ width: 24, height: 24 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#0056b3', fontSize: '0.75rem' }}>
                        {((post as any).authorDisplayName?.[0] || 'A').toUpperCase()}
                      </Avatar>
                    )}
                    <Typography variant="caption" color="textSecondary">
                      {(post as any).authorDisplayName} • {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Box>
      )}
    </Container>
  );
}
