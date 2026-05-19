'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RateReviewIcon from '@mui/icons-material/RateReview';
import type { Review } from '@/lib/googleReviews';

const PAGE_SIZE = 9;

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const text = review.text ?? '';
  const isLong = text.length > 200;

  return (
    <Card
      sx={{
        boxShadow: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        background: 'none',
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 5 },
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={review.profile_photo_url}
            alt={review.author_name}
            slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
            sx={{ width: 48, height: 48, fontSize: '1.1rem', fontWeight: 700, borderRadius: 0, overflow: 'visible', bgcolor: 'transparent' }}
          >
            {review.author_name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} fontFamily="Poppins" noWrap>
              {review.author_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {review.relative_time_description}
            </Typography>
          </Box>
        </Box>

        <Rating
          value={review.rating}
          readOnly
          size="small"
          sx={{ mb: 1.5, color: '#0056b3' }}
          emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
        />

        {text ? (
          <Box sx={{ flex: 1 }}>
            <Box sx={{ position: 'relative' }}>
              <FormatQuoteIcon
                sx={{ color: 'primary.main', opacity: 0.15, fontSize: 40, position: 'absolute', top: -8, left: -4 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                fontFamily="Montserrat"
                lineHeight={1.7}
                sx={{ pl: 1 }}
              >
                {isLong && !expanded ? `${text.slice(0, 200)}…` : text}
              </Typography>
            </Box>
            {isLong && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ mt: 1, p: 0, minWidth: 0, color: 'primary.main', textTransform: 'none' }}
              >
                {expanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled" fontStyle="italic">
            No written review
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface Props {
  reviews: Review[];
  totalReviewCount: number;
  averageRating: number;
  error: string | null;
}

export default function ReviewsSection({ reviews, totalReviewCount, averageRating, error }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const withText = reviews.filter(r => r.text?.trim());
  const visible = withText.slice(0, visibleCount);
  const hasMore = visibleCount < withText.length;

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8f9fa', minHeight: '60vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="subtitle1" fontFamily="Montserrat" color="primary" mb={1}>
            What Our Members Say
          </Typography>
          <Typography variant="h2" component="h1" fontFamily="Poppins" fontWeight={700} mb={2}>
            Community Reviews
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: 'accent.main', mx: 'auto', mb: 3 }} />

          {!error && averageRating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Rating value={averageRating} readOnly precision={0.1} sx={{ color: '#0056b3' }} />
              <Typography variant="h6" fontWeight={700} color="primary">
                {averageRating.toFixed(1)}
              </Typography>
              <Chip
                label={`${totalReviewCount} reviews on Google`}
                size="small"
                sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider' }}
              />
            </Box>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {visible.map((review, i) => <ReviewCard key={i} review={review} />)}
        </Box>

        {hasMore && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              sx={{ px: 4, borderRadius: 2 }}
            >
              Load more reviews
            </Button>
          </Box>
        )}

        {/* Write a review CTA */}
        {!error && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              href="https://search.google.com/local/writereview?placeid=ChIJUdb15qHjxUcRtuajYyqwLDs"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<RateReviewIcon />}
              sx={{ borderRadius: '50px', px: 4, textTransform: 'none' }}
            >
              Write a Review on Google
            </Button>
          </Box>
        )}

        {!error && reviews.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No reviews found.</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
