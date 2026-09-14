import { useEffect, useRef, useState } from 'react';

export default function CameraScanner({ onScan, onClose, title = 'Scan QR / Barcode' }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const [error, setError] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    let active = true;

    async function startCamera() {
      setError('');
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported on this device/browser');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Check torch support
        const track = stream.getVideoTracks()[0];
        const caps = track?.getCapabilities?.();
        if (caps && 'torch' in caps) {
          setHasTorch(true);
        }

        // Initialize Barcode Detection
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'data_matrix'],
          });

          async function detectFrame() {
            if (!active || !videoRef.current) return;
            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0 && barcodes[0].rawValue) {
                  triggerSuccess(barcodes[0].rawValue);
                  return;
                }
              } catch {
                // Ignore detection errors frame-by-frame
              }
            }
            animFrameRef.current = requestAnimationFrame(detectFrame);
          }
          animFrameRef.current = requestAnimationFrame(detectFrame);
        } else if (window.Html5Qrcode) {
          // Fallback to Html5Qrcode if native BarcodeDetector not available
          const qr = new window.Html5Qrcode('camera-scanner-viewport');
          qr.start(
            { facingMode },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              qr.stop().then(() => triggerSuccess(decodedText)).catch(() => triggerSuccess(decodedText));
            },
            () => {}
          ).catch((err) => setError(err.message || 'Camera start failed'));
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to access camera. Please allow camera permissions.');
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  function triggerSuccess(code) {
    if (navigator.vibrate) navigator.vibrate(100);
    onScan(code);
  }

  async function toggleTorch() {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch {
      /* ignore */
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (manualCode.trim()) {
      triggerSuccess(manualCode.trim());
    }
  }

  return (
    <div className="camera-modal-overlay">
      <div className="camera-modal-container">
        <div className="camera-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📷</span>
            <strong style={{ fontSize: 15, color: '#fff' }}>{title}</strong>
          </div>
          <button type="button" className="camera-btn-icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="camera-viewport-wrapper" id="camera-scanner-viewport">
          <video ref={videoRef} playsInline muted className="camera-video-element" />

          {/* Aim Reticle */}
          <div className="camera-scanner-reticle">
            <div className="scanner-reticle-corner corner-tl" />
            <div className="scanner-reticle-corner corner-tr" />
            <div className="scanner-reticle-corner corner-bl" />
            <div className="scanner-reticle-corner corner-br" />
            <div className="scanner-laser-line" />
          </div>

          <div className="camera-hint-text">
            Align 2D QR Code or Barcode within the frame
          </div>
        </div>

        {error && (
          <div style={{ padding: '8px 14px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: 12 }}>
            {error}
          </div>
        )}

        {/* Controls toolbar */}
        <div className="camera-modal-toolbar">
          {hasTorch && (
            <button
              type="button"
              className={`camera-btn-secondary ${torchOn ? 'active' : ''}`}
              onClick={toggleTorch}
            >
              {torchOn ? '🔦 Torch On' : '🔦 Torch Off'}
            </button>
          )}

          <button
            type="button"
            className="camera-btn-secondary"
            onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
          >
            🔄 Flip Camera
          </button>
        </div>

        {/* Manual Code Input Fallback */}
        <form onSubmit={handleManualSubmit} className="camera-manual-input-row">
          <input
            type="text"
            placeholder="Or type/paste Bag Code here..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 16px' }} disabled={!manualCode.trim()}>
            Load
          </button>
        </form>
      </div>
    </div>
  );
}
