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

  const loadParts = useCallback(() => {
    api.stageParts(stage)
      .then((res) => {
        setParts(res || []);
      })
      .catch(() => {
        api.parts().then((res) => setParts(res || [])).catch(() => {});
      });
  }, [stage]);

  useEffect(() => {
    loadParts();
  }, [loadParts]);

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
      setError(err.message || 'Bag not found or not eligible for this stage');
    } finally {
      setLoading(false);
    }
  }, [stage]);

  function handleScanSubmit(e) {
    if (e) e.preventDefault();
    if (!scanInput.trim()) return;
    loadBagByCode(scanInput.trim());
  }

  // Method A (Manual) Part Selection: fetches only eligible stage bags
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
      const eligibleBags = await api.bagsForPart(pid, stage);
      setBatchBags(eligibleBags || []);

      if (eligibleBags && eligibleBags.length > 0) {
        const oldest = eligibleBags[0];
        setBag(oldest);
        setSelectedBatch(oldest.batch_no);
      } else {
        setBag(null);
        setError(`No bag ready for ${stage === 'trim' ? 'trimming' : stage === 'inspect' ? 'inspection' : stage === 'pack' ? 'packing' : 'dispatch'} on this part.`);
      }
    } catch (err) {
      setBag(null);
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
      const bList = await api.bagsForBatch(batchNo, stage);
      setBatchBags(bList || []);
      if (bList && bList.length > 0) {
        setBag(bList[0]);
      }
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
    loadParts();
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
    loadBagByCode,
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
    loadParts,
  };
}

