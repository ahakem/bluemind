import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Lazy load heavy components
export const LazyGallery = lazy(() => import('../sections/Gallery'));
export const LazyTeam = lazy(() => import('../sections/Team'));
export const LazyServices = lazy(() => import('../sections/Services'));
export const LazyTestimonials = lazy(() => import('../sections/Testimonials'));

// Loading fallback component
export const SectionLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="200px"
    py={4}
  >
    <CircularProgress size={40} />
  </Box>
);

// Wrapper component for lazy sections
interface LazySectionProps {
  children: React.ReactNode;
}

export const LazySection: React.FC<LazySectionProps> = ({ children }) => (
  <Suspense fallback={<SectionLoader />}>
    {children}
  </Suspense>
);

export default {
  LazyGallery,
  LazyTeam,
  LazyServices,
  LazyTestimonials,
  LazySection,
  SectionLoader
};