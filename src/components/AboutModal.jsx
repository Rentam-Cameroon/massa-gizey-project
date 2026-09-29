import React from 'react';
import { IconX, IconBook, IconStackBooks, IconVideo } from './Icons';

export const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon-box" style={{ width: '28px', height: '28px', fontSize: '15px' }}>X</div>
            <h3 className="modal-title">About X Dictionary</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
          <p>
            <strong>Language, made navigable.</strong> X Dictionary brings trusted dictionaries, specialist lexicons, and video stories together so you can explore language with confidence.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '4px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ color: '#1362dc', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><IconBook size={20} /></div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>250k+ Words</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Authoritative entries</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ color: '#1362dc', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><IconStackBooks size={20} /></div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>6+ Lexicons</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Specialist fields</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ color: '#1362dc', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><IconVideo size={20} /></div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Video Stories</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Language in action</div>
            </div>
          </div>

          <p>
            Whether deciphering complex engineering acronyms, looking up poetic etymology, or watching how borrowed phrases migrated through history, X Dictionary gives you a straightforward path from a simple question to a meaningful understanding.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn-primary-action" onClick={onClose}>
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
