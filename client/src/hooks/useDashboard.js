import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useDashboard(initialRole = 'supervisor') {
  const [viewRole, setViewRole] = useState(initialRole);
  
  // Supervisor View State
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shiftCode, setShiftCode] = useState('A');
  const [supervisorData, setSupervisorData] = useState(null);
  const [supervisorLoading, setSupervisorLoading] = useState(true);
  const [supervisorError, setSupervisorError] = useState(null);

  // Management View State
  const [mgmtPeriod, setMgmtPeriod] = useState('mtd'); // 'today', 'yesterday', 'week', 'mtd', 'custom'
  const [mgmtStartDate, setMgmtStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [mgmtEndDate, setMgmtEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [managementData, setManagementData] = useState(null);
  const [managementLoading, setManagementLoading] = useState(true);
  const [managementError, setManagementError] = useState(null);

  // Last refresh timestamp
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  // Determine current shift based on local time if not set
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 8 && hr < 16) {
      setShiftCode('A'); // Shift I
    } else if (hr >= 16 && hr < 24) {
      setShiftCode('B'); // Shift II
    } else {
      setShiftCode('C'); // Shift III
    }
  }, []);

  // Update date ranges when mgmtPeriod changes
  const handlePeriodChange = useCallback((period) => {
    setMgmtPeriod(period);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (period === 'today') {
      setMgmtStartDate(todayStr);
      setMgmtEndDate(todayStr);
    } else if (period === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      setMgmtStartDate(yStr);
      setMgmtEndDate(yStr);
    } else if (period === 'week') {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      setMgmtStartDate(w.toISOString().slice(0, 10));
      setMgmtEndDate(todayStr);
    } else if (period === 'mtd') {
      const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      setMgmtStartDate(mtdStart);
      setMgmtEndDate(todayStr);
    }
  }, []);

  // Fetch Supervisor Data
  const fetchSupervisorData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setSupervisorLoading(true);
    setSupervisorError(null);
    try {
      const res = await api.dashboard.supervisor({ date: shiftDate, shift: shiftCode });
      if (res && !res.error) {
        setSupervisorData(res.data || res);
      } else {
        setSupervisorError(res?.error || 'Failed to load supervisor dashboard data');
      }
    } catch (err) {
      console.error('Supervisor dashboard fetch error:', err);
      setSupervisorError(err.message || 'Error fetching supervisor dashboard');
    } finally {
      setSupervisorLoading(false);
      setLastRefreshedAt(new Date());
    }
  }, [shiftDate, shiftCode]);

  // Fetch Management Data
  const fetchManagementData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setManagementLoading(true);
    setManagementError(null);
    try {
      const res = await api.dashboard.management({ startDate: mgmtStartDate, endDate: mgmtEndDate });
      if (res && !res.error) {
        setManagementData(res.data || res);
      } else {
        setManagementError(res?.error || 'Failed to load management dashboard data');
      }
    } catch (err) {
      console.error('Management dashboard fetch error:', err);
      setManagementError(err.message || 'Error fetching management dashboard');
    } finally {
      setManagementLoading(false);
      setLastRefreshedAt(new Date());
    }
  }, [mgmtStartDate, mgmtEndDate]);

  // Auto-fetch on parameter change
  useEffect(() => {
    if (viewRole === 'supervisor') {
      fetchSupervisorData(true);
    }
  }, [viewRole, shiftDate, shiftCode, fetchSupervisorData]);

  useEffect(() => {
    if (viewRole === 'management') {
      fetchManagementData(true);
    }
  }, [viewRole, mgmtStartDate, mgmtEndDate, fetchManagementData]);

  // Background polling (every 15s for supervisor, 30s for management)
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        if (viewRole === 'supervisor') {
          fetchSupervisorData(false);
        } else {
          fetchManagementData(false);
        }
      }
    }, viewRole === 'supervisor' ? 15000 : 30000);

    return () => clearInterval(timer);
  }, [viewRole, fetchSupervisorData, fetchManagementData]);

  // Shift handover submission
  const submitShiftHandover = async (payload) => {
    const res = await api.dashboard.shiftHandover(payload);
    if (res && res.ok) {
      fetchSupervisorData(false);
    }
    return res;
  };

  return {
    viewRole,
    setViewRole,
    // Supervisor
    shiftDate,
    setShiftDate,
    shiftCode,
    setShiftCode,
    supervisorData,
    supervisorLoading,
    supervisorError,
    refreshSupervisor: () => fetchSupervisorData(true),
    submitShiftHandover,
    // Management
    mgmtPeriod,
    handlePeriodChange,
    mgmtStartDate,
    setMgmtStartDate,
    mgmtEndDate,
    setMgmtEndDate,
    managementData,
    managementLoading,
    managementError,
    refreshManagement: () => fetchManagementData(true),
    // Common
    lastRefreshedAt,
  };
}
