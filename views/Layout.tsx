import React from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, useTheme } from '@mui/material';
import { Button } from '@progress/kendo-react-buttons';
import { TreeView } from '@progress/kendo-react-treeview';
import { Menu, MenuItem } from '@progress/kendo-react-layout';
import { AppMode } from '../types';
import { Logo } from '../components/Logo';
// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import ArticleIcon from '@mui/icons-material/Article';
import UploadIcon from '@mui/icons-material/Upload';
import InterestsIcon from '@mui/icons-material/Interests';


export type DoctorViewType = 'dashboard' | 'research' | 'education' | 'cephalometric' | 'breast-cancer-analysis';
export type PatientViewType = 'dashboard' | 'my-reports' | 'report-viewer' | 'menstrual-tracker' | 'pregnancy-tracker' | 'symptom-checker' | 'health-education' | 'medication-helper' | 'scan-annotator' | 'health-plan';


interface LayoutProps {
  mode: AppMode;
  onUploadClick: () => void;
  onSwitchMode: () => void;
  onNavigate: (view: DoctorViewType | PatientViewType) => void;
  children: React.ReactNode;
  viewTitle: string;
}

const drawerWidth = 280;

const doctorNavItems = [
  { text: 'Triage Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
  { text: 'Cephalometric Analysis', icon: <InterestsIcon />, view: 'cephalometric' },
  { text: 'Breast Cancer Analysis', icon: <ScienceIcon />, view: 'breast-cancer-analysis' },
  { text: 'Research', icon: <ArticleIcon />, view: 'research' },
  { text: 'Education Studio', icon: <SchoolIcon />, view: 'education' },
];

const patientNavItems = [
    { text: 'Health Hub', icon: <DashboardIcon />, view: 'dashboard' },
    { text: 'My Reports', icon: <ArticleIcon />, view: 'my-reports' },
];

const Layout: React.FC<LayoutProps> = ({ mode, onUploadClick, onSwitchMode, onNavigate, children, viewTitle }) => {
  const theme = useTheme();
  const navItems = mode === 'doctor' ? doctorNavItems : patientNavItems;

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3, gap: 1 }}>
        <Logo size={52}/>
        <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          EVE AI
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            AI for Her Health
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 2 }}>
        <TreeView
          data={navItems.map(item => ({
            text: item.text,
            id: item.view,
            icon: item.icon
          }))}
          onItemClick={(e) => onNavigate(e.item.id as any)}
          item={({ item }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', py: 1, px: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
              <Box sx={{ color: 'text.primary', mr: 2 }}>{item.icon}</Box>
              <Typography color="text.primary">{item.text}</Typography>
            </Box>
          )}
        />
      </Box>
      <Divider />
       <List sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <ListItem disablePadding>
                <ListItemButton onClick={onSwitchMode} sx={{py: 1.5, px: 3}}>
                <ListItemIcon sx={{ color: 'text.secondary' }}><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Switch Role" />
                </ListItemButton>
            </ListItem>
       </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          overflowX: 'hidden'
        }}
      >
        <Toolbar>
          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {viewTitle}
          </Typography>
          <Menu 
            style={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              zIndex: theme.zIndex.modal + 1, // Ensure it's above other elements
            }}
          >
            <MenuItem text="File" style={{ color: theme.palette.text.primary }}>
              <MenuItem text="Upload Scan" onClick={onUploadClick} style={{ color: theme.palette.text.primary }} />
              <MenuItem text="Export Report" style={{ color: theme.palette.text.primary }} />
            </MenuItem>
            <MenuItem text="View" style={{ color: theme.palette.text.primary }}>
              <MenuItem text="Dashboard" onClick={() => onNavigate('dashboard')} style={{ color: theme.palette.text.primary }} />
              <MenuItem text="Settings" style={{ color: theme.palette.text.primary }} />
            </MenuItem>
          </Menu>
          { mode === 'doctor' && viewTitle === 'Triage Dashboard' &&
            <Button themeColor="secondary" onClick={onUploadClick}>
              <UploadIcon style={{ marginRight: '8px' }} />
              Upload Scan
            </Button>
          }
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
            variant="permanent"
            sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', color: 'text.primary' },
            }}
            open
        >
            {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, height: '100vh', overflow: 'auto', color: 'text.primary' }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;