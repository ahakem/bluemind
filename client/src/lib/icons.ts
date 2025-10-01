// Optimized icon imports to reduce bundle size
// Instead of importing each icon individually, we use a single import with tree shaking

// Core icons used throughout the app
export {
  Menu as MenuIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Instagram as InstagramIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  DocumentScanner as DocumentScannerIcon,
  Pool as PoolIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  ArrowBack,
  ArrowForward,
  Close,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Calculate as CalculateIcon,
  KeyboardArrowUp,
} from '@mui/icons-material';

// Create a map for dynamic icon loading if needed
export const iconMap = {
  menu: 'Menu',
  checkCircle: 'CheckCircle',
  arrowForward: 'ArrowForward',
  locationOn: 'LocationOn',
  email: 'Email',
  instagram: 'Instagram',
  check: 'Check',
  download: 'Download',
  documentScanner: 'DocumentScanner',
  pool: 'Pool',
  event: 'Event',
  accessTime: 'AccessTime',
  person: 'Person',
  arrowBack: 'ArrowBack',
  close: 'Close',
  chevronLeft: 'ChevronLeft',
  chevronRight: 'ChevronRight',
  calculate: 'Calculate',
  keyboardArrowUp: 'KeyboardArrowUp',
} as const;