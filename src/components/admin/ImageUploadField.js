import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { upload as uploadApi } from '../../api/endpoints';

/**
 * Single-image picker that uploads via /api/upload and writes the resulting
 * URL back through onChange. No URL field exposed — admins pick a file.
 */
export function ImageUploadField({ value, onChange, label, hint, placeholderSize = 80 }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handlePick(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await uploadApi.single(file);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div
          style={{
            width: placeholderSize, height: placeholderSize,
            borderRadius: 8, overflow: 'hidden',
            background: '#f3f4f6', border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {value
            ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                   onError={(e) => { e.target.style.display = 'none'; }} />
            : <ImageIcon size={24} color="#9ca3af" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}
            {' '}{busy ? 'Uploading…' : (value ? 'Replace image' : 'Upload image')}
          </button>
          {value && (
            <button
              type="button"
              className="btn btn-ghost adm-del-btn"
              onClick={() => onChange('')}
              disabled={busy}
            >
              <X size={13} /> Remove
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePick}
            disabled={busy}
          />
        </div>
      </div>
      {hint && <p style={{ fontSize: '0.75rem', color: '#888' }}>{hint}</p>}
      {error && <p style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{error}</p>}
    </div>
  );
}

/**
 * Multi-image picker. Value is a comma-separated string (matches the existing
 * 'csv' field convention so backends storing arrays still get them via the
 * CrudTab transform). Use onChange to update the parent state.
 */
export function ImagesUploadField({ value, onChange, label, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const urls = String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  async function handlePick(e) {
    const files = e.target.files;
    e.target.value = '';
    if (!files || files.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const { files: uploaded } = await uploadApi.multiple(files);
      const newUrls = uploaded.map((u) => u.url);
      onChange([...urls, ...newUrls].join(', '));
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  function removeAt(i) {
    const next = urls.filter((_, idx) => idx !== i);
    onChange(next.join(', '));
  }

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {urls.map((u, i) => (
          <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
            <img
              src={u}
              alt={`upload ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(220,38,38,0.9)', color: 'white',
                border: 'none', borderRadius: '50%',
                width: 20, height: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Remove"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        {urls.length === 0 && (
          <div
            style={{
              width: 80, height: 80, borderRadius: 8,
              background: '#f3f4f6', border: '1px dashed #d1d5db',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ImageIcon size={24} color="#9ca3af" />
          </div>
        )}
      </div>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}
        {' '}{busy ? 'Uploading…' : 'Upload images'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handlePick}
        disabled={busy}
      />
      {hint && <p style={{ fontSize: '0.75rem', color: '#888' }}>{hint}</p>}
      {error && <p style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{error}</p>}
    </div>
  );
}
