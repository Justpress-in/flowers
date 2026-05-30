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
  const [dragOver, setDragOver] = useState(false);

  const urls = String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  async function uploadFiles(files) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const resp = await uploadApi.multiple(files);
      const uploaded = Array.isArray(resp?.files) ? resp.files : [];
      const newUrls = uploaded.map((u) => u.url).filter(Boolean);
      if (newUrls.length === 0) throw new Error('Server returned no files');
      onChange([...urls, ...newUrls].join(', '));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[gallery upload] failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  function handlePick(e) {
    // Snapshot to a plain array BEFORE clearing the input — in some browsers
    // setting `.value = ''` invalidates the FileList we just captured, causing
    // an empty upload.
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length) uploadFiles(files);
  }

  function openPicker() {
    if (busy) return;
    inputRef.current?.click();
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (busy) return;
    const files = e.dataTransfer?.files;
    if (files && files.length) uploadFiles(files);
  }

  function removeAt(i) {
    const next = urls.filter((_, idx) => idx !== i);
    onChange(next.join(', '));
  }

  const dropZoneStyle = {
    border: `2px dashed ${dragOver ? '#c1440e' : '#d1d5db'}`,
    background: dragOver ? '#fdf0eb' : '#fafafa',
    borderRadius: 10,
    padding: '1rem',
    cursor: busy ? 'wait' : 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); } }}
        onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={dropZoneStyle}
      >
        {urls.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
                  onClick={(e) => { e.stopPropagation(); removeAt(i); }}
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
            <div
              style={{
                width: 80, height: 80, borderRadius: 8,
                background: '#fff', border: '1px dashed #d1d5db',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#6b7280', fontSize: '0.7rem', gap: 2,
              }}
            >
              {busy ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
              <span>Add more</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '1rem' }}>
            {busy ? <Loader2 size={22} className="spin" color="#c1440e" /> : <ImageIcon size={26} color="#9ca3af" />}
            <strong style={{ fontSize: '0.85rem', color: '#374151' }}>
              {busy ? 'Uploading…' : 'Click or drag images here'}
            </strong>
            <span style={{ fontSize: '0.72rem', color: '#888' }}>JPG, PNG, WEBP or GIF · up to 8 MB each</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={handlePick}
        disabled={busy}
      />
      {hint && <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 6 }}>{hint}</p>}
      {error && <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: 6 }}>{error}</p>}
    </div>
  );
}
