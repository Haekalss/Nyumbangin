import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useAdminData() {
  const [data, setData] = useState({
    creators: [],
    payouts: [],
    donations: []
  });
  
  const [loading, setLoading] = useState({
    creators: true,
    payouts: true,
    donations: true
  });
  
  const [errors, setErrors] = useState({
    creators: null,
    payouts: null,
    donations: null
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const fetchCreators = useCallback(async () => {
    setLoading(prev => ({ ...prev, creators: true }));
    try {
      const res = await axios.get('/api/admin/creators', getAuthHeaders());
      setData(prev => ({ ...prev, creators: res.data?.creators || [] }));
      setErrors(prev => ({ ...prev, creators: null }));
    } catch (err) {
      console.error('Creators API error:', err);
      setData(prev => ({ ...prev, creators: [] }));
      setErrors(prev => ({ ...prev, creators: err.response?.data?.error }));
    } finally {
      setLoading(prev => ({ ...prev, creators: false }));
    }
  }, []);

  const fetchPayouts = useCallback(async () => {
    setLoading(prev => ({ ...prev, payouts: true }));
    try {
      const res = await axios.get('/api/admin/payouts', getAuthHeaders());
      setData(prev => ({ ...prev, payouts: res.data?.data || [] }));
      setErrors(prev => ({ ...prev, payouts: null }));
    } catch (err) {
      console.error('Payouts API error:', err);
      setData(prev => ({ ...prev, payouts: [] }));
      setErrors(prev => ({ ...prev, payouts: err.response?.data?.error || "Gagal memuat data pengajuan payout" }));
    } finally {
      setLoading(prev => ({ ...prev, payouts: false }));
    }
  }, []);

  const fetchDonations = useCallback(async () => {
    setLoading(prev => ({ ...prev, donations: true }));
    try {
      const res = await axios.get('/api/admin/donations?limit=200', getAuthHeaders());
      setData(prev => ({ ...prev, donations: res.data?.data || [] }));
      setErrors(prev => ({ ...prev, donations: null }));
    } catch (err) {
      console.error('Donations API error:', err);
      setData(prev => ({ ...prev, donations: [] }));
      setErrors(prev => ({ ...prev, donations: err.response?.data?.error }));
    } finally {
      setLoading(prev => ({ ...prev, donations: false }));
    }
  }, []);

  useEffect(() => {
    fetchCreators();
    fetchPayouts();
    fetchDonations();
  }, [fetchCreators, fetchPayouts, fetchDonations]);

  return {
    data,
    loading,
    errors,
    refetch: {
      creators: fetchCreators,
      payouts: fetchPayouts,
      donations: fetchDonations
    }
  };
}
