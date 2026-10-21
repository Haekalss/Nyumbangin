'use client';

import { useEffect, useState } from 'react';

/**
 * Fetch JSON sederhana dengan proteksi unmount.
 * Menghilangkan duplikasi pola "let active = true" di beberapa component.
 *
 * @returns {{ data: any, loading: boolean, error: Error|null }}
 */
export default function useFetchJson(url, { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (active) setData(json);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url, skip]);

  return { data, loading, error };
}
