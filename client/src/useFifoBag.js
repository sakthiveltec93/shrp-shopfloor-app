import { useEffect, useState } from 'react';
import { api } from './api';

// Shared logic for the FIFO-driven stage pages (Trimming / Inspection / Packing):
// pick a part, auto-pull the oldest ready bag for that stage, submit a reading.
export function useFifoBag(stage) {
  const [parts, setParts] = useState([]);
  const [partId, setPartId] = useState('');
  const [bag, setBag] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.parts().then(setParts); }, []);

  async function fetchBag(pid) {
    setError('');
    setBag(null);
    if (!pid) return;
    setLoading(true);
    try {
      setBag(await api.fifoBag(pid, stage));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectPart(pid) {
    setPartId(pid);
    fetchBag(pid);
  }

  function refetch() {
    fetchBag(partId);
  }

  return { parts, partId, bag, error, loading, selectPart, refetch, setError };
}
