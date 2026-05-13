import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';

/**
 * Generic admin tab with list + modal form + create/update/delete.
 *
 * Props:
 *  - title            page title
 *  - api              { list, create, update, remove } where update takes (id, body) and remove takes id
 *  - emptyForm        initial state for the form (object)
 *  - columns          [{ key, label, render? }]
 *  - fields           [{ name, label, type: 'text'|'textarea'|'number'|'select'|'checkbox'|'date'|'csv'|'image', options?, required?, placeholder?, hint? }]
 *  - getId            (row) => unique id (defaults to row.id)
 *  - onLoaded         optional callback after list loads
 */
export default function CrudTab({
  title,
  api,
  emptyForm,
  columns,
  fields,
  getId = (r) => r.id,
  searchKeys = [],
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const list = await api.list();
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function openAdd() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
  }
  function openEdit(row) {
    const populated = { ...emptyForm };
    for (const f of fields) {
      if (f.type === 'csv') {
        populated[f.name] = Array.isArray(row[f.name]) ? row[f.name].join(', ') : (row[f.name] || '');
      } else if (f.type === 'date') {
        populated[f.name] = row[f.name] ? new Date(row[f.name]).toISOString().slice(0, 10) : '';
      } else if (f.type === 'datetime') {
        populated[f.name] = row[f.name] ? new Date(row[f.name]).toISOString().slice(0, 16) : '';
      } else {
        populated[f.name] = row[f.name] ?? populated[f.name] ?? '';
      }
    }
    setForm(populated);
    setEditingId(getId(row));
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = {};
      for (const f of fields) {
        const v = form[f.name];
        if (f.type === 'csv') {
          payload[f.name] = String(v || '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean);
        } else if (f.type === 'number') {
          payload[f.name] = v === '' ? 0 : Number(v);
        } else if (f.type === 'date' || f.type === 'datetime') {
          payload[f.name] = v ? new Date(v).toISOString() : null;
        } else {
          payload[f.name] = v;
        }
      }
      if (editingId) {
        const updated = await api.update(editingId, payload);
        setItems((prev) => prev.map((r) => (getId(r) === editingId ? updated : r)));
      } else {
        const created = await api.create(payload);
        setItems((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(row) {
    if (!window.confirm('Delete this item?')) return;
    setBusy(true);
    try {
      await api.remove(getId(row));
      setItems((prev) => prev.filter((r) => getId(r) !== getId(row)));
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  const filtered = query && searchKeys.length
    ? items.filter((r) =>
        searchKeys.some((k) => String(r[k] || '').toLowerCase().includes(query.toLowerCase()))
      )
    : items;

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>{title} <span className="adm-count-badge">{items.length}</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {searchKeys.length > 0 && (
            <input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ padding: '0.45rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 7, fontSize: '0.85rem' }}
            />
          )}
          <button className="btn btn-primary" onClick={openAdd} disabled={busy}>
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {error && (
        <div className="adm-alert" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="adm-empty-lg"><Loader2 className="spin" size={16} /> Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty-lg">Nothing here yet.</div>
      ) : (
        <div className="adm-table">
          <div className="adm-table-head" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) auto` }}>
            {columns.map((c) => <span key={c.key}>{c.label}</span>)}
            <span>Actions</span>
          </div>
          {filtered.map((row) => (
            <div
              key={getId(row)}
              className="adm-table-row"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) auto` }}
            >
              {columns.map((c) => (
                <span key={c.key}>
                  {c.render ? c.render(row) : (row[c.key] ?? '—').toString()}
                </span>
              ))}
              <div className="adm-row-actions">
                <button className="btn btn-ghost" onClick={() => openEdit(row)}><Pencil size={13} /></button>
                <button className="btn btn-ghost adm-del-btn" onClick={() => handleDelete(row)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? `Edit ${title}` : `Add ${title}`}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              {fields.map((f) => {
                const val = form[f.name] ?? '';
                if (f.type === 'textarea') {
                  return (
                    <div key={f.name} className="form-group">
                      <label>{f.label}{f.required ? ' *' : ''}</label>
                      <textarea
                        name={f.name}
                        rows={f.rows || 3}
                        value={val}
                        onChange={handleChange}
                        placeholder={f.placeholder || ''}
                        required={f.required}
                      />
                      {f.hint && <p style={{ fontSize: '0.75rem', color: '#888' }}>{f.hint}</p>}
                    </div>
                  );
                }
                if (f.type === 'select') {
                  return (
                    <div key={f.name} className="form-group">
                      <label>{f.label}{f.required ? ' *' : ''}</label>
                      <select name={f.name} value={val} onChange={handleChange} required={f.required}>
                        {!f.required && <option value="">—</option>}
                        {(f.options || []).map((o) => (
                          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (f.type === 'checkbox') {
                  return (
                    <div key={f.name} className="form-group form-check">
                      <label>
                        <input type="checkbox" name={f.name} checked={!!val} onChange={handleChange} />
                        {' '}{f.label}
                      </label>
                    </div>
                  );
                }
                return (
                  <div key={f.name} className="form-group">
                    <label>{f.label}{f.required ? ' *' : ''}</label>
                    <input
                      name={f.name}
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'datetime' ? 'datetime-local' : 'text'}
                      value={val}
                      onChange={handleChange}
                      placeholder={f.placeholder || ''}
                      required={f.required}
                      min={f.min}
                      max={f.max}
                      step={f.step}
                    />
                    {f.hint && <p style={{ fontSize: '0.75rem', color: '#888' }}>{f.hint}</p>}
                  </div>
                );
              })}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : (editingId ? 'Save Changes' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
