'use client';

import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

interface Stats {
  partners: number;
  instructors: number;
  users: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ partners: 0, instructors: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isFirebaseConfigured() || !db) {
        setLoading(false);
        return;
      }
      
      try {
        const [partnersSnap, instructorsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'partners')),
          getDocs(collection(db, 'guestInstructors')),
          getDocs(collection(db, 'adminUsers')),
        ]);
        
        setStats({
          partners: partnersSnap.size,
          instructors: instructorsSnap.size,
          users: usersSnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Partners', value: stats.partners, icon: <HandshakeIcon sx={{ fontSize: 48 }} />, color: '#0077be' },
    { title: 'Guest Instructors', value: stats.instructors, icon: <SchoolIcon sx={{ fontSize: 48 }} />, color: '#00a86b' },
    { title: 'Admin Users', value: stats.users, icon: <PeopleIcon sx={{ fontSize: 48 }} />, color: '#ff6b6b' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {card.title}
                    </Typography>
                    <Typography variant="h3" fontWeight={700}>
                      {loading ? '...' : card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color, opacity: 0.8 }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Quick Start Guide
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Welcome to the Blue Mind Freediving admin panel. Here you can manage:
            </Typography>
            <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
              <li><strong>Partners:</strong> Add, edit, or remove community partners displayed on the Community page.</li>
              <li><strong>Guest Instructors:</strong> Manage guest instructors and collaborators with their photos and social links.</li>
              <li><strong>User Management:</strong> Add or remove admin users who can access this panel.</li>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Use the sidebar navigation to access each section.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
