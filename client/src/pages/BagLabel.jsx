import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../api';

export default function BagLabel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bag, setBag] = useState(null);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    api.bagDetail(id).then(setBag).catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (bag && canvasRef.current) {
      const qrPayload = JSON.stringify({
        shrp_part_code: bag.shrp_part_code || bag.part_code,
        cust_part_no: bag.customer_part_no || bag.part_code,
        batch_no: bag.batch_no,
        bag_code: bag.bag_code,
        prod_date: bag.entry_date,
        shift: bag.shift,
        qty: bag.qty,
        weight_kg: Number(bag.base_weight_kg),
        machine: bag.machine_code,
      });

      QRCode.toCanvas(canvasRef.current, qrPayload, {
        width: 80,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
    }
  }, [bag]);

  if (error) return <div className="screen"><div className="error-banner">{error}</div></div>;
  if (!bag) return <div className="screen"><p className="muted">Loading…</p></div>;

  return (
    <div className="screen">
      <button className="btn btn-secondary" style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="label-print-area">
        <div className="label-shrp-code">{bag.shrp_part_code || bag.part_code}</div>
        <div className="label-part-name">{bag.part_name}</div>

        <div className="label-content-grid">
          <div className="label-details">
            <div>Bag Wt: <strong>{Number(bag.base_weight_kg).toFixed(3)} Kg</strong></div>
            <div>Aprox Qty: <strong>{bag.qty > 0 ? `${bag.qty} Nos` : '-'}</strong></div>
            <div>Prod Date: <strong>{new Date(bag.entry_date).toLocaleDateString('en-GB')}</strong></div>
            <div>Shift: <strong>{bag.shift}</strong> · M/C: <strong>{bag.machine_code}</strong></div>
            <div>Batch: <strong>{bag.batch_no}</strong></div>
            <div>Bag: <strong>{bag.bag_code}</strong></div>
          </div>

          <div className="label-qr-container">
            <canvas ref={canvasRef} className="label-qr-canvas" />
          </div>
        </div>

        <div className="label-footer">SRI HARI RUBBER PRODUCTS</div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.print()}>
        Print label (3" × 2" Thermal)
      </button>
    </div>
  );
}

