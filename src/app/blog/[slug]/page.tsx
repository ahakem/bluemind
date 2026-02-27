/**
 * Blog Post Detail Page - SEO optimized with slug-based URL
 */

import React from 'react';
import { Container, Box, Typography, Chip, Avatar, Button, IconButton, Tooltip } from '@mui/material';
import {
  ArrowBack,
  Facebook,
  Twitter,
  LinkedIn,
  Pinterest,
  ContentCopy,
  WhatsApp,
} from '@mui/icons-material';
import Link from 'next/link';
import { Metadata } from 'next';
import { getBlogPostBySlug, getBlogPosts, getAuthorInfo } from '@/lib/blogService';
import { notFound } from 'next/navigation';
import ViewTracker from '@/components/ViewTracker';
import ShareButtons from '@/components/ShareButtons';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all published blog posts at build time
export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts('published');
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const post = await getBlogPostBySlug(slug);
    
    if (!post) {
      return {
        title: 'Post Not Found | Blue Mind Freediving',
        description: 'The blog post you are looking for could not be found.',
      };
    }

    // Fetch author info for metadata
    const authorInfo = post.author ? await getAuthorInfo(post.author) : null;
    const authorDisplayName = authorInfo?.displayName || post.author?.split('@')[0] || post.author || 'Admin';

    const url = `https://bluemindfreediving.nl/blog/${post.slug}/`;
    
    return {
      title: `${post.title} | Blue Mind Freediving Blog`,
      description: post.excerpt,
      keywords: post.tags?.join(', '),
      openGraph: {
        type: 'article',
        url,
        title: post.title,
        description: post.excerpt,
        images: [
          {
            url: post.image,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt?.toISOString(),
        authors: [authorDisplayName],
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: [post.image],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    return {
      title: 'Blog Post | Blue Mind Freediving',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  try {
    const post = await getBlogPostBySlug(slug);
    
    if (!post) {
      notFound();
    }

    // Fetch author info for metadata and display
    // Prefer saved authorDisplayName, fall back to fetching, then to 'Admin'
    let authorDisplayName = post.authorDisplayName || 'Admin';
    let authorAvatar: string | undefined = post.authorAvatar;
    
    try {
      // Only fetch if we don't already have the display name saved
      if (post.author && !post.authorDisplayName) {
        const authorInfo = await getAuthorInfo(post.author);
        if (authorInfo) {
          authorDisplayName = authorInfo.displayName;
          authorAvatar = authorInfo.avatar || post.authorAvatar;
        }
      }
    } catch (err) {
      console.error('Error fetching author info:', err);
      // Keep existing authorAvatar or the saved one
    }

    const publishDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(post.publishedAt || post.createdAt);

    const updatedDate = post.updatedAt
      ? new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(post.updatedAt)
      : null;

    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Client-side view tracking */}
        <ViewTracker postId={post.id} />
        
        {/* Back Button */}
        <Link href="/blog" style={{ textDecoration: 'none' }}>
          <Button startIcon={<ArrowBack />} sx={{ mb: 4 }}>
            Back to Blog
          </Button>
        </Link>

        {/* Featured Image */}
        {post.image && (
          <Box
            component="img"
            src={post.image}
            alt={post.title}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 4,
            }}
          />
        )}

        {/* Title - h1 for SEO */}
        <Typography component="h1" variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          {post.title}
        </Typography>

        {/* Meta Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          {authorAvatar ? (
            <Avatar 
              src={authorAvatar} 
              alt={authorDisplayName}
              sx={{ width: 48, height: 48, bgcolor: '#0056b3' }}
            />
          ) : (
            <Avatar sx={{ width: 48, height: 48, bgcolor: '#0056b3' }}>
              {authorDisplayName.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {authorDisplayName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {publishDate}
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} variant="outlined" />
            ))}
          </Box>
        )}

        {/* Share Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight={600}>
            Share:
          </Typography>
          <ShareButtons
            title={post.title}
            excerpt={post.excerpt}
            url={`https://bluemindfreediving.nl/blog/${post.slug}/`}
          />
        </Box>

        {/* Content - with semantic HTML styling */}
        <Box
          sx={{
            '& h1': { mt: 3, mb: 1, fontSize: '1.8rem', fontWeight: 700 },
            '& h2': { mt: 3, mb: 1, fontSize: '1.5rem', fontWeight: 700 },
            '& h3': { mt: 2, mb: 0.5, fontSize: '1.2rem', fontWeight: 600 },
            '& h4': { mt: 2, mb: 0.5, fontSize: '1.1rem', fontWeight: 600 },
            '& h5': { mt: 1.5, mb: 0.5, fontSize: '1rem', fontWeight: 600 },
            '& h6': { mt: 1.5, mb: 0.5, fontSize: '0.9rem', fontWeight: 600 },
            '& p': { mb: 2, lineHeight: 1.8, color: '#555' },
            '& ul, & ol': { mb: 2, ml: 2 },
            '& li': { mb: 1, lineHeight: 1.6 },
            '& blockquote': {
              pl: 3,
              borderLeft: 4,
              borderColor: '#0056b3',
              my: 2,
              fontStyle: 'italic',
              color: '#666',
            },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 2 },
            '& pre': {
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              my: 2,
              fontFamily: '"Courier New", monospace',
            },
            '& code': { fontFamily: 'monospace', fontSize: '0.9em', bgcolor: '#f5f5f5', px: 1, borderRadius: 0.5 },
            '& a': { color: '#0056b3', textDecoration: 'underline', '&:hover': { color: '#003d82' } },
            '& strong': { fontWeight: 700 },
            '& em': { fontStyle: 'italic' },
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Updated At */}
        {updatedDate && (
          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="textSecondary">
              Last updated: {updatedDate}
            </Typography>
          </Box>
        )}

        {/* Related Content CTA */}
        <Box sx={{ mt: 8, p: 4, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Ready to start freediving?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
            Join Blue Mind Freediving for professional AIDA training at Sloterparkbad
          </Typography>
          <Link href="/training" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large">
              Explore Our Training
            </Button>
          </Link>
        </Box>
      </Container>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}
