import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

export function useAdminData() {  const [data, setData] = useState({
    creators: [],
    payouts: [],
    donations: [],
    feedbacks: [],
    feedbackCounts: {}
  });
  
  const [loading, setLoading] = useState({
    creators: true,
    payouts: true,
    donations: true,
    feedbacks: true
  });
  
  const [errors, setErrors] = useState({
    creators: null,
    payouts: null,
    donations: null,
    feedbacks: null
  });

  const fetchCreators = useCallback(async () => {
    setLoading(prev => ({ ...prev, creators: true }));
    try {
      const res = await api.get('/api/admin/creators');
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
      const res = await api.get('/api/admin/payouts');
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
      const res = await api.get('/api/admin/donations?limit=200');
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

  const fetchFeedbacks = useCallback(async () => {
    setLoading(prev => ({ ...prev, feedbacks: true }));
    try {
      const res = await api.get('/api/admin/feedback');
      setData(prev => ({ 
        ...prev, 
        feedbacks: res.data?.data || [],
        feedbackCounts: res.data?.counts || {}
      }));
      setErrors(prev => ({ ...prev, feedbacks: null }));
    } catch (err) {
      console.error('Feedbacks API error:', err);
      setData(prev => ({ ...prev, feedbacks: [], feedbackCounts: {} }));
      setErrors(prev => ({ ...prev, feedbacks: err.response?.data?.error }));
    } finally {
      setLoading(prev => ({ ...prev, feedbacks: false }));
    }
  }, []);

  useEffect(() => {
    fetchCreators();
    fetchPayouts();
    fetchDonations();
    fetchFeedbacks();
  }, [fetchCreators, fetchPayouts, fetchDonations, fetchFeedbacks]);

  return {
    data,
    loading,
    errors,
    refetch: {
      creators: fetchCreators,
      payouts: fetchPayouts,
      donations: fetchDonations,
      feedbacks: fetchFeedbacks
    }
  };
}
