'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@dictionary.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) router.replace('/admin');
      })
      .catch(() => {});
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <div className="admin-brand" style={{ padding: 0, border: 0, marginBottom: 24 }}>
          <div className="admin-brand-mark">MG</div>
          <div>
            <div className="admin-brand-name">Massa Gizey Admin</div>
            <div className="admin-brand-sub">Sign in to manage content</div>
          </div>
        </div>
        {error ? (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: 10, borderRadius: 10, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        ) : null}
        <div className="admin-field" style={{ marginBottom: 12 }}>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" className="admin-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="admin-field" style={{ marginBottom: 20 }}>
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" className="admin-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p style={{ marginTop: 16, fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
          Default local login is <strong>admin@dictionary.com</strong> / <strong>admin123</strong>. Override with ADMIN_EMAIL and ADMIN_PASSWORD in production.
        </p>
      </form>
    </div>
  );
}
