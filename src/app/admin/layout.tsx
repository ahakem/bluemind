'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useState } from 'react';

const drawerWidth = 260;

const getMenuItems = (role?: 'admin' | 'editor' | 'author') => {
  const allItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/admin', roles: ['admin', 'editor', 'author'] },
    { text: 'Blog Posts', icon: <ArticleIcon />, href: '/admin/blog', roles: ['admin', 'editor', 'author'] },
    { text: 'Partners', icon: <HandshakeIcon />, href: '/admin/partners', roles: ['admin', 'editor'] },
    { text: 'Guest Instructors', icon: <SchoolIcon />, href: '/admin/instructors', roles: ['admin', 'editor'] },
    { text: 'User Management', icon: <PeopleIcon />, href: '/admin/users', roles: ['admin'] },
  ];
  
  if (!role) return allItems;
  return allItems.filter(item => item.roles.includes(role));
};

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, adminUser, loading, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const isLoginPage = pathname?.includes('/admin/login') ?? false;
  const isAdminPath = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (isLoginPage) return; // Don't redirect on login page
    
    if (!loading && !user) {
      router.push('/admin/login');
    } else if (!loading && user && !isAdmin) {
      router.push('/admin/login');
    }
  }, [user, loading, isAdmin, router, isLoginPage]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  // Render login page without the admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If pathname is not available yet (during initial load), show children
  if (!pathname) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#001f3f' }}>
        <CircularProgress sx={{ color: '#0077be' }} />
      </Box>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const drawer = (
    <Box sx={{ bgcolor: '#001f3f', height: '100%', color: 'white' }}>
      <Toolbar sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#0077be' }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <List>
        {getMenuItems(adminUser?.role).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              sx={{
                '&:hover': { bgcolor: 'rgba(0, 119, 190, 0.2)' },
                '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.7)' },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleSignOut}
            sx={{
              '&:hover': { bgcolor: 'rgba(255, 0, 0, 0.1)' },
              '& .MuiListItemIcon-root': { color: '#ff6b6b' },
            }}
          >
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sign Out" sx={{ color: '#ff6b6b' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Blue Mind Freediving
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {adminUser?.displayName || adminUser?.email}
            </Typography>
            <IconButton onClick={handleMenuOpen}>
              <Avatar 
                src={adminUser?.avatar} 
                sx={{ bgcolor: '#0077be', width: 36, height: 36 }}
              >
                {!adminUser?.avatar && (adminUser?.displayName || adminUser?.email || 'A')[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Role: {adminUser?.role}
                </Typography>
              </MenuItem>
              <MenuItem component={Link} href="/admin/profile" onClick={handleMenuClose}>
                Edit Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
