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
      QRCode.toCanvas(canvasRef.current, bag.bag_code, { width: 110, margin: 1 });
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
        <div className="label-part-name">{bag.part_name}</div>

        <div className="label-row">
          <span>Bag Wt</span>
          <span>{Number(bag.base_weight_kg).toFixed(3)} Kg</span>
        </div>
        <div className="label-row">
          <span>Aprox Qty</span>
          <span>{bag.qty > 0 ? `${bag.qty} Nos` : '-'}</span>
        </div>
        <div className="label-row">
          <span>Prod Date</span>
          <span>{new Date(bag.entry_date).toLocaleDateString('en-GB')}</span>
        </div>
        <div className="label-row">
          <span>Batch No</span>
          <span>{bag.bag_code}</span>
        </div>

        <canvas ref={canvasRef} className="label-qr" />

        <div className="label-footer">SRI HARI RUBBER PRODUCTS</div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.print()}>
        Print label
      </button>
    </div>
  );
}
