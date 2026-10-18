'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconBook, IconTranslate, IconVideo, IconVolume, IconTrendingUp } from '../Icons';

function IconInbox({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: IconTrendingUp, match: (p) => p === '/admin' },
  { href: '/admin/dictionaries', label: 'Dictionaries', icon: IconBook, match: (p) => p.startsWith('/admin/dictionaries') },
  { href: '/admin/lexicons', label: 'Lexicons', icon: IconTranslate, match: (p) => p.startsWith('/admin/lexicons') },
  { href: '/admin/stories', label: 'Video stories', icon: IconVideo, match: (p) => p.startsWith('/admin/stories') },
  { href: '/admin/suggestions', label: 'Word suggestions', icon: IconInbox, match: (p) => p.startsWith('/admin/suggestions') },
  { href: '/admin/pronunciations', label: 'Pronunciations', icon: IconVolume, match: (p) => p.startsWith('/admin/pronunciations') }
];

export function AdminShell({ email, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const initial = (email || 'A').slice(0, 2).toUpperCase();

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark">MG</div>
          <div>
            <div className="admin-brand-name">Massa Gizey</div>
            <div className="admin-brand-sub">Admin</div>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${item.match(pathname) ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-user-chip">
            <div className="admin-avatar">{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="admin-user-name">Admin</div>
              <div className="admin-user-role" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
            </div>
          </div>
          <button type="button" className="admin-btn admin-btn-ghost" style={{ width: '100%', marginTop: 12 }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-mobilebar">
          <button type="button" className="admin-menu-btn" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>
            <span aria-hidden="true">☰</span>
            <span className="admin-mobilebar-label">Massa Gizey</span>
          </button>
        </div>
        {children}
      </div>
      {open ? <button type="button" className="admin-sidebar-scrim" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
    </div>
  );
}

export function AdminHeader({ title, subtitle, actions }) {
  return (
    <div className="admin-topbar">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        {subtitle ? <p className="admin-page-sub">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function AdminConfirmDialog({ confirm, onClose }) {
  const [busy, setBusy] = useState(false);
  if (!confirm) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await confirm.onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-overlay admin-confirm-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section className={`admin-confirm-dialog ${confirm.tone === 'positive' ? 'is-positive' : 'is-danger'}`} role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-description">
        <div className="admin-confirm-icon" aria-hidden="true">
          {confirm.tone === 'positive'
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2.8 19a1.4 1.4 0 0 0 1.2 2h16a1.4 1.4 0 0 0 1.2-2L12 3Z"/><path d="M12 9v4m0 3h.01"/></svg>}
        </div>
        <h2 id="admin-confirm-title">{confirm.title}</h2>
        <p id="admin-confirm-description">{confirm.message}</p>
        <div className="admin-confirm-actions">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className={`admin-btn ${confirm.tone === 'positive' ? 'admin-confirm-accept' : 'admin-btn-danger'}`} onClick={submit} disabled={busy}>
            {busy ? 'Working…' : (confirm.confirmLabel || 'Delete')}
          </button>
        </div>
      </section>
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const show = (msg, variant = 'success') => {
    clearTimeout(timer.current);
    setMessage(msg);
    setType(variant);
    timer.current = setTimeout(() => setMessage(''), 3200);
  };
  const node = message ? <div className={`admin-toast admin-toast-${type}`} role={type === 'error' ? 'alert' : 'status'}><span className="admin-toast-mark" aria-hidden="true">{type === 'error' ? '!' : type === 'warning' ? '!' : '✓'}</span><span>{message}</span></div> : null;
  return { show, node };
}
