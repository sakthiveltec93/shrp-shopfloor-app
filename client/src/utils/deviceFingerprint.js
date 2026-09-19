/**
 * Deterministic & Multi-Layer Persistent Device Fingerprinting
 * Ensures that a physical phone/computer produces the exact same Device ID
 * every time, even across browser restarts, incognito tabs, and cache clears.
 */
import safeStorage from './safeStorage';

function hashString(str) {
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & hash2) + (hash1 >>> 0)).toString(16);
}

function getCanvasFingerprint() {
  try {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial", sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('SHRP MES Shopfloor 🏢 ⚙️', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('SHRP MES Shopfloor 🏢 ⚙️', 4, 17);
    return canvas.toDataURL();
  } catch (e) {
    return '';
  }
}

function getWebGLFingerprint() {
  try {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}~${renderer}`;
  } catch (e) {
    return '';
  }
}

function getCookie(name) {
  try {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch (e) {
    return null;
  }
}

function setCookie(name, value) {
  try {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {}
}

export function generateDeterministicDeviceId() {
  if (typeof window === 'undefined') return 'unknown';

  // 1. Gather hardware & display metrics that do not change on the same physical phone
  const screenInfo = [
    window.screen?.width || 0,
    window.screen?.height || 0,
    window.screen?.colorDepth || 0,
    window.screen?.pixelDepth || 0,
    window.devicePixelRatio || 1,
  ].join('x');

  const nav = window.navigator || {};
  const hardware = [
    nav.hardwareConcurrency || 0,
    nav.maxTouchPoints || 0,
    nav.platform || '',
    nav.language || '',
    nav.languages ? nav.languages.join(',') : '',
  ].join(';');

  // Strip rapidly changing minor browser patch numbers while preserving OS model
  const rawUA = nav.userAgent || '';
  const stableUA = rawUA.replace(/Chrome\/[\d.]+/i, 'Chrome').replace(/Version\/[\d.]+/i, 'Version');

  let timeZone = '';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (e) {}

  const canvasFp = getCanvasFingerprint();
  const webglFp = getWebGLFingerprint();

  // Combine all stable hardware signals
  const compositeSeed = [
    screenInfo,
    hardware,
    stableUA,
    timeZone,
    canvasFp,
    webglFp
  ].join('|||');

  // Compute 4 separate hashes to form a deterministic 32-char UUID
  const h1 = hashString(compositeSeed + '_s1');
  const h2 = hashString(compositeSeed + '_s2');
  const h3 = hashString(compositeSeed + '_s3');
  const h4 = hashString(compositeSeed + '_s4');

  const rawHash = (h1 + h2 + h3 + h4).replace(/[^a-f0-9]/gi, '').toLowerCase().padEnd(32, '0').slice(0, 32);
  const deterministicUUID = `${rawHash.slice(0, 8)}-${rawHash.slice(8, 12)}-${rawHash.slice(12, 16)}-${rawHash.slice(16, 20)}-${rawHash.slice(20, 32)}`;
  return deterministicUUID;
}

export function getOrCreateDeviceId() {
  // Layer 1: Check safeStorage (localStorage / memory)
  let deviceId = safeStorage.getItem('shrp_device_id');
  if (deviceId && deviceId.length >= 10 && deviceId !== 'unknown') {
    setCookie('shrp_device_id', deviceId);
    return deviceId;
  }

  // Layer 2: Check persistent Cookie
  const cookieId = getCookie('shrp_device_id');
  if (cookieId && cookieId.length >= 10 && cookieId !== 'unknown') {
    safeStorage.setItem('shrp_device_id', cookieId);
    return cookieId;
  }

  // Layer 3: Deterministic Hardware / Browser Signature
  deviceId = generateDeterministicDeviceId();

  // Persist across both layers
  safeStorage.setItem('shrp_device_id', deviceId);
  setCookie('shrp_device_id', deviceId);

  return deviceId;
}

export default getOrCreateDeviceId;
