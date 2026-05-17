// Print helpers — produce a self-contained printable window for orders,
// events and bookings. Shared chrome (header/footer/print trigger) lives in
// openPrintWindow; each helper just supplies the body markup.

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const PRINT_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; max-width: 720px; margin: 32px auto; padding: 0 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 24px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #c1440e; padding-bottom: 12px; }
  .brand { color: #c1440e; font-weight: 700; font-size: 18px; }
  .meta { font-size: 12px; color: #6b7280; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 6px 0; vertical-align: top; }
  td.label { width: 35%; color: #6b7280; }
  .product { display: flex; gap: 12px; align-items: flex-start; }
  .product img { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
  .total-row td { font-weight: 700; font-size: 15px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
  .total-row td:last-child { color: #c1440e; }
  .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
  @media print {
    body { margin: 0; }
    .no-print { display: none !important; }
  }
  .print-btn { background: #c1440e; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
`;

function openPrintWindow({ title, kicker, headingId, headingDate, bodyHtml }) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>${PRINT_STYLES}</style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 16px;">
    <button class="print-btn" onclick="window.print()">Print this page</button>
  </div>
  <div class="header">
    <div>
      <div class="brand">BloomNest</div>
      <div class="meta">${escapeHtml(kicker)}</div>
    </div>
    <div style="text-align: right;">
      <h1>${escapeHtml(headingId)}</h1>
      <div class="meta">${escapeHtml(headingDate)}</div>
    </div>
  </div>
  ${bodyHtml}
  <div class="footer">
    Generated ${escapeHtml(new Date().toLocaleString())} · BloomNest
  </div>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 300);
    });
  </script>
</body>
</html>`;
  const w = window.open('', '_blank', 'width=820,height=900');
  if (!w) {
    alert('Pop-up blocked. Please allow pop-ups to print.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export function printOrder(order) {
  if (!order) return;
  const dateStr = order.date ? new Date(order.date).toLocaleString() : '—';
  const rows = [
    ['Order ID', order.id],
    ['Date', dateStr],
    ['Type', order.type],
    ['Status', order.status],
  ];
  const gift = order.giftDetails;
  const bodyHtml = `
  <h2>Order</h2>
  <table>
    ${rows.map(([k, v]) => `<tr><td class="label">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('')}
    ${order.couponCode ? `<tr><td class="label">Coupon</td><td>${escapeHtml(order.couponCode)}</td></tr>` : ''}
    ${order.trackingUrl ? `<tr><td class="label">Tracking</td><td>${escapeHtml(order.trackingUrl)}</td></tr>` : ''}
  </table>

  <h2>Product</h2>
  <div class="product">
    ${order.productImage ? `<img src="${escapeHtml(order.productImage)}" alt="" />` : ''}
    <div>
      <div style="font-weight: 600; font-size: 14px;">${escapeHtml(order.productName)}</div>
      <div class="meta" style="margin-top: 4px;">Store: ${escapeHtml(order.storeName)}</div>
      <div class="meta">Qty: ${escapeHtml(order.quantity)}${order.color ? ` · ${escapeHtml(order.color)}` : ''}${order.size ? ` · ${escapeHtml(order.size)}` : ''}</div>
      ${order.customDescription ? `<div class="meta" style="margin-top: 6px;">Custom: ${escapeHtml(order.customDescription)}</div>` : ''}
    </div>
  </div>

  <h2>Customer</h2>
  <table>
    <tr><td class="label">Name</td><td>${escapeHtml(order.customerName || '—')}</td></tr>
    <tr><td class="label">Phone</td><td>${escapeHtml(order.customerPhone || '—')}</td></tr>
    <tr><td class="label">Email</td><td>${escapeHtml(order.customerEmail || '—')}</td></tr>
    ${order.customerAddress ? `<tr><td class="label">Address</td><td>${escapeHtml(order.customerAddress)}</td></tr>` : ''}
  </table>

  ${gift ? `
  <h2>Gift Recipient</h2>
  <table>
    <tr><td class="label">Name</td><td>${escapeHtml(gift.receiverName)}</td></tr>
    <tr><td class="label">Phone</td><td>${escapeHtml(gift.receiverPhone)}</td></tr>
    <tr><td class="label">Address</td><td>${escapeHtml(gift.receiverAddress)}</td></tr>
    ${gift.giftMessage ? `<tr><td class="label">Message</td><td><em>"${escapeHtml(gift.giftMessage)}"</em></td></tr>` : ''}
  </table>
  ` : ''}

  <h2>Pricing</h2>
  <table>
    <tr><td class="label">Unit price</td><td>${money(order.unitPrice)}</td></tr>
    ${order.basePrice > 0 ? `<tr><td class="label">Base / MRP</td><td>${money(order.basePrice)}</td></tr>` : ''}
    ${order.discount > 0 ? `<tr><td class="label">Discount</td><td>-${money(order.discount)}</td></tr>` : ''}
    <tr class="total-row"><td>Total</td><td>${money(order.price)}</td></tr>
  </table>`;
  openPrintWindow({
    title: `Order ${order.id}`,
    kicker: 'Order receipt',
    headingId: order.id,
    headingDate: dateStr,
    bodyHtml,
  });
}

export function printEvent(ev) {
  if (!ev) return;
  const dateStr = ev.date
    ? new Date(ev.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const bodyHtml = `
  <h2>Event</h2>
  <table>
    <tr><td class="label">Name</td><td>${escapeHtml(ev.name || '—')}</td></tr>
    <tr><td class="label">Type</td><td>${escapeHtml(ev.packageType || '—')}</td></tr>
    <tr><td class="label">Status</td><td>${escapeHtml(ev.status || '—')}</td></tr>
    <tr><td class="label">Date</td><td>${escapeHtml(dateStr)}</td></tr>
    <tr><td class="label">Venue</td><td>${escapeHtml(ev.venue || '—')}</td></tr>
    ${ev.capacity > 0 ? `<tr><td class="label">Capacity</td><td>${escapeHtml(ev.capacity)} guests</td></tr>` : ''}
    ${ev.price > 0 ? `<tr><td class="label">Package Price</td><td>${money(ev.price)}</td></tr>` : ''}
  </table>

  ${ev.description ? `
  <h2>Requirements</h2>
  <p style="font-size: 13px; line-height: 1.5;">${escapeHtml(ev.description)}</p>
  ` : ''}

  <h2>Contact</h2>
  <table>
    <tr><td class="label">Name</td><td>${escapeHtml(ev.contactName || '—')}</td></tr>
    <tr><td class="label">Phone</td><td>${escapeHtml(ev.contactPhone || '—')}</td></tr>
  </table>`;
  openPrintWindow({
    title: `Event ${ev.name || ev.id}`,
    kicker: 'Event booking',
    headingId: ev.name || ev.id,
    headingDate: dateStr,
    bodyHtml,
  });
}

export function printProduct(p, stores = []) {
  if (!p) return;
  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const inventory = p.storeInventory || [];
  const totalStock = inventory.reduce((sum, s) => sum + (s.stock || 0), 0);
  const prices = inventory.map((s) => Number(s.price || 0)).filter((n) => n > 0);
  const priceRange = prices.length
    ? prices.length === 1
      ? money(prices[0])
      : `${money(Math.min(...prices))} – ${money(Math.max(...prices))}`
    : '—';

  const invRows = inventory.length
    ? inventory.map((si) => {
        const store = storeMap.get(si.storeId);
        const base = Number(si.basePrice || si.price || 0);
        const offered = Number(si.offeredPrice || si.price || 0);
        const pct = Number(si.discountPercent || 0);
        const priceCell = pct > 0
          ? `<span style="text-decoration: line-through; color: #999;">${money(base)}</span> <strong style="color: #c1440e;">${money(offered)}</strong> <span style="font-size: 11px; color: #c1440e;">(${pct}% off)</span>`
          : `<strong>${money(base)}</strong>`;
        return `<tr>
          <td>${escapeHtml(store?.name || si.storeId)}</td>
          <td>${money(si.stockPrice || 0)}</td>
          <td>${priceCell}</td>
          <td>${escapeHtml(si.stock || 0)}</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="4" style="text-align: center; color: #888;">No store inventory</td></tr>';

  const bodyHtml = `
  <div class="product" style="margin-top: 8px;">
    ${p.image ? `<img src="${escapeHtml(p.image)}" alt="" style="width: 120px; height: 120px;" />` : ''}
    <div>
      <div style="font-weight: 700; font-size: 16px;">${escapeHtml(p.name)}</div>
      <div class="meta" style="margin-top: 4px;">Category: ${escapeHtml(p.category)} · Type: ${escapeHtml(p.type)}</div>
      <div class="meta">Price range: <strong>${priceRange}</strong> · Total stock: <strong>${totalStock}</strong></div>
      ${p.tags && p.tags.length ? `<div class="meta" style="margin-top: 4px;">Tags: ${escapeHtml(p.tags.join(', '))}</div>` : ''}
    </div>
  </div>

  ${p.description ? `
  <h2>Description</h2>
  <p style="font-size: 13px; line-height: 1.5;">${escapeHtml(p.description)}</p>
  ` : ''}

  <h2>Attributes</h2>
  <table>
    <tr><td class="label">Product ID</td><td>${escapeHtml(p.id)}</td></tr>
    ${p.availableColors && p.availableColors.length ? `<tr><td class="label">Colours</td><td>${escapeHtml(p.availableColors.join(', '))}</td></tr>` : ''}
    ${p.sizes && p.sizes.length ? `<tr><td class="label">Sizes</td><td>${escapeHtml(p.sizes.join(', '))}</td></tr>` : ''}
    <tr><td class="label">Bespoke requests</td><td>${p.allowCustomDescription ? 'Allowed' : 'Disabled'}</td></tr>
  </table>

  <h2>Store Inventory (${inventory.length})</h2>
  <table>
    <thead>
      <tr style="border-bottom: 1px solid #e5e7eb; text-align: left;">
        <th style="padding: 6px 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Store</th>
        <th style="padding: 6px 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Cost</th>
        <th style="padding: 6px 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Selling price</th>
        <th style="padding: 6px 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Stock</th>
      </tr>
    </thead>
    <tbody>${invRows}</tbody>
  </table>`;

  openPrintWindow({
    title: `Product ${p.name}`,
    kicker: 'Product details',
    headingId: p.name,
    headingDate: priceRange,
    bodyHtml,
  });
}

export function printBooking(b) {
  if (!b) return;
  const dateStr = b.preferredDate
    ? new Date(b.preferredDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const bodyHtml = `
  <h2>Booking</h2>
  <table>
    <tr><td class="label">Booking ID</td><td>${escapeHtml(b.id)}</td></tr>
    <tr><td class="label">Service</td><td>${escapeHtml(b.serviceType || '—')}</td></tr>
    ${b.occasion ? `<tr><td class="label">Occasion</td><td>${escapeHtml(b.occasion)}</td></tr>` : ''}
    <tr><td class="label">Status</td><td>${escapeHtml(b.status || '—')}</td></tr>
    <tr><td class="label">Preferred Date</td><td>${escapeHtml(dateStr)}${b.preferredTime ? ` · ${escapeHtml(b.preferredTime)}` : ''}</td></tr>
    ${b.storeName ? `<tr><td class="label">Store</td><td>${escapeHtml(b.storeName)}</td></tr>` : ''}
    <tr><td class="label">Duration</td><td>${escapeHtml(b.durationMin || 30)} min</td></tr>
    ${b.basePrice > 0 ? `<tr><td class="label">Base Price</td><td>${money(b.basePrice)}</td></tr>` : ''}
  </table>

  <h2>Customer</h2>
  <table>
    <tr><td class="label">Name</td><td>${escapeHtml(b.customerName || '—')}</td></tr>
    <tr><td class="label">Phone</td><td>${escapeHtml(b.customerPhone || '—')}</td></tr>
    ${b.customerEmail ? `<tr><td class="label">Email</td><td>${escapeHtml(b.customerEmail)}</td></tr>` : ''}
    ${b.customerAddress ? `<tr><td class="label">Address</td><td>${escapeHtml(b.customerAddress)}</td></tr>` : ''}
  </table>

  ${(b.notes || b.adminNotes) ? `
  <h2>Notes</h2>
  ${b.notes ? `<p style="font-size: 13px; margin: 0 0 8px;"><strong>Customer:</strong> ${escapeHtml(b.notes)}</p>` : ''}
  ${b.adminNotes ? `<p style="font-size: 13px; margin: 0;"><strong>Admin:</strong> ${escapeHtml(b.adminNotes)}</p>` : ''}
  ` : ''}`;
  openPrintWindow({
    title: `Booking ${b.id}`,
    kicker: 'Consultation booking',
    headingId: b.id,
    headingDate: dateStr,
    bodyHtml,
  });
}
