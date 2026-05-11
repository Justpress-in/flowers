import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import './WhatsAppQR.css';

const WA_NUMBER = '919999999999'; // replace with real number
const WA_MESSAGE = encodeURIComponent('Hi! I\'d like to enquire about a party/event package.');
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;
// QR encodes the whatsapp link — using a public QR API
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(WA_LINK)}&color=128-0-0&bgcolor=ffffff&margin=8`;

export default function WhatsAppQR() {
  return (
    <div className="wa-section">
      <div className="wa-card">
        <div className="wa-icon-wrap">
          <MessageCircle size={32} strokeWidth={1.5} color="white" />
        </div>
        <div className="wa-text">
          <h3>Plan Your Event on WhatsApp</h3>
          <p>Scan the QR code or tap the button to chat with our events team instantly. We'll help you design the perfect experience.</p>
          <div className="wa-actions">
            <a href={WA_LINK} target="_blank" rel="noreferrer" className="wa-btn">
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
            <a href={`tel:+${WA_NUMBER}`} className="wa-call-btn">
              <Phone size={18} /> Call Us
            </a>
          </div>
        </div>
        <div className="wa-qr-wrap">
          <img src={QR_URL} alt="WhatsApp QR Code" className="wa-qr" />
          <p className="wa-qr-label">Scan to chat</p>
        </div>
      </div>
    </div>
  );
}
