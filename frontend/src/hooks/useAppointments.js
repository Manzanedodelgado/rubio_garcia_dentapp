import { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI } from '../services/apiService';
import { toast } from './use-toast';

export const useAppointments = (filters = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching appointments with filters:', filters);
      const response = await appointmentsAPI.getAll(filters);
      console.log('Appointments response:', response.data);
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching appointments';
      setError(errorMessage);
      setAppointments([]); // Set empty array on error
      
      // Only show toast for real errors, not loading states
      if (err.response?.status !== 307) {
        toast({
          title: "Error al cargar citas",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), loading]); // Use JSON.stringify for deep comparison

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const refresh = useCallback(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refresh,
  };
};

export const useAppointmentStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentsAPI.getStats();
      setStats(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching stats';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
};

export const useTodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodayAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentsAPI.getToday();
      setAppointments(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching today\'s appointments';
      setError(errorMessage);
      console.error('Error fetching today\'s appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayAppointments();
  }, [fetchTodayAppointments]);

  const refresh = useCallback(() => {
    fetchTodayAppointments();
  }, [fetchTodayAppointments]);

  return {
    appointments,
    loading,
    error,
    refresh,
  };
};

export const useSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const triggerSync = useCallback(async () => {
    setSyncing(true);
    
    try {
      const response = await appointmentsAPI.sync();
      const result = response.data;
      
      if (result.success) {
        toast({
          title: "Sincronización exitosa",
          description: `${result.synced} citas sincronizadas desde Google Sheets`,
        });
      } else {
        toast({
          title: "Error en sincronización",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error syncing data';
      toast({
        title: "Error en sincronización",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await appointmentsAPI.getSyncStatus();
      setSyncStatus(response.data);
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  }, []);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  return {
    syncing,
    syncStatus,
    triggerSync,
    refreshSyncStatus: fetchSyncStatus,
  };
};