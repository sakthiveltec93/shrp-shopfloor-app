import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../api';

export default function BagLabel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bag, setBag] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canvasRef = useRef(null);

  // LAN / Network Thermal Printer settings
  const [printerIp, setPrinterIp] = useState(() => localStorage.getItem('shrp_lan_printer_ip') || '');
  const [printerPort, setPrinterPort] = useState(() => localStorage.getItem('shrp_lan_printer_port') || '9100');
  const [sendingLan, setSendingLan] = useState(false);
  const [copiedZpl, setCopiedZpl] = useState(false);

  useEffect(() => {
    api.bagDetail(id).then(setBag).catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (bag && canvasRef.current) {
      const qrPayload = JSON.stringify({
        shrp_code: bag.shrp_part_code || bag.part_code,
        cust_part: bag.customer_part_no || bag.part_code,
        batch_no: bag.batch_no,
        bag_code: bag.bag_code,
        qty: bag.qty,
        weight_kg: Number(bag.base_weight_kg),
        date: bag.entry_date,
        shift: bag.shift,
        machine: bag.machine_code,
      });

      QRCode.toCanvas(canvasRef.current, qrPayload, {
        width: 68,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [bag]);

  async function handleLanPrint(e) {
    if (e) e.preventDefault();
    if (!printerIp.trim()) {
      setError('Please enter the LAN Thermal Printer IP address (e.g. 192.168.1.100)');
      return;
    }
    setError('');
    setSuccess('');
    setSendingLan(true);

    localStorage.setItem('shrp_lan_printer_ip', printerIp.trim());
    localStorage.setItem('shrp_lan_printer_port', printerPort.trim() || '9100');

    try {
      const res = await api.lanPrintBag(id, {
        printer_ip: printerIp.trim(),
        printer_port: parseInt(printerPort, 10) || 9100,
      });
      setSuccess(res.message || 'Label sent directly to WiFi/LAN thermal printer!');
    } catch (err) {
      setError(err.message || 'Failed to send label to network printer');
    } finally {
      setSendingLan(false);
    }
  }

  function handleCopyZpl() {
    if (!bag) return;
    const shrpCode = bag.shrp_part_code || bag.part_code || 'PART';
    const custPart = bag.customer_part_no || bag.part_code || '—';
    const partName = (bag.part_name || '').slice(0, 30);
    const prodDate = new Date(bag.entry_date).toLocaleDateString('en-GB');

    const qrPayload = JSON.stringify({
      shrp_code: shrpCode,
      bag_code: bag.bag_code,
      batch_no: bag.batch_no,
      qty: bag.qty,
      weight_kg: Number(bag.base_weight_kg),
      date: bag.entry_date,
      shift: bag.shift,
      machine: bag.machine_code,
    });

    const zpl = `^XA
^PW609
^LL406
^LH0,0
^FO20,15^A0N,22,22^FDSRI HARI RUBBER PRODUCTS^FS
^FO440,15^A0N,20,20^FD[PART BAG]^FS
^FO20,38^GB570,2,2^FS
^FO20,48^A0N,32,32^FD${shrpCode}^FS
^FO20,84^A0N,20,20^FD${partName} | Cust: ${custPart}^FS
^FO20,108^GB570,1,1^FS
^FO20,118^A0N,24,24^FDBag No:  ${bag.bag_code}^FS
^FO20,148^A0N,22,22^FDBatch:   ${bag.batch_no}^FS
^FO20,178^A0N,24,24^FDQty:     ${bag.qty} Nos  Wt: ${Number(bag.base_weight_kg).toFixed(3)} Kg^FS
^FO20,208^A0N,20,20^FDDate:    ${prodDate}  Shift: ${bag.shift}^FS
^FO20,232^A0N,20,20^FDMachine: ${bag.machine_code}^FS
^FO410,118^BQN,2,4^FDQA,${qrPayload}^FS
^FO400,248^A0N,18,18^FD${bag.bag_code}^FS
^FO20,270^GB570,2,2^FS
^FO20,282^A0N,18,18^FDSHRP MES - IATF 16949 TRACEABILITY LABEL^FS
^XZ`;

    navigator.clipboard.writeText(zpl).then(() => {
      setCopiedZpl(true);
      setTimeout(() => setCopiedZpl(false), 2500);
    });
  }

  if (error && !bag) return <div className="screen"><div className="error-banner">{error}</div></div>;
  if (!bag) return <div className="screen"><p className="muted">Loading bag label…</p></div>;

  const shrpCode = bag.shrp_part_code || bag.part_code || 'PART';
  const custPartNo = bag.customer_part_no || bag.part_code || '—';

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="badge" style={{ fontSize: 12 }}>3" × 2" (76.2 × 50.8 mm) Thermal Label</span>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 14 }}>{error}</div>}
      {success && <div className="success-banner" style={{ marginBottom: 14 }}>{success}</div>}

      {/* 3" x 2" Industrial Label Preview */}
      <div style={{ background: '#f8fafc', padding: '20px 10px', borderRadius: 8, marginBottom: 20, textAlign: 'center' }}>
        <div className="label-print-area">
          {/* Header Row */}
          <div className="label-header-row">
            <span className="label-company-name">SRI HARI RUBBER PRODUCTS</span>
            <span className="label-badge-type">{bag.bag_type || 'PART'}</span>
          </div>

          {/* Part Identifiers */}
          <div className="label-shrp-code">{shrpCode}</div>
          <div className="label-part-name">{bag.part_name} · Cust P/N: {custPartNo}</div>

          {/* Core Traceability Grid */}
          <div className="label-content-grid">
            <div className="label-details">
              <div>Bag No: <strong>{bag.bag_code}</strong></div>
              <div>Batch: <strong>{bag.batch_no}</strong></div>
              <div>Weight: <strong>{Number(bag.base_weight_kg).toFixed(3)} Kg</strong></div>
              <div>Qty: <strong>{bag.qty > 0 ? `${bag.qty} Nos` : '—'}</strong></div>
              <div>Date: <strong>{new Date(bag.entry_date).toLocaleDateString('en-GB')}</strong> · Shift: <strong>{bag.shift}</strong></div>
              <div>M/C: <strong>{bag.machine_code}</strong> · Status: <strong>{bag.status}</strong></div>
            </div>

            <div className="label-qr-container">
              <canvas ref={canvasRef} className="label-qr-canvas" />
              <div className="label-qr-subtext">{bag.bag_code}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="label-footer">
            <span>IATF 16949 TRACEABILITY</span>
            <span>SHRP MES #{bag.id}</span>
          </div>
        </div>
      </div>

      {/* Printing Action Tabs */}
      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--amber)' }}>
          🖨️ Label Printing Options (3" × 2")
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Option 1: Native System / WiFi Print */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 14, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={() => window.print()}
          >
            🖨️ Print Label (WiFi / System Printer)
          </button>

          {/* Option 2: Direct LAN Socket Printing (TCP 9100) */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
              📡 Direct LAN / WiFi Thermal Printer (Zebra / TSC / TVS / Godex)
            </div>
            <form onSubmit={handleLanPrint} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Printer IP (e.g. 192.168.1.100)"
                value={printerIp}
                onChange={(e) => setPrinterIp(e.target.value)}
                style={{ flex: '2 1 180px', padding: '8px 12px', fontSize: 13 }}
              />
              <input
                type="number"
                placeholder="Port (9100)"
                value={printerPort}
                onChange={(e) => setPrinterPort(e.target.value)}
                style={{ flex: '1 1 80px', padding: '8px 12px', fontSize: 13 }}
              />
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={sendingLan}
                style={{ width: 'auto', padding: '8px 16px', fontSize: 13, whiteSpace: 'nowrap' }}
              >
                {sendingLan ? 'Sending…' : 'Send to LAN Printer'}
              </button>
            </form>
          </div>

          {/* Option 3: Copy Raw ZPL */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
              onClick={handleCopyZpl}
            >
              {copiedZpl ? '✓ ZPL Copied to Clipboard' : '📋 Copy Raw ZPL Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

