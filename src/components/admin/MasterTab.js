import React, { useState } from 'react';
import {
  Database, Tag, Leaf, ClipboardList, Gift, CalendarCheck2, Briefcase,
  Star, PartyPopper, Ticket, Globe, MapPin,
} from 'lucide-react';
import CrudTab from './CrudTab';
import { master as masterApi, cities as citiesApi } from '../../api/endpoints';
import { invalidateMaster } from '../../api/useMaster';

/**
 * Master / basic-data section. Every admin-managed lookup list lives here:
 * product categories, the various status workflows, service & event types,
 * countries and cities. Most subtabs are backed by the generic Master model;
 * Cities reuses the existing City model so the homepage keeps working.
 */

const SUBTABS = [
  // Catalog
  { id: 'product-category', label: 'Product Categories', Icon: Tag, variant: 'icon', singular: 'Category' },
  { id: 'product-type', label: 'Product Types', Icon: Leaf, variant: 'basic', singular: 'Product Type' },
  { id: 'country', label: 'Countries', Icon: Globe, variant: 'icon', singular: 'Country' },
  { id: 'city', label: 'Cities', Icon: MapPin, variant: 'city', singular: 'City' },
  // Statuses
  { id: 'order-status', label: 'Order Status', Icon: ClipboardList, variant: 'status', singular: 'Order Status' },
  { id: 'booking-status', label: 'Booking Status', Icon: CalendarCheck2, variant: 'status', singular: 'Booking Status' },
  { id: 'review-status', label: 'Review Status', Icon: Star, variant: 'status', singular: 'Review Status' },
  { id: 'event-status', label: 'Event Status', Icon: PartyPopper, variant: 'status', singular: 'Event Status' },
  // Types
  { id: 'order-type', label: 'Order Types', Icon: Gift, variant: 'basic', singular: 'Order Type' },
  { id: 'booking-service-type', label: 'Service Types', Icon: Briefcase, variant: 'basic', singular: 'Service Type' },
  { id: 'event-package-type', label: 'Event / Package Types', Icon: PartyPopper, variant: 'basic', singular: 'Event Type' },
  { id: 'coupon-type', label: 'Coupon Types', Icon: Ticket, variant: 'basic', singular: 'Coupon Type' },
];

export default function MasterTab() {
  const [sub, setSub] = useState(SUBTABS[0].id);
  const active = SUBTABS.find((s) => s.id === sub) || SUBTABS[0];

  return (
    <div className="adm-section">
      <div className="adm-section-header" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Database size={18} /> Master Data
        </h2>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {SUBTABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setSub(id)}
              className={`btn ${sub === id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.82rem' }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.8rem' }}>
        These lists drive dropdowns and badges across the storefront and admin. Built-in values
        can be relabelled or hidden (uncheck Active) but not deleted. Edits apply everywhere.
      </p>

      {active.variant === 'city'
        ? <CityTab />
        : <GroupTab key={active.id} group={active.id} singular={active.singular} variant={active.variant} />}
    </div>
  );
}

const isUrl = (s) => /^https?:\/\//i.test(String(s || ''));

function IconCell({ row }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {row.icon
        ? (isUrl(row.icon)
            ? <img src={row.icon} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            : <span style={{ fontSize: '1.15rem' }}>{row.icon}</span>)
        : null}
      <strong>{row.label}</strong>
    </div>
  );
}

function StatusCell({ row }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 12, height: 12, borderRadius: '50%',
        background: row.color || '#cbd5e1', border: '1px solid rgba(0,0,0,0.1)',
      }} />
      <strong>{row.label}</strong>
    </span>
  );
}

function commonTailColumns() {
  return [
    { key: 'slug', label: 'Value', render: (r) => <code style={{ fontSize: '0.72rem', color: '#888' }}>{r.slug}</code> },
    { key: 'order', label: 'Order' },
    { key: 'isDefault', label: 'Default', render: (r) => r.isDefault ? <span className="badge badge-green">default</span> : '—' },
    { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">live</span> : <span className="badge badge-red">off</span> },
  ];
}

/* ── Generic Master group (everything except Cities) ───────────── */
function GroupTab({ group, singular, variant }) {
  const base = masterApi.forGroup(group);
  // Wrap mutations so other mounted dropdowns refresh from the shared cache.
  const api = {
    list: base.list,
    create: async (b) => { const r = await base.create(b); invalidateMaster(); return r; },
    update: async (id, b) => { const r = await base.update(id, b); invalidateMaster(); return r; },
    remove: async (id) => { const r = await base.remove(id); invalidateMaster(); return r; },
  };

  if (variant === 'status') {
    return (
      <CrudTab
        title={singular}
        api={api}
        searchKeys={['label', 'slug']}
        emptyForm={{ label: '', color: '#2563eb', order: 0, isDefault: false, active: true }}
        columns={[
          { key: 'label', label: 'Status', render: (r) => <StatusCell row={r} /> },
          ...commonTailColumns(),
        ]}
        fields={[
          { name: 'label', label: 'Label', required: true, placeholder: 'e.g. Out for Delivery' },
          { name: 'color', label: 'Badge Colour', placeholder: '#2563eb', hint: 'CSS colour used for the status badge' },
          { name: 'order', label: 'Display Order', type: 'number' },
          { name: 'isDefault', label: 'Default for new records', type: 'checkbox' },
          { name: 'active', label: 'Active', type: 'checkbox' },
        ]}
      />
    );
  }

  if (variant === 'icon') {
    return (
      <CrudTab
        title={singular}
        api={api}
        searchKeys={['label', 'slug']}
        emptyForm={{ label: '', icon: '', description: '', order: 0, isDefault: false, active: true }}
        columns={[
          { key: 'label', label: 'Name', render: (r) => <IconCell row={r} /> },
          ...commonTailColumns(),
        ]}
        fields={[
          { name: 'label', label: 'Name', required: true, placeholder: 'e.g. Flowers' },
          { name: 'icon', label: 'Icon', placeholder: '🌸 or https://…', hint: 'Emoji or image URL' },
          { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
          { name: 'order', label: 'Display Order', type: 'number' },
          { name: 'isDefault', label: 'Default', type: 'checkbox' },
          { name: 'active', label: 'Active', type: 'checkbox' },
        ]}
      />
    );
  }

  // basic
  return (
    <CrudTab
      title={singular}
      api={api}
      searchKeys={['label', 'slug']}
      emptyForm={{ label: '', description: '', order: 0, isDefault: false, active: true }}
      columns={[
        { key: 'label', label: 'Label', render: (r) => <strong>{r.label}</strong> },
        ...commonTailColumns(),
      ]}
      fields={[
        { name: 'label', label: 'Label', required: true, placeholder: 'e.g. Workshop' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { name: 'order', label: 'Display Order', type: 'number' },
        { name: 'isDefault', label: 'Default', type: 'checkbox' },
        { name: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}

/* ── Cities — reuses the existing City model so the homepage stays wired ── */
function CityTab() {
  return (
    <CrudTab
      title="City"
      api={citiesApi}
      searchKeys={['name']}
      emptyForm={{ name: '', icon: '', order: 0, active: true }}
      columns={[
        { key: 'name', label: 'Name', render: (r) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {r.icon && <img src={r.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />}
            <strong>{r.name}</strong>
          </div>
        ) },
        { key: 'order', label: 'Order' },
        { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">live</span> : <span className="badge badge-red">off</span> },
      ]}
      fields={[
        { name: 'name', label: 'City Name', required: true, placeholder: 'Riyadh' },
        { name: 'icon', label: 'Icon', type: 'image' },
        { name: 'order', label: 'Display Order', type: 'number' },
        { name: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}
