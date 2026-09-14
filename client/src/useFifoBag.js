import { useEffect, useState, useCallback } from 'react';
import { api } from './api';

// Shared logic for the FIFO-driven & QR-scannable stage pages
// (Trimming, Inspection, Packing, Dispatch)
export function useFifoBag(stage) {
  const [parts, setParts] = useState([]);
  const [partId, setPartId] = useState('');
  const [bag, setBag] = useState(null);
  const [method, setMethod] = useState('scan'); // 'scan' | 'manual'
  const [scanInput, setScanInput] = useState('');

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchBags, setBatchBags] = useState([]);

  const [fifoViolation, setFifoViolation] = useState(null);
  const [fifoOverrideReason, setFifoOverrideReason] = useState('');
  const [isFifoOverridden, setIsFifoOverridden] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.parts().then((res) => {
      // If stage is trim, only show parts requiring trim; if inspect, parts requiring inspection
      let filtered = res;
      if (stage === 'trim') filtered = res.filter((p) => p.trim_required);
      if (stage === 'inspect') filtered = res.filter((p) => p.inspection_required);
      setParts(filtered);
    }).catch(() => {});
  }, [stage]);

  const loadBagByCode = useCallback(async (code) => {
    if (!code) return;
    setError('');
    setSuccess('');
    setFifoViolation(null);
    setIsFifoOverridden(false);
    setLoading(true);

    try {
      const res = await api.scanBag(code, stage);
      setBag(res.bag);
      setPartId(String(res.bag.part_id));

      if (!res.fifoValid && res.oldestBag) {
        setFifoViolation({
          oldestBag: res.oldestBag,
          canOverride: res.canOverride,
        });
      }
    } catch (err) {
      setBag(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stage]);

  function handleScanSubmit(e) {
    if (e) e.preventDefault();
    if (!scanInput.trim()) return;
    loadBagByCode(scanInput.trim());
  }

  // Method A (Manual) Part Selection
  async function selectPart(pid) {
    setPartId(pid);
    setBag(null);
    setSelectedBatch('');
    setBatchBags([]);
    setFifoViolation(null);
    setIsFifoOverridden(false);
    setError('');

    if (!pid) return;
    setLoading(true);
    try {
      // First try to auto-load the FIFO head bag
      const fifoHead = await api.fifoBag(pid, stage);
      setBag(fifoHead);
      setSelectedBatch(fifoHead.batch_no);
      // Also load all bags for this batch
      const bList = await api.bagsForBatch(fifoHead.batch_no);
      setBatchBags(bList);
    } catch (err) {
      // If no bag ready, load list of bags for part to select
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function selectBatch(batchNo) {
    setSelectedBatch(batchNo);
    setBag(null);
    setFifoViolation(null);
    setIsFifoOverridden(false);
    if (!batchNo) return;
    setLoading(true);
    try {
      const bList = await api.bagsForBatch(batchNo);
      setBatchBags(bList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectSpecificBag(selectedBag) {
    if (!selectedBag) return;
    loadBagByCode(selectedBag.bag_code);
  }

  function refetch() {
    if (bag?.bag_code) {
      loadBagByCode(bag.bag_code);
    } else if (partId) {
      selectPart(partId);
    }
  }

  function clearBag() {
    setBag(null);
    setScanInput('');
    setFifoViolation(null);
    setIsFifoOverridden(false);
    setFifoOverrideReason('');
    setError('');
  }

  return {
    parts,
    partId,
    bag,
    setBag,
    method,
    setMethod,
    scanInput,
    setScanInput,
    handleScanSubmit,
    batches,
    selectedBatch,
    batchBags,
    selectPart,
    selectBatch,
    selectSpecificBag,
    fifoViolation,
    setFifoViolation,
    fifoOverrideReason,
    setFifoOverrideReason,
    isFifoOverridden,
    setIsFifoOverridden,
    error,
    setError,
    success,
    setSuccess,
    loading,
    refetch,
    clearBag,
  };
}
