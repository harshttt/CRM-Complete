// ScoreboardContext.jsx
import { createContext, useState, useContext } from 'react';
import { notification } from 'antd';

const ScoreboardContext = createContext();

export const useScoreboard = () => useContext(ScoreboardContext);

export const ScoreboardProvider = ({ children, initialRole = 'salesperson' }) => {
  const [userRole, setUserRole] = useState(initialRole);
  const [timeRange, setTimeRange] = useState('today');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('detailed'); // detailed, summary, comparison

  // Mock data for different roles
  const mockData = {
    salesperson: {
      id: 'SP001',
      name: 'Alex Johnson',
      role: 'Senior Sales Executive',
      team: 'Enterprise Sales',
      region: 'North America',
      dailyScore: 85,
      rating: 'High Performer',
      metrics: {
        calls: 8,
        emails: 12,
        meetings: 2,
        tasksCompleted: 4
      }
    },
    manager: {
      id: 'MG001',
      name: 'Sarah Chen',
      role: 'Sales Manager',
      team: 'Enterprise Sales',
      region: 'North America',
      teamMembers: 8,
      teamAverageScore: 76,
      topPerformer: 'Alex Johnson',
      lowPerformer: 'Mike Brown'
    },
    admin: {
      id: 'AD001',
      name: 'Admin User',
      role: 'Administrator',
      totalSalespeople: 45,
      totalManagers: 6,
      systemStatus: 'active'
    },
    superadmin: {
      id: 'SA001',
      name: 'Super Admin',
      role: 'Super Administrator',
      totalUsers: 125,
      activeSystems: 3,
      totalRevenue: '$2.5M'
    }
  };

  // Teams data
  const teamsData = [
    { id: 'team1', name: 'Enterprise Sales', manager: 'Sarah Chen', size: 8, avgScore: 76, region: 'North America' },
    { id: 'team2', name: 'SMB Sales', manager: 'Robert Kim', size: 12, avgScore: 68, region: 'North America' },
    { id: 'team3', name: 'Government Sales', manager: 'Lisa Wong', size: 6, avgScore: 82, region: 'North America' },
    { id: 'team4', name: 'EMEA Sales', manager: 'David Smith', size: 10, avgScore: 71, region: 'EMEA' },
    { id: 'team5', name: 'APAC Sales', manager: 'Priya Patel', size: 9, avgScore: 74, region: 'APAC' }
  ];

  // Salespeople data for managers/admins
  const salespeopleData = [
    { id: 'SP001', name: 'Alex Johnson', team: 'Enterprise Sales', dailyScore: 85, weeklyAvg: 82, rating: 'High Performer', manager: 'Sarah Chen' },
    { id: 'SP002', name: 'Mike Brown', team: 'Enterprise Sales', dailyScore: 62, weeklyAvg: 58, rating: 'Consistent', manager: 'Sarah Chen' },
    { id: 'SP003', name: 'Emma Wilson', team: 'Enterprise Sales', dailyScore: 92, weeklyAvg: 88, rating: 'Rockstar', manager: 'Sarah Chen' },
    { id: 'SP004', name: 'James Lee', team: 'SMB Sales', dailyScore: 45, weeklyAvg: 52, rating: 'Needs Improvement', manager: 'Robert Kim' },
    { id: 'SP005', name: 'Sophia Garcia', team: 'SMB Sales', dailyScore: 78, weeklyAvg: 75, rating: 'High Performer', manager: 'Robert Kim' },
    { id: 'SP006', name: 'Thomas Chen', team: 'Government Sales', dailyScore: 95, weeklyAvg: 90, rating: 'Rockstar', manager: 'Lisa Wong' },
    { id: 'SP007', name: 'Olivia Martinez', team: 'EMEA Sales', dailyScore: 82, weeklyAvg: 79, rating: 'High Performer', manager: 'David Smith' },
    { id: 'SP008', name: 'William Taylor', team: 'APAC Sales', dailyScore: 71, weeklyAvg: 69, rating: 'Consistent', manager: 'Priya Patel' }
  ];

  // System metrics for super admin
  const systemMetrics = {
    overall: {
      totalScore: 4250,
      averageScore: 75,
      rockstars: 8,
      highPerformers: 18,
      atRisk: 3
    },
    byRegion: [
      { region: 'North America', avgScore: 76, users: 26, growth: '+12%' },
      { region: 'EMEA', avgScore: 71, users: 10, growth: '+8%' },
      { region: 'APAC', avgScore: 74, users: 9, growth: '+15%' }
    ],
    trends: {
      dailyActive: '94%',
      weeklyGrowth: '+5.2%',
      systemUptime: '99.9%',
      compliance: '100%'
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      notification.success({
        message: 'Data Refreshed',
        description: 'All metrics have been updated successfully.'
      });
    }, 1000);
  };

  const exportData = (format = 'csv') => {
    notification.info({
      message: 'Export Started',
      description: `Exporting data in ${format.toUpperCase()} format...`
    });
  };

  const updateUserRole = (newRole) => {
    setUserRole(newRole);
    notification.info({
      message: 'View Changed',
      description: `Now viewing as ${newRole}`
    });
  };

  const value = {
    userRole,
    setUserRole: updateUserRole,
    timeRange,
    setTimeRange,
    selectedTeam,
    setSelectedTeam,
    selectedRegion,
    setSelectedRegion,
    loading,
    setLoading,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    mockData: mockData[userRole],
    teamsData,
    salespeopleData,
    systemMetrics,
    refreshData,
    exportData
  };

  return (
    <ScoreboardContext.Provider value={value}>
      {children}
    </ScoreboardContext.Provider>
  );
};