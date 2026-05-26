'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Checkbox,
  Toolbar,
  alpha,
  InputAdornment,
  TablePagination,
  Popover,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { lookupCountry, CountryType } from '@/data/countries';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArchiveIcon from '@mui/icons-material/Archive';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import PublicIcon from '@mui/icons-material/Public';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SportsIcon from '@mui/icons-material/Sports';
import {
  getAllDiveSites,
  createDiveSite,
  updateDiveSite,
  deleteDiveSite,
  generateSlug,
  markSiteVerified,
  getSiteVerificationCounts,
  getReviewQueue,
  getReviewQueueCount,
  deleteReviewItem,
  saveReviewItem,
  forceApplySiteEnhancement,
} from '@/lib/diveSiteService';
import { DiveSite, DiveSiteDraft, WaterTempByMonth, ReviewQueueItem } from '@/types/admin';

const CoordinatePickerMap = dynamic(() => import('@/components/CoordinatePickerMap'), { ssr: false });

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const EMPTY_DRAFT: DiveSiteDraft = {
  name: '',
  location: '',
  country: 'Netherlands',
  coordinates: { lat: 52.37, lng: 4.9 },
  waterType: 'lake',
  maxDepth: 20,
  description: '',
  highlights: [],
  facilities: [],
  tags: [],
  waterTemp: {},
  visibility: { min: 2, max: 6 },
  bestSeasons: [],
  photos: [],
  status: 'active',
  activities: [],
};

// ── Column visibility ────────────────────────────────────────────────────────

type ColId = 'country' | 'type' | 'depth' | 'score' | 'votes' | 'coords' | 'status';

const ALL_COLS: { id: ColId; label: string; defaultOn: boolean }[] = [
  { id: 'country', label: 'Country',     defaultOn: true  },
  { id: 'type',    label: 'Water Type',  defaultOn: true  },
  { id: 'depth',   label: 'Depth',       defaultOn: true  },
  { id: 'score',   label: 'Score',       defaultOn: true  },
  { id: 'votes',   label: 'Votes',       defaultOn: false },
  { id: 'coords',  label: 'Coordinates', defaultOn: false },
  { id: 'status',  label: 'Status',      defaultOn: true  },
];

const COLS_KEY = 'admin_dive_cols_v1';

function loadColPrefs(): Set<ColId> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(COLS_KEY) : null;
    if (raw) return new Set(JSON.parse(raw) as ColId[]);
  } catch {}
  return new Set(ALL_COLS.filter((c) => c.defaultOn).map((c) => c.id));
}

// ── DDM formatter ────────────────────────────────────────────────────────────

function ddmLat(lat: number): string {
  const d = Math.floor(Math.abs(lat));
  const m = ((Math.abs(lat) - d) * 60).toFixed(3);
  return `${d} ${m} ${lat >= 0 ? 'N' : 'S'}`;
}

function ddmLng(lng: number): string {
  const d = Math.floor(Math.abs(lng));
  const m = ((Math.abs(lng) - d) * 60).toFixed(3);
  return `${d} ${m} ${lng >= 0 ? 'E' : 'W'}`;
}

function CoordPills({ lat, lng, active = false, onClick }: {
  lat: number; lng: number; active?: boolean; onClick?: () => void;
}) {
  return (
    <Stack
      direction="column"
      spacing={0.5}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      sx={{
        display: 'inline-flex',
        cursor: 'pointer',
        borderRadius: 1.5,
        outline: active ? '2px solid #0056b3' : '2px solid transparent',
        outlineOffset: 3,
        boxShadow: active ? '0 0 0 4px rgba(0,86,179,0.12)' : 'none',
        transition: 'outline 0.15s, box-shadow 0.15s',
        p: active ? 0.5 : 0,
      }}
    >
      <Box sx={{
        px: 1, py: active ? 0.6 : 0.4, borderRadius: 1,
        bgcolor: active ? '#0056b3' : '#e8f4fd',
        color: active ? '#fff' : '#0056b3',
        fontFamily: 'monospace', fontWeight: 700,
        fontSize: active ? '0.92rem' : '0.82rem',
        whiteSpace: 'nowrap', letterSpacing: '0.02em',
        transition: 'all 0.15s',
      }}>
        {ddmLat(lat)}
      </Box>
      <Box sx={{
        px: 1, py: active ? 0.6 : 0.4, borderRadius: 1,
        bgcolor: active ? '#1b7a4e' : '#e6f7f0',
        color: active ? '#fff' : '#1b7a4e',
        fontFamily: 'monospace', fontWeight: 700,
        fontSize: active ? '0.92rem' : '0.82rem',
        whiteSpace: 'nowrap', letterSpacing: '0.02em',
        transition: 'all 0.15s',
      }}>
        {ddmLng(lng)}
      </Box>
    </Stack>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminDiveSitesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const searchParams = useSearchParams();
  const autoEditHandled = useRef(false);

  const [sites, setSites] = useState<DiveSite[]>([]);
  const [verificationCounts, setVerificationCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<DiveSite | null>(null);
  const [focusedCoordId, setFocusedCoordId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DiveSiteDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DiveSite | null>(null);

  // Column visibility
  const [visibleCols, setVisibleCols] = useState<Set<ColId>>(loadColPrefs);
  const [colAnchorEl, setColAnchorEl] = useState<HTMLElement | null>(null);

  const show = (id: ColId) => visibleCols.has(id);

  const toggleCol = (id: ColId) => {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(COLS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilterAdmin, setCountryFilterAdmin] = useState<CountryType | null>(null);
  const [waterTypeFilterAdmin, setWaterTypeFilterAdmin] = useState<string>('all');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'verified' | 'unverified' | null>(null);
  const [googleVerifFilter, setGoogleVerifFilter] = useState<'KEEP' | 'REVIEW_NEGATIVE' | 'NO_DATA' | 'unverified' | 'all'>('all');
  const [enhancementFilter, setEnhancementFilter] = useState<'all' | 'enhanced' | 'not-enhanced'>('all');
  const [moreFiltersAnchor, setMoreFiltersAnchor] = useState<HTMLElement | null>(null);

  // Review queue
  const [showReviewQueue, setShowReviewQueue] = useState(false);
  const [reviewQueueFlag, setReviewQueueFlag] = useState<'all' | 'insufficient_data' | 'parse_failed' | 'quality_failed' | 'enhanced' | 'not_processed'>('all');
  const [reviewQueueCount, setReviewQueueCount] = useState<number | null>(null);
  const [allReviewItems, setAllReviewItems] = useState<ReviewQueueItem[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [rawContentItem, setRawContentItem] = useState<ReviewQueueItem | null>(null);
  const [reviewActionWorking, setReviewActionWorking] = useState<string | null>(null);
  const [reviewSelected, setReviewSelected] = useState<Set<string>>(new Set());
  const [reviewBulkWorking, setReviewBulkWorking] = useState(false);
  const [enhancedStatusFilter, setEnhancedStatusFilter] = useState<'all' | 'active' | 'pending' | 'archived'>('all');
  const [reviewSearch, setReviewSearch] = useState('');

  // Retry / re-parse dialog
  const [retryDialogItem, setRetryDialogItem] = useState<ReviewQueueItem | null>(null);
  const [retryState, setRetryState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [retryResult, setRetryResult] = useState<Record<string, unknown> | null>(null);
  const [retryLoadingStep, setRetryLoadingStep] = useState(0);
  const [retryMode, setRetryMode] = useState<'enhance' | 'reparse'>('enhance');
  const [retrySearchName, setRetrySearchName] = useState('');
  const [retrySearchLocation, setRetrySearchLocation] = useState('');
  const [retrySearchCountry, setRetrySearchCountry] = useState('');

  // Form (Add/Edit) enhancement
  const [formEnhancing, setFormEnhancing] = useState(false);
  const [formEnhanceResult, setFormEnhanceResult] = useState<Record<string, unknown> | null>(null);
  const [fetchingTemps, setFetchingTemps] = useState(false);

  const filtered = sites.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (countryFilterAdmin && s.country !== countryFilterAdmin.label) return false;
    if (waterTypeFilterAdmin !== 'all' && s.waterType !== waterTypeFilterAdmin) return false;
    if (relevanceFilter === 'needs-review' && !s.needsReview) return false;
    if (relevanceFilter === 'scuba-only' && !s.scubaOnly) return false;
    if (relevanceFilter === 'depth-unknown' && !s.depthUnknown) return false;
    if (relevanceFilter === 'not-scored' && s.freediverScore !== undefined) return false;
    if (relevanceFilter === 'on-shore' && !s.coordinatesOnShore) return false;
    if (relevanceFilter === 'verified' && !s.verified) return false;
    if (relevanceFilter === 'has-votes' && !verificationCounts.get(s.id)) return false;
    if (verifiedFilter === 'verified' && !s.verified) return false;
    if (verifiedFilter === 'unverified' && s.verified) return false;
    if (googleVerifFilter === 'unverified' && s.verification) return false;
    if (googleVerifFilter !== 'all' && googleVerifFilter !== 'unverified' && s.verification?.statusTag !== googleVerifFilter) return false;
    if (enhancementFilter === 'enhanced' && !s.enhancedAt) return false;
    if (enhancementFilter === 'not-enhanced' && s.enhancedAt) return false;
    return true;
  });

  const presentCountries = [...new Set(sites.map((s) => s.country).filter(Boolean))].sort();
  const secondaryFilterCount = [
    countryFilterAdmin, waterTypeFilterAdmin !== 'all', relevanceFilter !== 'all',
    verifiedFilter !== null, googleVerifFilter !== 'all',
  ].filter(Boolean).length;
  const hasFilters = !!(search || statusFilter !== 'all' || enhancementFilter !== 'all' || secondaryFilterCount > 0);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCountryFilterAdmin(null);
    setWaterTypeFilterAdmin('all');
    setRelevanceFilter('all');
    setVerifiedFilter(null);
    setGoogleVerifFilter('all');
    setEnhancementFilter('all');
    setPage(0);
  };

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  useEffect(() => { setPage(0); }, [search, statusFilter, countryFilterAdmin, waterTypeFilterAdmin, relevanceFilter]);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Bulk state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [bulkCountry, setBulkCountry] = useState<{ code: string; label: string; phone: string } | null>(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [bulkActivities, setBulkActivities] = useState<('line_diving' | 'snorkeling')[]>([]);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerPos, setMapPickerPos] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  const load = async () => {
    try {
      const [data, counts] = await Promise.all([getAllDiveSites(), getSiteVerificationCounts()]);
      setSites(data);
      setVerificationCounts(counts);
    } catch {
      setError('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    getReviewQueueCount().then(setReviewQueueCount).catch(() => {});
  }, []);

  const loadReviewQueue = () => {
    setReviewLoading(true);
    setReviewError('');
    setAllReviewItems([]);
    getReviewQueue()
      .then((items) => {
        setAllReviewItems(items);
        setReviewQueueCount(items.length);
      })
      .catch((err) => { console.error('Review queue error:', err); setReviewError(err?.message || 'Failed to load'); })
      .finally(() => setReviewLoading(false));
  };

  useEffect(() => {
    if (!showReviewQueue) return;
    setReviewSelected(new Set());
    loadReviewQueue();
  }, [showReviewQueue]); // eslint-disable-line react-hooks/exhaustive-deps

  const RETRY_STEPS = ['Calling Gemini with Google Search...', 'Searching the web for site data...', 'Analyzing depth, features & marine life...', 'Validating data quality...'];
  useEffect(() => {
    if (retryState !== 'loading') { setRetryLoadingStep(0); return; }
    const t = setInterval(() => setRetryLoadingStep((i) => Math.min(i + 1, RETRY_STEPS.length - 1)), 6000);
    return () => clearInterval(t);
  }, [retryState]); // eslint-disable-line react-hooks/exhaustive-deps

  const reviewItems = allReviewItems
    .filter((r) => {
      if (reviewQueueFlag !== 'all') {
        if (reviewQueueFlag === 'quality_failed' && r.flag !== 'quality_check_failed') return false;
        if (reviewQueueFlag !== 'quality_failed' && r.flag !== reviewQueueFlag) return false;
      }
      if (reviewSearch) {
        const q = reviewSearch.toLowerCase();
        return (r.originalData?.name ?? '').toLowerCase().includes(q) ||
          (r.originalData?.location ?? '').toLowerCase().includes(q) ||
          (r.originalData?.country ?? '').toLowerCase().includes(q);
      }
      return true;
    });

  type GlobalResult =
    | { kind: 'queue'; item: ReviewQueueItem }
    | { kind: 'site'; site: DiveSite; category: 'enhanced' | 'not_processed' };

  const globalSearchResults: GlobalResult[] = reviewSearch ? (() => {
    const q = reviewSearch.toLowerCase();
    const results: GlobalResult[] = [];
    const seenIds = new Set<string>();
    for (const r of allReviewItems) {
      if (
        (r.originalData?.name ?? '').toLowerCase().includes(q) ||
        (r.originalData?.location ?? '').toLowerCase().includes(q) ||
        (r.originalData?.country ?? '').toLowerCase().includes(q)
      ) { results.push({ kind: 'queue', item: r }); seenIds.add(r.id); }
    }
    for (const s of sites) {
      if (seenIds.has(s.id)) continue;
      if (s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)) {
        results.push({ kind: 'site', site: s, category: s.enhancedAt ? 'enhanced' : 'not_processed' });
      }
    }
    return results;
  })() : [];

  const reviewQueueIds = new Set(allReviewItems.map((r) => r.id));

  const reviewCounts = {
    all: allReviewItems.length,
    insufficient_data: allReviewItems.filter((r) => r.flag === 'insufficient_data').length,
    quality_failed: allReviewItems.filter((r) => r.flag === 'quality_check_failed').length,
    parse_failed: allReviewItems.filter((r) => r.flag === 'parse_failed').length,
    enhanced: sites.filter((s) => s.enhancedAt).length,
    not_processed: sites.filter((s) => !s.enhancedAt && !reviewQueueIds.has(s.id) && s.status !== 'archived').length,
  };

  const enhancedSites = sites.filter((s) => {
    if (!s.enhancedAt) return false;
    if (enhancedStatusFilter !== 'all' && s.status !== enhancedStatusFilter) return false;
    if (reviewSearch) {
      const q = reviewSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.country.toLowerCase().includes(q);
    }
    return true;
  });

  const notProcessedSites = sites.filter((s) => {
    if (s.enhancedAt || reviewQueueIds.has(s.id) || s.status === 'archived') return false;
    if (reviewSearch) {
      const q = reviewSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.country.toLowerCase().includes(q);
    }
    return true;
  });

  const removeReviewItem = (id: string) => {
    setAllReviewItems((prev) => prev.filter((r) => r.id !== id));
    setReviewQueueCount((c) => (c !== null ? c - 1 : c));
    setReviewSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleForceApply = async (item: ReviewQueueItem) => {
    setReviewActionWorking(item.id);
    try {
      await forceApplySiteEnhancement(item.id, item);
      removeReviewItem(item.id);
      await load();
    } catch (err: unknown) {
      setReviewError((err as Error)?.message || 'Force apply failed');
    } finally { setReviewActionWorking(null); }
  };

  const handleRetry = (item: ReviewQueueItem) => {
    setRetryDialogItem(item);
    setRetryMode('enhance');
    setRetryState('idle');
    setRetryResult(null);
    setRetryLoadingStep(0);
    setRetrySearchName(String(item.originalData?.name ?? ''));
    setRetrySearchLocation(String(item.originalData?.location ?? ''));
    setRetrySearchCountry(String(item.originalData?.country ?? ''));
  };

  const runEnhancement = (item: ReviewQueueItem) => {
    setRetryState('loading');
    setRetryResult(null);
    setRetryLoadingStep(0);
    const searchData = {
      ...item.originalData,
      name: retrySearchName || item.originalData?.name,
      location: retrySearchLocation || item.originalData?.location,
      country: retrySearchCountry || item.originalData?.country,
    };
    fetch('/api/enhance-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteData: searchData }),
    })
      .then((r) => r.json())
      .then(async (data: Record<string, unknown>) => {
        setRetryResult(data);
        setRetryState('done');

        // Auto-persist failures back to _needsReview so they're always findable
        const status = data.status as string;
        if (status === 'parse_failed' || status === 'quality_failed' || status === 'insufficient_data') {
          const flag: ReviewQueueItem['flag'] =
            status === 'quality_failed' ? 'quality_check_failed'
            : status === 'parse_failed' ? 'parse_failed'
            : 'insufficient_data';
          const updatedItem: ReviewQueueItem = {
            id: item.id,
            flag,
            originalData: item.originalData,
            rawResponse: data.raw as string | undefined,
            attemptedEnhancement: data.parsed as Record<string, unknown> | undefined,
            validationScore: ((data.validation as Record<string, unknown> | undefined)?.score) as number | undefined,
            issues: ((data.validation as Record<string, unknown> | undefined)?.issues) as string[] | undefined,
            searchQueriesUsed: data.queries as string[] | undefined,
            timestamp: new Date().toISOString(),
          };
          try {
            await saveReviewItem(updatedItem);
            setAllReviewItems((prev) => [...prev.filter((r) => r.id !== item.id), updatedItem]);
            setReviewQueueCount((c) => {
              const wasInQueue = allReviewItems.some((r) => r.id === item.id);
              return c !== null && !wasInQueue ? c + 1 : c;
            });
          } catch (e) {
            console.warn('Failed to persist retry result to review queue:', e);
          }
        }
      })
      .catch((err: unknown) => { setRetryResult({ error: (err as Error).message }); setRetryState('done'); });
  };

  const handleReparse = (item: ReviewQueueItem) => {
    if (!item.rawResponse) return;
    setRetryDialogItem(item);
    setRetryMode('reparse');
    setRetryState('loading');
    setRetryResult(null);
    fetch('/api/parse-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: item.rawResponse }),
    })
      .then((r) => r.json())
      .then(async (data: Record<string, unknown>) => {
        setRetryResult(data);
        setRetryState('done');
        const status = data.status as string;
        if (status === 'parse_failed' || status === 'quality_failed' || status === 'insufficient_data') {
          const flag: ReviewQueueItem['flag'] =
            status === 'quality_failed' ? 'quality_check_failed'
            : status === 'parse_failed' ? 'parse_failed'
            : 'insufficient_data';
          const updatedItem: ReviewQueueItem = {
            ...item, flag,
            attemptedEnhancement: data.parsed as Record<string, unknown> | undefined,
            validationScore: ((data.validation as Record<string, unknown> | undefined)?.score) as number | undefined,
            issues: ((data.validation as Record<string, unknown> | undefined)?.issues) as string[] | undefined,
            timestamp: new Date().toISOString(),
          };
          try {
            await saveReviewItem(updatedItem);
            setAllReviewItems((prev) => [...prev.filter((r) => r.id !== item.id), updatedItem]);
          } catch (e) { console.warn('Failed to persist reparse result:', e); }
        }
      })
      .catch((err: unknown) => { setRetryResult({ error: (err as Error).message }); setRetryState('done'); });
  };

  const handleRetrySave = async () => {
    if (!retryDialogItem || !retryResult) return;
    const parsed = retryResult.parsed as Record<string, unknown> | undefined;
    if (!parsed) return;
    setReviewActionWorking(retryDialogItem.id);
    try {
      const synthItem: ReviewQueueItem = {
        ...retryDialogItem,
        attemptedEnhancement: parsed,
        validationScore: ((retryResult.validation as Record<string, unknown> | undefined)?.score as number | undefined),
      };
      await forceApplySiteEnhancement(retryDialogItem.id, synthItem);
      removeReviewItem(retryDialogItem.id);
      await load();
      setRetryDialogItem(null);
    } catch (err: unknown) {
      setReviewError((err as Error)?.message || 'Save failed');
      setRetryDialogItem(null);
    } finally { setReviewActionWorking(null); }
  };

  const handleRetryDismiss = async () => {
    if (!retryDialogItem) return;
    setReviewActionWorking(retryDialogItem.id);
    try {
      await deleteReviewItem(retryDialogItem.id);
      removeReviewItem(retryDialogItem.id);
    } catch (err: unknown) {
      setReviewError((err as Error)?.message || 'Dismiss failed');
    } finally {
      setReviewActionWorking(null);
      setRetryDialogItem(null);
    }
  };

  const handleDismiss = async (item: ReviewQueueItem) => {
    setReviewActionWorking(item.id);
    try {
      await deleteReviewItem(item.id);
      removeReviewItem(item.id);
    } catch (err: unknown) {
      setReviewError((err as Error)?.message || 'Dismiss failed');
    } finally { setReviewActionWorking(null); }
  };

  const handleReviewBulkStatus = async (status: DiveSite['status']) => {
    setReviewBulkWorking(true);
    try {
      await Promise.all([...reviewSelected].map((id) => updateDiveSite(id, { status })));
      setReviewSelected(new Set());
      await load();
    } catch (err: unknown) {
      setReviewError((err as Error)?.message || 'Bulk update failed');
    } finally { setReviewBulkWorking(false); }
  };

  const handleReviewBulkVerify = async () => {
    setReviewBulkWorking(true);
    try {
      await Promise.all([...reviewSelected].map((id) => markSiteVerified(id, true)));
      setReviewSelected(new Set());
      await load();
    } catch (err: unknown) {
      setReviewError((err as Error)?.message || 'Bulk verify failed');
    } finally { setReviewBulkWorking(false); }
  };

  const reviewRowIds = reviewQueueFlag === 'enhanced'
    ? enhancedSites.map((s) => s.id)
    : reviewQueueFlag === 'not_processed'
      ? notProcessedSites.map((s) => s.id)
      : reviewItems.map((r) => r.id);
  const reviewAllSelected = reviewRowIds.length > 0 && reviewRowIds.every((id) => reviewSelected.has(id));
  const reviewSomeSelected = reviewRowIds.some((id) => reviewSelected.has(id)) && !reviewAllSelected;

  const toggleReviewAll = () => {
    if (reviewAllSelected) {
      setReviewSelected(new Set());
    } else {
      setReviewSelected(new Set(reviewRowIds));
    }
  };

  // Auto-open edit dialog when ?edit=<siteId> is in the URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId || autoEditHandled.current || sites.length === 0) return;
    const site = sites.find((s) => s.id === editId);
    if (site) { autoEditHandled.current = true; openEdit(site); }
  }, [sites, searchParams]);

  // Selection helpers
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const someSelected = filtered.some((s) => selected.has(s.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => { const next = new Set(prev); filtered.forEach((s) => next.delete(s.id)); return next; });
    } else {
      setSelected((prev) => new Set([...prev, ...filtered.map((s) => s.id)]));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  // Bulk actions
  const bulkUpdateStatus = async (status: DiveSite['status']) => {
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => updateDiveSite(id, { status })));
      setSelected(new Set());
      await load();
    } catch { setError('Bulk update failed'); } finally { setBulkWorking(false); }
  };

  const bulkDelete = async () => {
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => deleteDiveSite(id)));
      setSelected(new Set());
      setBulkDeleteConfirm(false);
      await load();
    } catch { setError('Bulk delete failed'); } finally { setBulkWorking(false); }
  };

  const bulkSetCountry = async () => {
    if (!bulkCountry) return;
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => updateDiveSite(id, { country: bulkCountry.label })));
      setSelected(new Set());
      setCountryDialogOpen(false);
      setBulkCountry(null);
      await load();
    } catch { setError('Bulk country update failed'); } finally { setBulkWorking(false); }
  };

  const bulkSetActivity = async () => {
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => updateDiveSite(id, { activities: bulkActivities })));
      setSelected(new Set());
      setActivityDialogOpen(false);
      setBulkActivities([]);
      await load();
    } catch { setError('Bulk activity update failed'); } finally { setBulkWorking(false); }
  };

  // Single site actions
  const openCreate = () => {
    setEditingSite(null); setDraft(EMPTY_DRAFT);
    setFormEnhanceResult(null); setFormEnhancing(false);
    setDialogOpen(true);
  };

  const openEdit = (site: DiveSite) => {
    setEditingSite(site);
    setDraft({
      name: site.name, location: site.location, country: site.country,
      coordinates: site.coordinates ?? { lat: 0, lng: 0 },
      waterType: site.waterType, maxDepth: site.maxDepth,
      description: site.description, highlights: site.highlights,
      facilities: site.facilities, tags: site.tags ?? [],
      waterTemp: site.waterTemp, visibility: site.visibility,
      bestSeasons: site.bestSeasons, photos: site.photos,
      status: site.status, slug: site.slug,
      activities: site.activities ?? [],
    });
    setFormEnhanceResult(null); setFormEnhancing(false);
    setDialogOpen(true);
  };

  const handleFormEnhance = async () => {
    setFormEnhancing(true);
    setFormEnhanceResult(null);
    try {
      const res = await fetch('/api/enhance-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteData: draft }),
      });
      const data = await res.json();
      setFormEnhanceResult(data);
    } catch (err) {
      setError(`Enhancement failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setFormEnhancing(false);
    }
  };

  const applyFormEnhancement = () => {
    if (!formEnhanceResult?.parsed) return;
    const p = formEnhanceResult.parsed as Record<string, unknown>;
    setDraft((d) => ({
      ...d,
      description: typeof p.description === 'string' ? p.description : d.description,
      highlights: Array.isArray(p.highlights) ? (p.highlights as string[]) : d.highlights,
      maxDepth: typeof p.maxDepth === 'string'
        ? (parseFloat(p.maxDepth) || d.maxDepth)
        : typeof p.maxDepth === 'number' ? p.maxDepth : d.maxDepth,
    }));
  };

  const fetchWaterTemps = async () => {
    const { lat, lng } = draft.coordinates;
    if (!lat || !lng) return;
    setFetchingTemps(true);
    try {
      const year = new Date().getFullYear() - 1;
      const startDate = `${year}-01-01`;
      const endDate   = `${year}-12-31`;
      const monthly: Record<string, number[]> = {};

      const accumulateDaily = (
        times: string[], maxVals: (number | null)[], minVals: (number | null)[]
      ) => {
        times.forEach((dateStr, i) => {
          const month = new Date(dateStr + 'T00:00:00Z').getUTCMonth();
          const key   = MONTH_KEYS[month];
          const max   = maxVals[i]; const min = minVals[i];
          const avg   = max != null && min != null ? (max + min) / 2 : (max ?? min);
          if (avg != null) { (monthly[key] ??= []).push(avg); }
        });
      };

      // For sea sites — try marine API (sea surface temperature)
      if (draft.waterType === 'sea') {
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&daily=sea_surface_temperature_max,sea_surface_temperature_min&start_date=${startDate}&end_date=${endDate}&timezone=GMT`;
        const marineRes = await fetch(marineUrl);
        const marineData = await marineRes.json();
        if (marineData.daily?.time && Array.isArray(marineData.daily.sea_surface_temperature_max)) {
          accumulateDaily(
            marineData.daily.time,
            marineData.daily.sea_surface_temperature_max,
            marineData.daily.sea_surface_temperature_min ?? marineData.daily.sea_surface_temperature_max,
          );
        }
      }

      // Fallback (or primary for lakes): archive weather API — air temp is a reasonable proxy for shallow lakes
      if (Object.keys(monthly).length === 0 && draft.waterType !== 'deep_tank') {
        const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min&timezone=GMT`;
        const archiveRes = await fetch(archiveUrl);
        const archiveData = await archiveRes.json();
        if (archiveData.daily?.time && Array.isArray(archiveData.daily.temperature_2m_max)) {
          accumulateDaily(
            archiveData.daily.time,
            archiveData.daily.temperature_2m_max,
            archiveData.daily.temperature_2m_min,
          );
        }
      }

      if (Object.keys(monthly).length === 0) {
        setError('No temperature data found for these coordinates');
        return;
      }

      const newTemps: WaterTempByMonth = {};
      (Object.entries(monthly) as [keyof WaterTempByMonth, number[]][]).forEach(([key, vals]) => {
        newTemps[key] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
      });
      setDraft((d) => ({ ...d, waterTemp: newTemps }));
    } catch (err) {
      setError(`Failed to fetch temperatures: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setFetchingTemps(false);
    }
  };

  const handleSave = async () => {
    if (!draft.name || !draft.location) return;
    setSaving(true);
    try {
      let savedId: string;
      if (editingSite) {
        await updateDiveSite(editingSite.id, draft);
        savedId = editingSite.id;
      } else {
        savedId = await createDiveSite(draft);
      }
      // Apply enhancement extras (marineLife, sources, etc.) if available
      if (formEnhanceResult?.parsed) {
        const p = formEnhanceResult.parsed as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateDiveSite(savedId, {
          marineLife: p.marineLife,
          facilitiesEnhanced: p.facilities,
          enhancedAt: new Date().toISOString(),
          sources: p.sources,
          confidence: p.confidence,
          visibilityRange: p.visibilityRange,
          freediverFriendly: p.freediverFriendly,
          freediverFriendlyReason: p.freediverFriendlyReason,
          hasLineDiving: p.hasLineDiving,
          lineDivingDetails: p.lineDivingDetails,
          freediverDepthRange: p.freediverDepthRange,
          freediverAccess: p.freediverAccess,
          freediverConditions: p.freediverConditions,
        } as any);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (site: DiveSite) => {
    try {
      await deleteDiveSite(site.id);
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      setError(`Delete failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const updateTemp = (key: keyof WaterTempByMonth, val: string) => {
    const num = parseFloat(val);
    setDraft((d) => ({ ...d, waterTemp: { ...d.waterTemp, [key]: isNaN(num) ? undefined : num } }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Dive Sites</Typography>
          {sites.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {sites.length} total · {sites.filter((s) => s.status === 'active').length} active · {sites.filter((s) => s.status === 'pending').length} pending
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size={isMobile ? 'small' : 'medium'}>
          {isMobile ? 'Add' : 'Add Site'}
        </Button>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filter bar */}
      <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search name or location…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex: 1, minWidth: isMobile ? '100%' : 200 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />

          {/* Status */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          {/* Enhancement */}
          <FormControl size="small" sx={{ minWidth: 155 }}>
            <InputLabel>Enhancement</InputLabel>
            <Select label="Enhancement" value={enhancementFilter} onChange={(e) => { setEnhancementFilter(e.target.value as typeof enhancementFilter); setPage(0); }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="enhanced">✅ Enhanced</MenuItem>
              <MenuItem value="not-enhanced">⬜ Not enhanced</MenuItem>
            </Select>
          </FormControl>

          {/* Review Queue button */}
          <Button
            size="small"
            variant={showReviewQueue ? 'contained' : 'outlined'}
            color={showReviewQueue ? 'warning' : 'inherit'}
            onClick={() => setShowReviewQueue((v) => !v)}
            sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}
          >
            ⚠️ Review Queue{reviewQueueCount !== null && reviewQueueCount > 0 ? ` (${reviewQueueCount})` : ''}
          </Button>

          {/* More filters popover */}
          <Button
            size="small"
            variant={secondaryFilterCount > 0 ? 'contained' : 'outlined'}
            onClick={(e) => setMoreFiltersAnchor(e.currentTarget)}
            sx={{ whiteSpace: 'nowrap', minWidth: 90 }}
          >
            Filters{secondaryFilterCount > 0 ? ` (${secondaryFilterCount})` : ''}
          </Button>
          <Popover
            open={Boolean(moreFiltersAnchor)}
            anchorEl={moreFiltersAnchor}
            onClose={() => setMoreFiltersAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Stack spacing={2} sx={{ p: 2.5, minWidth: 240 }}>
              <Typography variant="subtitle2" fontWeight={700}>More Filters</Typography>
              <CountryAutocomplete
                value={countryFilterAdmin}
                onChange={(c) => { setCountryFilterAdmin(c); setPage(0); }}
                label="Country"
                size="small"
                limitToLabels={presentCountries}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Water Type</InputLabel>
                <Select label="Water Type" value={waterTypeFilterAdmin} onChange={(e) => { setWaterTypeFilterAdmin(e.target.value); setPage(0); }}>
                  <MenuItem value="all">All types</MenuItem>
                  <MenuItem value="sea">Sea</MenuItem>
                  <MenuItem value="lake">Lake</MenuItem>
                  <MenuItem value="deep_tank">Deep Tank</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Relevance</InputLabel>
                <Select label="Relevance" value={relevanceFilter} onChange={(e) => { setRelevanceFilter(e.target.value); setPage(0); }}>
                  <MenuItem value="all">All sites</MenuItem>
                  <MenuItem value="needs-review">Needs review</MenuItem>
                  <MenuItem value="scuba-only">Scuba only</MenuItem>
                  <MenuItem value="depth-unknown">Depth unknown</MenuItem>
                  <MenuItem value="not-scored">Not scored yet</MenuItem>
                  <MenuItem value="on-shore">Coords on shore</MenuItem>
                  <MenuItem value="has-votes">Has votes</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Google Verification</InputLabel>
                <Select label="Google Verification" value={googleVerifFilter} onChange={(e) => { setGoogleVerifFilter(e.target.value as typeof googleVerifFilter); setPage(0); }}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="KEEP">✅ Keep</MenuItem>
                  <MenuItem value="REVIEW_NEGATIVE">⚠️ Review Negative</MenuItem>
                  <MenuItem value="NO_DATA">❔ No Data</MenuItem>
                  <MenuItem value="unverified">Not run yet</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                  label="Verified"
                  size="small"
                  clickable
                  color={verifiedFilter === 'verified' ? 'success' : 'default'}
                  variant={verifiedFilter === 'verified' ? 'filled' : 'outlined'}
                  onClick={() => setVerifiedFilter((v) => v === 'verified' ? null : 'verified')}
                />
                <Chip
                  label="Not verified"
                  size="small"
                  clickable
                  color={verifiedFilter === 'unverified' ? 'warning' : 'default'}
                  variant={verifiedFilter === 'unverified' ? 'filled' : 'outlined'}
                  onClick={() => setVerifiedFilter((v) => v === 'unverified' ? null : 'unverified')}
                />
              </Stack>
            </Stack>
          </Popover>

          {/* Columns */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewColumnIcon />}
            onClick={(e) => setColAnchorEl(e.currentTarget)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Columns
          </Button>
          <Popover
            open={Boolean(colAnchorEl)}
            anchorEl={colAnchorEl}
            onClose={() => setColAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Box sx={{ p: 2, minWidth: 190 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Visible columns</Typography>
              {ALL_COLS.map((col) => (
                <FormControlLabel
                  key={col.id}
                  control={<Checkbox size="small" checked={visibleCols.has(col.id)} onChange={() => toggleCol(col.id)} />}
                  label={<Typography variant="body2">{col.label}</Typography>}
                  sx={{ display: 'flex', mb: 0.5, ml: 0 }}
                />
              ))}
            </Box>
          </Popover>

          {/* Clear + count */}
          {hasFilters && (
            <Tooltip title="Clear all filters">
              <Button size="small" startIcon={<FilterListOffIcon />} onClick={clearFilters} color="inherit">Clear</Button>
            </Tooltip>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
            {filtered.length}/{sites.length}{selected.size > 0 && ` · ${selected.size} sel`}
          </Typography>
        </Stack>
      </Paper>

      {!showReviewQueue && loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !showReviewQueue && isMobile ? (
        /* ── MOBILE CARD LIST ─────────────────────────────────────────────── */
        <Box>
          {/* Bulk toolbar */}
          {selected.size > 0 && (
            <Paper sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
              <Toolbar
                variant="dense"
                sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.08), gap: 0.5, flexWrap: 'wrap', py: 1, minHeight: 'unset' }}
              >
                <Typography fontWeight={600} sx={{ flex: 1, fontSize: 14 }}>{selected.size} selected</Typography>
                <IconButton size="small" color="success" onClick={() => bulkUpdateStatus('active')} disabled={bulkWorking}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => bulkUpdateStatus('pending')} disabled={bulkWorking}>
                  <PendingIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => bulkUpdateStatus('archived')} disabled={bulkWorking}>
                  <ArchiveIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setCountryDialogOpen(true)} disabled={bulkWorking}>
                  <PublicIcon fontSize="small" />
                </IconButton>
                <Tooltip title="Set Activity Type">
                  <IconButton size="small" onClick={() => { setBulkActivities([]); setActivityDialogOpen(true); }} disabled={bulkWorking}>
                    <SportsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <IconButton size="small" color="error" onClick={() => setBulkDeleteConfirm(true)} disabled={bulkWorking}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Toolbar>
            </Paper>
          )}

          <Stack spacing={1}>
            {paginated.map((site) => {
              const votes = verificationCounts.get(site.id) ?? 0;
              const coords = site.coordinates;
              return (
                <Paper
                  key={site.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: selected.has(site.id) ? '2px solid' : '1px solid transparent',
                    borderColor: selected.has(site.id) ? 'primary.main' : 'divider',
                    boxShadow: 0,
                  }}
                >
                  {/* Top row: checkbox + name + status */}
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Checkbox
                      size="small"
                      checked={selected.has(site.id)}
                      onChange={() => toggleOne(site.id)}
                      sx={{ mt: -0.5, ml: -0.5 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography fontWeight={700} fontSize={15} sx={{ flex: 1, minWidth: 0 }} noWrap>
                          {site.name}
                        </Typography>
                        <Chip
                          label={site.status}
                          size="small"
                          color={site.status === 'active' ? 'success' : site.status === 'pending' ? 'warning' : 'default'}
                          sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 20 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">{site.location}</Typography>
                    </Box>
                  </Stack>

                  {/* Info chips row */}
                  <Stack direction="row" spacing={0.75} mt={1} flexWrap="wrap" useFlexGap>
                    {site.country && (
                      <Chip label={site.country} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                    )}
                    <Chip
                      label={site.waterType === 'deep_tank' ? 'Deep Tank' : site.waterType}
                      size="small"
                      color={site.waterType === 'sea' ? 'info' : site.waterType === 'deep_tank' ? 'secondary' : 'default'}
                      sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 22 }}
                    />
                    {site.coordinatesOnShore ? (
                      <Chip label="On shore ⚠" size="small" color="error" sx={{ fontSize: '0.7rem', height: 22 }} />
                    ) : site.depthUnknown ? (
                      <Chip label="Depth?" size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                    ) : (
                      <Chip label={`${site.maxDepth}m`} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                    )}
                    {site.freediverScore !== undefined && (
                      <Chip
                        label={`Score ${site.freediverScore}`}
                        size="small"
                        color={site.freediverScore >= 45 ? 'success' : site.freediverScore >= 20 ? 'warning' : 'error'}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                    {votes > 0 && (
                      <Chip label={`${votes} votes`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                    )}
                    {site.verified && (
                      <Chip icon={<VerifiedIcon sx={{ fontSize: '12px !important' }} />} label="Verified" size="small" color="success" sx={{ fontSize: '0.7rem', height: 22 }} />
                    )}
                    {(site.activities?.length ?? 0) === 0 && (
                      <Chip label="⚓ Uncharted" size="small" sx={{ fontSize: '0.7rem', height: 22, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, border: '1px solid #fcd34d' }} />
                    )}
                    {(site.activities ?? []).includes('line_diving') && (
                      <Chip label="Line Diving" size="small" sx={{ fontSize: '0.7rem', height: 22, bgcolor: '#e3f2fd', color: '#0077be', fontWeight: 700 }} />
                    )}
                    {(site.activities ?? []).includes('snorkeling') && (
                      <Chip label="Snorkeling" size="small" sx={{ fontSize: '0.7rem', height: 22, bgcolor: '#e0f2f1', color: '#00897b', fontWeight: 700 }} />
                    )}
                  </Stack>

                  {/* Coordinates row */}
                  {coords && (
                    <Box sx={{ mt: 1 }}>
                      <CoordPills
                        lat={coords.lat} lng={coords.lng}
                        active={focusedCoordId === site.id}
                        onClick={() => setFocusedCoordId((prev) => prev === site.id ? null : site.id)}
                      />
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      color={site.verified ? 'success' : 'default'}
                      onClick={async () => { await markSiteVerified(site.id, !site.verified); await load(); }}
                    >
                      <VerifiedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" component="a" href={`/dive-sites/${site.slug}`} target="_blank">
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openEdit(site)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm(site)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </Box>
      ) : !showReviewQueue ? (
        /* ── DESKTOP TABLE ────────────────────────────────────────────────── */
        <Paper sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
          {/* Bulk action toolbar */}
          {selected.size > 0 && (
            <Toolbar sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.08), borderBottom: '1px solid', borderColor: 'divider', gap: 1 }}>
              <Typography sx={{ flex: 1 }} fontWeight={600}>{selected.size} selected</Typography>
              <Button size="small" startIcon={<CheckCircleIcon />} color="success" variant="outlined" onClick={() => bulkUpdateStatus('active')} disabled={bulkWorking}>Activate</Button>
              <Button size="small" startIcon={<PendingIcon />} variant="outlined" onClick={() => bulkUpdateStatus('pending')} disabled={bulkWorking}>Pending</Button>
              <Button size="small" startIcon={<ArchiveIcon />} variant="outlined" onClick={() => bulkUpdateStatus('archived')} disabled={bulkWorking}>Archive</Button>
              <Button size="small" startIcon={<PublicIcon />} variant="outlined" onClick={() => setCountryDialogOpen(true)} disabled={bulkWorking}>Set Country</Button>
              <Button size="small" startIcon={<SportsIcon />} variant="outlined" onClick={() => { setBulkActivities([]); setActivityDialogOpen(true); }} disabled={bulkWorking}>Set Activity</Button>
              <Button size="small" startIcon={<DeleteIcon />} color="error" variant="outlined" onClick={() => setBulkDeleteConfirm(true)} disabled={bulkWorking}>Delete</Button>
              {bulkWorking && <CircularProgress size={20} />}
            </Toolbar>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell padding="checkbox">
                    <Checkbox indeterminate={someSelected} checked={allSelected} onChange={toggleAll} size="small" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  {show('country') && <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>}
                  {show('type')    && <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>}
                  {show('depth')   && <TableCell sx={{ fontWeight: 700 }}>Depth</TableCell>}
                  {show('score')   && <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>}
                  {show('votes')   && <TableCell sx={{ fontWeight: 700 }}>Votes</TableCell>}
                  {show('coords')  && <TableCell sx={{ fontWeight: 700 }}>Coordinates</TableCell>}
                  {show('status')  && <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>}
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((site) => {
                  const votes = verificationCounts.get(site.id) ?? 0;
                  const coords = site.coordinates;
                  return (
                    <TableRow key={site.id} hover selected={selected.has(site.id)}>
                      <TableCell padding="checkbox" onClick={(e) => { e.stopPropagation(); toggleOne(site.id); }}>
                        <Checkbox checked={selected.has(site.id)} size="small" />
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600} fontSize={14}>{site.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{site.location}</Typography>
                        <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                          {(site.activities?.length ?? 0) === 0 && (
                            <Chip label="⚓ Uncharted" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, border: '1px solid #fcd34d' }} />
                          )}
                          {(site.activities ?? []).includes('line_diving') && (
                            <Chip label="Line Diving" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#e3f2fd', color: '#0077be', fontWeight: 700 }} />
                          )}
                          {(site.activities ?? []).includes('snorkeling') && (
                            <Chip label="Snorkeling" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#e0f2f1', color: '#00897b', fontWeight: 700 }} />
                          )}
                          {site.enhancedAt && (
                            <Chip label="✨ Enhanced" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }} />
                          )}
                          {site.verification && (
                            <Chip
                              label={site.verification.statusTag === 'KEEP' ? '✅ Keep' : site.verification.statusTag === 'REVIEW_NEGATIVE' ? '⚠️ Review' : '❔ No Data'}
                              size="small"
                              sx={{
                                fontSize: '0.65rem', height: 18, fontWeight: 700,
                                bgcolor: site.verification.statusTag === 'KEEP' ? '#dcfce7' : site.verification.statusTag === 'REVIEW_NEGATIVE' ? '#fef9c3' : '#f1f5f9',
                                color: site.verification.statusTag === 'KEEP' ? '#166534' : site.verification.statusTag === 'REVIEW_NEGATIVE' ? '#854d0e' : '#475569',
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      {show('country') && (
                        <TableCell>
                          {site.country || <Typography variant="caption" color="error">Missing</Typography>}
                        </TableCell>
                      )}

                      {show('type') && (
                        <TableCell sx={{ textTransform: 'capitalize' }}>{site.waterType}</TableCell>
                      )}

                      {show('depth') && (
                        <TableCell>
                          {site.coordinatesOnShore
                            ? <Tooltip title="Coordinates land on shore"><Typography variant="caption" color="error">Shore ⚠</Typography></Tooltip>
                            : site.depthUnknown
                              ? <Typography variant="caption" color="text.disabled">Unknown</Typography>
                              : `${site.maxDepth}m`}
                        </TableCell>
                      )}

                      {show('score') && (
                        <TableCell>
                          {site.freediverScore !== undefined ? (
                            <Tooltip title={site.scubaFlags?.length ? `Flags: ${site.scubaFlags.join(', ')}` : 'No flags'}>
                              <Chip label={site.freediverScore} size="small" color={site.freediverScore >= 45 ? 'success' : site.freediverScore >= 20 ? 'warning' : 'error'} />
                            </Tooltip>
                          ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                        </TableCell>
                      )}

                      {show('votes') && (
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {site.verified && <Tooltip title="Verified by admin"><VerifiedIcon sx={{ fontSize: 14, color: 'success.main' }} /></Tooltip>}
                            {votes > 0
                              ? <Chip label={votes} size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </Stack>
                        </TableCell>
                      )}

                      {show('coords') && (
                        <TableCell>
                          {coords
                            ? <CoordPills
                                lat={coords.lat} lng={coords.lng}
                                active={focusedCoordId === site.id}
                                onClick={() => setFocusedCoordId((prev) => prev === site.id ? null : site.id)}
                              />
                            : <Typography variant="caption" color="text.disabled">—</Typography>}
                        </TableCell>
                      )}

                      {show('status') && (
                        <TableCell>
                          <Chip label={site.status} size="small"
                            color={site.status === 'active' ? 'success' : site.status === 'pending' ? 'warning' : 'default'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                      )}

                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title={site.verified ? 'Unmark verified' : 'Mark verified'}>
                            <IconButton size="small" color={site.verified ? 'success' : 'default'}
                              onClick={async () => { await markSiteVerified(site.id, !site.verified); await load(); }}>
                              <VerifiedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View site">
                            <IconButton size="small" component="a" href={`/dive-sites/${site.slug}`} target="_blank">
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(site)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteConfirm(site)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </Paper>
      ) : null}

      {/* ── Review Queue ─────────────────────────────────────────────────── */}
      {showReviewQueue && (
        <Paper sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden', mt: 2 }}>
          {/* Queue header + flag tabs */}
          <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1.5}>
              <Typography fontWeight={700} fontSize={15}>Review Queue</Typography>
              <TextField
                size="small"
                placeholder="Search name, location…"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                sx={{ width: 220 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
              />
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {([
                  { value: 'all',               label: '⭐❌🔴 All',           count: reviewCounts.all },
                  { value: 'insufficient_data', label: '⭐ Insufficient data', count: reviewCounts.insufficient_data },
                  { value: 'quality_failed',    label: '❌ Quality failed',    count: reviewCounts.quality_failed },
                  { value: 'parse_failed',      label: '🔴 Parse failed',      count: reviewCounts.parse_failed },
                  { value: 'enhanced',          label: '✅ Enhanced',          count: reviewCounts.enhanced },
                  { value: 'not_processed',     label: '⬜ Not processed',     count: reviewCounts.not_processed },
                ] as const).map((opt) => (
                  <Chip
                    key={opt.value}
                    label={`${opt.label}${opt.count > 0 ? ` (${opt.count})` : ''}`}
                    size="small"
                    variant={reviewQueueFlag === opt.value ? 'filled' : 'outlined'}
                    color={reviewQueueFlag === opt.value ? 'primary' : 'default'}
                    onClick={() => { setReviewQueueFlag(opt.value); setReviewSelected(new Set()); }}
                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                  />
                ))}
            </Stack>
          </Box>

          {/* Shared bulk toolbar */}
          {reviewSelected.size > 0 && (
            <Toolbar sx={{ bgcolor: (t) => alpha(t.palette.warning.main, 0.08), borderBottom: '1px solid', borderColor: 'divider', gap: 1 }}>
              <Typography sx={{ flex: 1 }} fontWeight={600}>{reviewSelected.size} selected</Typography>
              {reviewQueueFlag === 'enhanced' && (
                <Button size="small" startIcon={<VerifiedIcon />} color="primary" variant="outlined" disabled={reviewBulkWorking} onClick={handleReviewBulkVerify}>Verify</Button>
              )}
              <Button size="small" startIcon={<CheckCircleIcon />} color="success" variant="outlined" disabled={reviewBulkWorking} onClick={() => handleReviewBulkStatus('active')}>Set Active</Button>
              <Button size="small" startIcon={<PendingIcon />} variant="outlined" disabled={reviewBulkWorking} onClick={() => handleReviewBulkStatus('pending')}>Set Pending</Button>
              <Button size="small" startIcon={<ArchiveIcon />} variant="outlined" disabled={reviewBulkWorking} onClick={() => handleReviewBulkStatus('archived')}>Set Archived</Button>
              {reviewBulkWorking && <CircularProgress size={20} />}
            </Toolbar>
          )}

          {reviewLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
          ) : reviewError ? (
            <Box sx={{ p: 2.5 }}>
              <Alert severity="error">{reviewError}</Alert>
            </Box>
          ) : reviewSearch && globalSearchResults.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No sites match &ldquo;{reviewSearch}&rdquo;</Typography>
            </Box>
          ) : reviewSearch ? (
            /* ── Global search results across all categories ── */
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Site</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {globalSearchResults.map((result) => {
                    const id = result.kind === 'queue' ? result.item.id : result.site.id;
                    const name = result.kind === 'queue' ? (result.item.originalData?.name ?? id) : result.site.name;
                    const location = result.kind === 'queue' ? (result.item.originalData?.location ?? '') : result.site.location;
                    const country = result.kind === 'queue' ? (result.item.originalData?.country ?? '') : result.site.country;
                    const slug = result.kind === 'queue' ? result.item.originalData?.slug : result.site.slug;
                    const working = reviewActionWorking === id;
                    return (
                      <TableRow key={id} hover sx={{ opacity: working ? 0.5 : 1 }}>
                        <TableCell>
                          <Typography fontWeight={600} fontSize={14}>{name}</Typography>
                          <Typography variant="caption" color="text.secondary">{location}</Typography>
                        </TableCell>
                        <TableCell><Typography fontSize={13}>{country}</Typography></TableCell>
                        <TableCell>
                          {result.kind === 'queue' && result.item.flag === 'insufficient_data'    && <Chip label="⭐ Insufficient data" size="small" sx={{ bgcolor: '#fef9c3', color: '#854d0e', fontWeight: 600, fontSize: '0.7rem' }} />}
                          {result.kind === 'queue' && result.item.flag === 'quality_check_failed' && <Chip label={`❌ Score ${result.item.validationScore ?? '?'}/100`} size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: '0.7rem' }} />}
                          {result.kind === 'queue' && result.item.flag === 'parse_failed'         && <Chip label="🔴 Parse failed" size="small" sx={{ bgcolor: '#fce7f3', color: '#9d174d', fontWeight: 600, fontSize: '0.7rem' }} />}
                          {result.kind === 'site'  && result.category === 'enhanced'              && <Chip label="✅ Enhanced" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.7rem' }} />}
                          {result.kind === 'site'  && result.category === 'not_processed'         && <Chip label="⬜ Not processed" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.7rem' }} />}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                            {working && <CircularProgress size={14} />}
                            {slug && (
                              <Tooltip title="View site">
                                <IconButton size="small" component="a" href={`/dive-sites/${slug}`} target="_blank" disabled={working}>
                                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {result.kind === 'queue' && result.item.flag === 'parse_failed' && result.item.rawResponse && (
                              <Button size="small" variant="outlined" color="secondary" disabled={working} sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }} onClick={() => handleReparse(result.item)}>Re-parse</Button>
                            )}
                            {result.kind === 'queue' && result.item.flag === 'quality_check_failed' && result.item.attemptedEnhancement && (
                              <Button size="small" variant="outlined" color="warning" disabled={working} sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }} onClick={() => handleForceApply(result.item)}>Force save</Button>
                            )}
                            {(result.kind === 'queue' || (result.kind === 'site' && result.category === 'not_processed')) && (
                              <Button size="small" variant="outlined" color="info" disabled={working} sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}
                                onClick={() => handleRetry(result.kind === 'queue' ? result.item : { id, flag: 'insufficient_data', originalData: { name, location, country, slug: slug ?? '' }, timestamp: '' })}>
                                {result.kind === 'site' ? 'Run' : 'Retry'}
                              </Button>
                            )}
                            {result.kind === 'queue' && (
                              <Button size="small" variant="outlined" color="error" disabled={working} sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }} onClick={() => handleDismiss(result.item)}>Dismiss</Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : reviewQueueFlag === 'enhanced' ? (
            /* ── Enhanced sites table ── */
            <>
            {/* Status filter */}
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Status:</Typography>
              {(['all', 'active', 'pending', 'archived'] as const).map((s) => {
                const count = s === 'all'
                  ? sites.filter((x) => x.enhancedAt).length
                  : sites.filter((x) => x.enhancedAt && x.status === s).length;
                return (
                  <Chip
                    key={s}
                    label={`${s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} (${count})`}
                    size="small"
                    variant={enhancedStatusFilter === s ? 'filled' : 'outlined'}
                    color={enhancedStatusFilter === s ? (s === 'active' ? 'success' : s === 'pending' ? 'warning' : s === 'archived' ? 'default' : 'primary') : 'default'}
                    onClick={() => { setEnhancedStatusFilter(s); setReviewSelected(new Set()); }}
                    sx={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.72rem' }}
                  />
                );
              })}
            </Box>
            {enhancedSites.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No enhanced sites with this status</Typography></Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                      <TableCell padding="checkbox"><Checkbox size="small" checked={reviewAllSelected} indeterminate={reviewSomeSelected} onChange={toggleReviewAll} /></TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Site</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Verified</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Enhanced</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enhancedSites.map((site) => (
                      <TableRow key={site.id} hover selected={reviewSelected.has(site.id)}>
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={reviewSelected.has(site.id)} onChange={() => setReviewSelected((prev) => { const next = new Set(prev); next.has(site.id) ? next.delete(site.id) : next.add(site.id); return next; })} />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600} fontSize={14}>{site.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{site.location}</Typography>
                        </TableCell>
                        <TableCell><Typography fontSize={13}>{site.country}</Typography></TableCell>
                        <TableCell>
                          <Chip label={site.status} size="small" color={site.status === 'active' ? 'success' : site.status === 'pending' ? 'warning' : 'default'} sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          {site.verified
                            ? <Chip label="✓ Verified" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.7rem' }} />
                            : <Typography variant="caption" color="text.secondary">—</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {site.enhancedAt ? new Date(site.enhancedAt).toLocaleDateString() : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {(site as unknown as Record<string,unknown>).qualityScore !== undefined
                            ? <Chip label={`${(site as unknown as Record<string,unknown>).qualityScore}/100`} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.7rem' }} />
                            : <Typography variant="caption" color="text.secondary">—</Typography>}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View site">
                              <IconButton size="small" component="a" href={`/dive-sites/${site.slug}`} target="_blank">
                                <OpenInNewIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={site.verified ? 'Unverify' : 'Verify'}>
                              <IconButton size="small" onClick={async () => { await markSiteVerified(site.id, !site.verified); await load(); }}>
                                <VerifiedIcon sx={{ fontSize: 16, color: site.verified ? 'success.main' : 'text.disabled' }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            </>
          ) : reviewQueueFlag === 'not_processed' ? (
            /* ── Not-processed sites table ── */
            notProcessedSites.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">All sites have been processed ✅</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={reviewAllSelected} indeterminate={reviewSomeSelected} onChange={toggleReviewAll} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Site</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Depth</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notProcessedSites.map((site) => {
                      const working = reviewActionWorking === site.id;
                      return (
                        <TableRow key={site.id} hover selected={reviewSelected.has(site.id)} sx={{ opacity: working ? 0.5 : 1 }}>
                          <TableCell padding="checkbox">
                            <Checkbox size="small" checked={reviewSelected.has(site.id)} onChange={() => setReviewSelected((prev) => { const next = new Set(prev); next.has(site.id) ? next.delete(site.id) : next.add(site.id); return next; })} />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600} fontSize={14}>{site.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{site.location}</Typography>
                          </TableCell>
                          <TableCell><Typography fontSize={13}>{site.country}</Typography></TableCell>
                          <TableCell>
                            <Chip label={site.status} size="small" color={site.status === 'active' ? 'success' : site.status === 'pending' ? 'warning' : 'default'} sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                          </TableCell>
                          <TableCell>
                            <Typography fontSize={13}>{site.maxDepth ? `${site.maxDepth}m` : '—'}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                              {working && <CircularProgress size={14} />}
                              <Tooltip title="View site">
                                <IconButton size="small" component="a" href={`/dive-sites/${site.slug}`} target="_blank" disabled={working}>
                                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Run enhancement — call Gemini to fetch data for this site">
                                <Button
                                  size="small" variant="outlined" color="info" disabled={working}
                                  sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}
                                  onClick={() => handleRetry({ id: site.id, flag: 'insufficient_data', originalData: { name: site.name, location: site.location, country: site.country, slug: site.slug }, timestamp: '' })}
                                >
                                  Run
                                </Button>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          ) : reviewItems.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No items in this category</Typography>
            </Box>
          ) : (
            <>
          <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={reviewAllSelected} indeterminate={reviewSomeSelected} onChange={toggleReviewAll} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Site</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Flag</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviewItems.map((item) => {
                    const working = reviewActionWorking === item.id;
                    return (
                      <TableRow key={item.id} hover selected={reviewSelected.has(item.id)} sx={{ opacity: working ? 0.5 : 1 }}>
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={reviewSelected.has(item.id)} onChange={() => setReviewSelected((prev) => { const next = new Set(prev); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next; })} />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600} fontSize={14}>{item.originalData?.name || item.id}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.id}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontSize={13}>{item.originalData?.location || '—'}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.originalData?.country || ''}</Typography>
                        </TableCell>
                        <TableCell>
                          {item.flag === 'insufficient_data'   && <Chip label="⭐ No data"        size="small" sx={{ bgcolor: '#fef9c3', color: '#854d0e', fontWeight: 600, fontSize: '0.7rem' }} />}
                          {item.flag === 'quality_check_failed' && <Chip label={`❌ Score ${item.validationScore ?? '?'}/100`} size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: '0.7rem' }} />}
                          {item.flag === 'parse_failed'         && <Chip label="🔴 Parse failed"  size="small" sx={{ bgcolor: '#fce7f3', color: '#9d174d', fontWeight: 600, fontSize: '0.7rem' }} />}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 260 }}>
                          {item.flag === 'quality_check_failed' && item.issues && (
                            <Typography variant="caption" color="text.secondary">{item.issues.slice(0, 3).join(' · ')}</Typography>
                          )}
                          {item.flag === 'parse_failed' && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 240 }}>
                              {item.rawResponse?.slice(0, 80) ?? '—'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                            {working && <CircularProgress size={14} />}
                            {item.originalData?.slug && (
                              <Tooltip title="View site">
                                <IconButton size="small" component="a" href={`/dive-sites/${item.originalData.slug}`} target="_blank" disabled={working}>
                                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {item.flag === 'parse_failed' && item.rawResponse && (
                              <Tooltip title="View raw response">
                                <IconButton size="small" onClick={() => setRawContentItem(item)} disabled={working}>
                                  <SportsIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {item.flag === 'quality_check_failed' && item.attemptedEnhancement && (
                              <Tooltip title="Force save — apply this enhancement even though it didn't pass validation">
                                <Button size="small" variant="outlined" color="warning" disabled={working}
                                  sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}
                                  onClick={() => handleForceApply(item)}>
                                  Force save
                                </Button>
                              </Tooltip>
                            )}
                            {item.flag === 'parse_failed' && item.rawResponse && (
                              <Tooltip title="Re-parse — run the improved parser on the stored response without calling Gemini again">
                                <Button size="small" variant="outlined" color="secondary" disabled={working}
                                  sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}
                                  onClick={() => handleReparse(item)}>
                                  Re-parse
                                </Button>
                              </Tooltip>
                            )}
                            {(item.flag === 'parse_failed' || item.flag === 'insufficient_data') && (
                              <Tooltip title="Retry — call Gemini again to fetch fresh data">
                                <Button size="small" variant="outlined" color="info" disabled={working}
                                  sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}
                                  onClick={() => handleRetry(item)}>
                                  Retry
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip title="Dismiss — remove from queue permanently">
                              <Button size="small" variant="outlined" color="error" disabled={working}
                                sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}
                                onClick={() => handleDismiss(item)}>
                                Dismiss
                              </Button>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}
        </Paper>
      )}

      {/* ── Raw Content Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!rawContentItem} onClose={() => setRawContentItem(null)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>Raw Gemini Response — {rawContentItem?.originalData?.name}</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              bgcolor: '#1e1e1e', color: '#d4d4d4',
              p: 2, borderRadius: 2, overflowX: 'auto',
              fontSize: '0.78rem', fontFamily: 'monospace', lineHeight: 1.6,
              maxHeight: 500, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}
          >
            {rawContentItem?.rawResponse ?? ''}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRawContentItem(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Retry Enhancement Dialog ─────────────────────────────────────── */}
      <Dialog open={!!retryDialogItem} onClose={() => retryState !== 'loading' && setRetryDialogItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          Retry Enhancement — {retryDialogItem?.originalData?.name}
          <Typography variant="body2" color="text.secondary" mt={0.5} fontWeight={400}>
            {[retryDialogItem?.originalData?.location, retryDialogItem?.originalData?.country].filter(Boolean).join(', ')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {retryState === 'idle' && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" mb={2.5}>
                Edit the search terms if needed, then start the enhancement.
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Site name"
                  value={retrySearchName}
                  onChange={(e) => setRetrySearchName(e.target.value)}
                  fullWidth
                  autoFocus
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Location / City"
                    value={retrySearchLocation}
                    onChange={(e) => setRetrySearchLocation(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Country"
                    value={retrySearchCountry}
                    onChange={(e) => setRetrySearchCountry(e.target.value)}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Box>
          )}
          {retryState === 'loading' && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <CircularProgress size={52} thickness={3} sx={{ mb: 3, color: '#0077be' }} />
              {retryMode === 'reparse' ? (
                <>
                  <Typography fontWeight={700} fontSize={16} mb={1}>Re-parsing stored response…</Typography>
                  <Typography variant="body2" color="text.secondary">Running improved parser on the existing Gemini output — no new API call</Typography>
                </>
              ) : (
                <>
                  <Typography fontWeight={700} fontSize={16} mb={1}>{RETRY_STEPS[retryLoadingStep]}</Typography>
                  <Typography variant="body2" color="text.secondary">Gemini is searching the web — this usually takes 15–40 seconds</Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" mt={2.5}>
                    {RETRY_STEPS.map((_, i) => (
                      <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i <= retryLoadingStep ? '#0077be' : '#e2e8f0', transition: 'bgcolor 0.3s' }} />
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          )}
          {retryState === 'done' && retryResult && (
            <Box sx={{ pt: 1 }}>
              {/* Status badge */}
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                {retryResult.status === 'passed' && (
                  <Chip label="✅ Passed quality check" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700 }} />
                )}
                {retryResult.status === 'quality_failed' && (
                  <Chip label={`❌ Quality failed — ${((retryResult.validation as Record<string,unknown>)?.score as number) ?? '?'}/100`} sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700 }} />
                )}
                {retryResult.status === 'insufficient_data' && (
                  <Chip label="⭐ Insufficient data found" sx={{ bgcolor: '#fef9c3', color: '#854d0e', fontWeight: 700 }} />
                )}
                {retryResult.status === 'parse_failed' && (
                  <Chip label="🔴 Parse failed" sx={{ bgcolor: '#fce7f3', color: '#9d174d', fontWeight: 700 }} />
                )}
                {!!retryResult.error && (
                  <Chip label={`Error: ${String(retryResult.error).slice(0, 60)}`} sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700 }} />
                )}
              </Stack>

              {/* Queries used */}
              {Array.isArray(retryResult.queries) && (retryResult.queries as string[]).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Searches performed:</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                    {(retryResult.queries as string[]).map((q, i) => (
                      <Chip key={i} label={q} size="small" variant="outlined" sx={{ fontSize: '0.68rem' }} />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Parsed data preview */}
              {!!retryResult.parsed && (() => {
                const p = retryResult.parsed as Record<string,unknown>;
                const hl = Array.isArray(p.highlights) ? (p.highlights as unknown[]) : null;
                const ml = p.marineLife as Record<string,unknown[]> | undefined;
                const mlCount = ml ? (ml.fish?.length ?? 0) + (ml.corals?.length ?? 0) + (ml.macro?.length ?? 0) + (ml.pelagic?.length ?? 0) : 0;
                const src = Array.isArray(p.sources) ? (p.sources as unknown[]) : null;
                const desc = typeof p.description === 'string' ? p.description : null;
                const maxD = p.maxDepth != null ? String(p.maxDepth) : null;
                const conf = p.confidence != null ? String(p.confidence) : null;
                return (
                  <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, mb: 2, border: '1px solid #e2e8f0' }}>
                    {desc && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>Description preview:</Typography>
                        <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6 }}>
                          {desc.slice(0, 300)}…
                        </Typography>
                      </Box>
                    )}
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      {hl && hl.length > 0 && <Typography variant="caption" color="text.secondary">📍 {hl.length} highlights</Typography>}
                      {mlCount > 0 && <Typography variant="caption" color="text.secondary">🐟 {mlCount} marine life entries</Typography>}
                      {src && src.length > 0 && <Typography variant="caption" color="text.secondary">🔗 {src.length} sources</Typography>}
                      {maxD && <Typography variant="caption" color="text.secondary">📏 {maxD}</Typography>}
                      {conf && <Typography variant="caption" color="text.secondary">Confidence: {conf}</Typography>}
                    </Stack>
                  </Box>
                );
              })()}

              {/* Validation issues */}
              {!!retryResult.validation && (() => {
                const issues = ((retryResult.validation as Record<string,unknown>).issues as string[] | undefined) ?? [];
                if (!issues.length) return null;
                return (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Issues:</Typography>
                    <Stack sx={{ mt: 0.5 }} spacing={0.25}>
                      {issues.map((issue, i) => (
                        <Typography key={i} variant="caption" sx={{ color: '#b91c1c' }}>• {issue}</Typography>
                      ))}
                    </Stack>
                  </Box>
                );
              })()}

              {/* Raw output for parse failures */}
              {!!retryResult.raw && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Raw output:</Typography>
                  <Box component="pre" sx={{
                    bgcolor: '#1e1e1e', color: '#d4d4d4', p: 1.5, borderRadius: 1.5, mt: 0.5,
                    fontSize: '0.72rem', fontFamily: 'monospace', maxHeight: 160, overflowY: 'auto',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  }}>
                    {String(retryResult.raw)}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          {retryDialogItem?.originalData?.slug && (
            <Button
              component="a"
              href={`/dive-sites/${retryDialogItem.originalData.slug}`}
              target="_blank"
              startIcon={<OpenInNewIcon />}
              sx={{ mr: 'auto' }}
            >
              View site
            </Button>
          )}
          {retryState === 'idle' && retryDialogItem && (
            <Button
              variant="contained"
              onClick={() => runEnhancement(retryDialogItem)}
              disabled={!retrySearchName}
              sx={{ fontWeight: 700 }}
            >
              ✨ Start Enhancement
            </Button>
          )}
          {retryState === 'done' && retryResult && (
            <>
              {(retryResult.status === 'passed' || retryResult.status === 'quality_failed') && retryResult.parsed && (
                <Button
                  variant="contained"
                  color={retryResult.status === 'passed' ? 'success' : 'warning'}
                  onClick={handleRetrySave}
                  disabled={!!reviewActionWorking}
                >
                  {reviewActionWorking ? <CircularProgress size={18} /> : retryResult.status === 'passed' ? 'Save Enhancement' : 'Force Save'}
                </Button>
              )}
              <Button variant="outlined" color="error" onClick={handleRetryDismiss} disabled={!!reviewActionWorking}>
                Dismiss from queue
              </Button>
            </>
          )}
          {retryState !== 'loading' && (
            <Button onClick={() => setRetryDialogItem(null)}>Close</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Create / Edit Dialog ───────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle fontWeight={700}>{editingSite ? `Edit: ${editingSite.name}` : 'Add Dive Site'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} pt={1}>

            {/* ── Activity Types — top of form ─────────────────────────────── */}
            <Box sx={{ p: 2, borderRadius: 2, border: '2px solid', borderColor: (draft.activities?.length ?? 0) === 0 ? '#f59e0b' : '#0077be', bgcolor: (draft.activities?.length ?? 0) === 0 ? '#fffbeb' : '#f0f7ff' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight={700}>Activity Types</Typography>
                {(draft.activities?.length ?? 0) === 0 && (
                  <Chip label="⚓ Uncharted" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#fef3c7', color: '#92400e', border: '1.5px solid #fcd34d' }} />
                )}
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {([['line_diving', 'Line Diving', '#0077be'], ['snorkeling', 'Snorkeling', '#00897b']] as const).map(([val, label, color]) => (
                  <FormControlLabel
                    key={val}
                    control={
                      <Checkbox
                        size="small"
                        checked={(draft.activities ?? []).includes(val)}
                        onChange={(e) => setDraft((d) => ({
                          ...d,
                          activities: e.target.checked
                            ? [...(d.activities ?? []), val]
                            : (d.activities ?? []).filter((a) => a !== val),
                        }))}
                        sx={{ color, '&.Mui-checked': { color } }}
                      />
                    }
                    label={<Typography variant="body2" fontWeight={600}>{label}</Typography>}
                  />
                ))}
              </Stack>
              {(draft.activities?.length ?? 0) === 0 && (
                <Typography variant="caption" sx={{ color: '#92400e', mt: 0.75, display: 'block' }}>
                  This site is <strong>Uncharted</strong> — it won't appear in the public listing until tagged as Line Diving or Snorkeling.
                </Typography>
              )}
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Site Name" value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} fullWidth required />
              <TextField label="Location / City" value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} fullWidth required />
            </Stack>

            {/* ── Gemini Enhancement ──────────────────────────────────────────── */}
            <Box sx={{ bgcolor: '#f0f7ff', borderRadius: 2, p: 2, border: '1px solid #bfdbfe' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>✨ Enhance with Gemini</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Auto-fill description, highlights, marine life & more via AI web search
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleFormEnhance}
                  disabled={!draft.name || !draft.location || formEnhancing}
                  startIcon={formEnhancing ? <CircularProgress size={14} /> : undefined}
                  sx={{ fontWeight: 700, borderColor: '#2563eb', color: '#2563eb', '&:hover': { bgcolor: '#eff6ff' }, flexShrink: 0 }}
                >
                  {formEnhancing ? 'Searching…' : '✨ Enhance'}
                </Button>
              </Stack>
              {formEnhanceResult && (
                <Box sx={{ mt: 1.5 }}>
                  {formEnhanceResult.status === 'passed' && (
                    <Alert severity="success" sx={{ mb: 1, py: 0.5 }}>
                      Enhancement ready — quality score {((formEnhanceResult.validation as Record<string,unknown>)?.score as number) ?? '?'}/100
                    </Alert>
                  )}
                  {formEnhanceResult.status === 'quality_failed' && (
                    <Alert severity="warning" sx={{ mb: 1, py: 0.5 }}>
                      Low quality score ({((formEnhanceResult.validation as Record<string,unknown>)?.score as number) ?? '?'}/100) — you can still apply it
                    </Alert>
                  )}
                  {formEnhanceResult.status === 'insufficient_data' && (
                    <Alert severity="info" sx={{ py: 0.5 }}>No sufficient data found for this site</Alert>
                  )}
                  {formEnhanceResult.status === 'parse_failed' && (
                    <Alert severity="error" sx={{ py: 0.5 }}>Could not parse Gemini response</Alert>
                  )}
                  {(formEnhanceResult.status === 'passed' || formEnhanceResult.status === 'quality_failed') && !!formEnhanceResult.parsed && (
                    <Button size="small" variant="contained" onClick={applyFormEnhancement} sx={{ mt: 1, fontWeight: 700 }}>
                      Apply description & highlights to form
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CountryAutocomplete
                value={lookupCountry(draft.country) ?? null}
                onChange={(c) => setDraft((d) => ({ ...d, country: c?.label ?? '' }))}
                fullWidth
              />
              <TextField label="Slug (auto-generated)" value={draft.slug || generateSlug(draft.name)}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                fullWidth helperText="URL-friendly identifier" />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Water Type</InputLabel>
                <Select label="Water Type" value={draft.waterType}
                  onChange={(e) => setDraft((d) => ({ ...d, waterType: e.target.value as DiveSite['waterType'] }))}>
                  {([['sea', 'Sea'], ['lake', 'Lake'], ['deep_tank', 'Deep Tank']] as const).map(([val, label]) => (
                    <MenuItem key={val} value={val}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as DiveSite['status'] }))}>
                  {(['active', 'pending', 'archived'] as const).map((s) => (
                    <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Max Depth (m)" type="number" value={draft.maxDepth}
                onChange={(e) => setDraft((d) => ({ ...d, maxDepth: parseFloat(e.target.value) || 0 }))} fullWidth />
              <TextField label="Visibility Min (m)" type="number" value={draft.visibility.min}
                onChange={(e) => setDraft((d) => ({ ...d, visibility: { ...d.visibility, min: parseFloat(e.target.value) || 0 } }))} fullWidth />
              <TextField label="Visibility Max (m)" type="number" value={draft.visibility.max}
                onChange={(e) => setDraft((d) => ({ ...d, visibility: { ...d.visibility, max: parseFloat(e.target.value) || 0 } }))} fullWidth />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
              <TextField label="Latitude" type="number" value={draft.coordinates.lat}
                onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, lat: parseFloat(e.target.value) || 0 } }))}
                fullWidth helperText={draft.coordinates.lat ? ddmLat(draft.coordinates.lat) : ''} />
              <TextField label="Longitude" type="number" value={draft.coordinates.lng}
                onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, lng: parseFloat(e.target.value) || 0 } }))}
                fullWidth helperText={draft.coordinates.lng ? ddmLng(draft.coordinates.lng) : ''} />
              <Button variant="outlined" startIcon={<MyLocationIcon />}
                onClick={() => { setMapPickerPos({ lat: draft.coordinates.lat || 20, lng: draft.coordinates.lng || 10 }); setMapPickerOpen(true); }}
                sx={{ whiteSpace: 'nowrap', height: 56, flexShrink: 0 }}>
                Pick on Map
              </Button>
            </Stack>

            <TextField label="Description" value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              multiline rows={4} fullWidth />

            <TextField label="Highlights (one per line)" value={draft.highlights.join('\n')}
              onChange={(e) => setDraft((d) => ({ ...d, highlights: e.target.value.split('\n').filter(Boolean) }))}
              multiline rows={3} fullWidth helperText="Enter each highlight on a new line" />

            <TextField label="Facilities (one per line)" value={draft.facilities.join('\n')}
              onChange={(e) => setDraft((d) => ({ ...d, facilities: e.target.value.split('\n').filter(Boolean) }))}
              multiline rows={2} fullWidth helperText="e.g. Parking, Changing rooms, Café nearby" />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>Best Seasons</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(['Spring', 'Summer', 'Autumn', 'Winter'] as const).map((season) => (
                  <FormControlLabel
                    key={season}
                    control={
                      <Checkbox size="small" checked={draft.bestSeasons.includes(season)}
                        onChange={(e) => setDraft((d) => ({
                          ...d,
                          bestSeasons: e.target.checked ? [...d.bestSeasons, season] : d.bestSeasons.filter((s) => s !== season),
                        }))} />
                    }
                    label={season}
                  />
                ))}
              </Stack>
            </Box>


            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={600}>Water Temperature by Month (°C)</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={fetchWaterTemps}
                  disabled={fetchingTemps || !draft.coordinates.lat || !draft.coordinates.lng || draft.waterType === 'deep_tank'}
                  startIcon={fetchingTemps ? <CircularProgress size={13} /> : undefined}
                  sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                >
                  {fetchingTemps ? 'Fetching…' : '🌡️ Fetch from coords'}
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {MONTH_KEYS.map((key, i) => (
                  <TextField key={key} label={MONTH_LABELS[i]} type="number"
                    value={draft.waterTemp[key] ?? ''} onChange={(e) => updateTemp(key, e.target.value)}
                    size="small" sx={{ width: 70 }} inputProps={{ step: 0.5 }} />
                ))}
              </Stack>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch checked={!!draft.thermocline}
                    onChange={(e) => setDraft((d) => ({
                      ...d,
                      thermocline: e.target.checked ? { depth: 10, tempDrop: 5, seasons: [], notes: '' } : undefined,
                    }))} />
                }
                label={<Typography variant="subtitle2" fontWeight={600}>Thermocline present</Typography>}
              />
              {draft.thermocline && (
                <Stack spacing={2} mt={1.5} pl={1} sx={{ borderLeft: '3px solid #0288d1' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Depth (m)" type="number" value={draft.thermocline.depth}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, depth: parseFloat(e.target.value) || 0 } }))}
                      size="small" sx={{ width: 120 }} helperText="Where it starts" />
                    <TextField label="Temp drop (°C)" type="number" value={draft.thermocline.tempDrop}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, tempDrop: parseFloat(e.target.value) || 0 } }))}
                      size="small" sx={{ width: 140 }} helperText="Degrees colder below" />
                    <TextField label="Seasons (comma-separated)" value={(draft.thermocline.seasons ?? []).join(', ')}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, seasons: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } }))}
                      size="small" fullWidth helperText="e.g. Summer, Autumn" />
                  </Stack>
                  <TextField label="Thermocline notes" value={draft.thermocline.notes ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, notes: e.target.value } }))}
                    multiline rows={2} fullWidth
                    placeholder="Describe what divers should expect — buoyancy shift, visibility change, etc." />
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !draft.name || !draft.location}>
            {saving ? <CircularProgress size={20} /> : editingSite ? 'Save Changes' : 'Create Site'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single delete confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Dive Site?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk delete confirmation */}
      <Dialog open={bulkDeleteConfirm} onClose={() => setBulkDeleteConfirm(false)}>
        <DialogTitle>Delete {selected.size} sites?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently delete <strong>{selected.size} dive sites</strong>. This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteConfirm(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={bulkDelete} disabled={bulkWorking}>
            {bulkWorking ? <CircularProgress size={20} /> : `Delete ${selected.size} sites`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk set country dialog */}
      <Dialog open={countryDialogOpen} onClose={() => setCountryDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Set Country for {selected.size} sites</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <CountryAutocomplete value={bulkCountry} onChange={(c) => setBulkCountry(c)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCountryDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={bulkSetCountry} disabled={!bulkCountry || bulkWorking}>
            {bulkWorking ? <CircularProgress size={20} /> : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk set activity dialog */}
      <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Set Activity for {selected.size} sites</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This will <strong>replace</strong> the activity tags on all selected sites. Select at least one activity, or leave both unchecked to mark them as <strong>Uncharted</strong>.
          </Typography>
          <Stack spacing={1}>
            {([['line_diving', 'Line Diving', '#0077be'], ['snorkeling', 'Snorkeling', '#00897b']] as const).map(([val, label, color]) => (
              <FormControlLabel
                key={val}
                control={
                  <Checkbox
                    checked={bulkActivities.includes(val)}
                    onChange={(e) => setBulkActivities((prev) =>
                      e.target.checked ? [...prev, val] : prev.filter((a) => a !== val)
                    )}
                    sx={{ color, '&.Mui-checked': { color } }}
                  />
                }
                label={<Typography fontWeight={600}>{label}</Typography>}
              />
            ))}
          </Stack>
          {bulkActivities.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No activity selected — sites will be marked as <strong>⚓ Uncharted</strong> and hidden from the public listing.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={bulkSetActivity} disabled={bulkWorking}>
            {bulkWorking ? <CircularProgress size={20} /> : `Apply to ${selected.size} sites`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Coordinate map picker */}
      <Dialog open={mapPickerOpen} onClose={() => setMapPickerOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { height: '80vh' } }}>
        <DialogTitle fontWeight={700}>
          Pick Location
          <Typography variant="body2" color="text.secondary" mt={0.5}>Drag the pin or click anywhere to move it.</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <CoordinatePickerMap position={mapPickerPos} onChange={setMapPickerPos} />
          </Box>
          <Box sx={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.65)', color: '#fff', px: 2, py: 0.75, borderRadius: 2,
            fontSize: 13, fontFamily: 'monospace', pointerEvents: 'none', zIndex: 1000,
          }}>
            {ddmLat(mapPickerPos.lat)}  {ddmLng(mapPickerPos.lng)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setMapPickerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setDraft((d) => ({ ...d, coordinates: { lat: parseFloat(mapPickerPos.lat.toFixed(6)), lng: parseFloat(mapPickerPos.lng.toFixed(6)) } }));
            setMapPickerOpen(false);
          }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
