'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '../../../components/admin/AdminShell';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error || 'Failed to load overview');
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  const stats = data ? [
    { label: 'Massa words', value: data.massaWords, color: '#eff6ff', fg: '#1d4ed8', href: '/admin/dictionaries', hint: 'Dictionary entries' },
    { label: 'Gizey words', value: data.gizeyWords, color: '#ecfdf3', fg: '#15803d', href: '/admin/dictionaries', hint: 'Dictionary entries' },
    { label: 'Lexicon pairs', value: data.totals.lexicon, color: '#f5f3ff', fg: '#6d28d9', href: '/admin/lexicons', hint: 'French bilingual pairs' },
    { label: 'Video stories', value: data.stories, color: '#fff7ed', fg: '#c2410c', href: '/admin/stories', hint: data.seedStories ? `${data.seedStories} dummy until a real story is added` : 'Published stories' },
    { label: 'Word suggestions', value: data.pendingSuggestions, color: '#fffbeb', fg: '#b45309', href: '/admin/suggestions', hint: 'Awaiting accept or reject' },
    { label: 'Pronunciation reviews', value: data.pendingPronunciations, color: '#eef2ff', fg: '#4338ca', href: '/admin/pronunciations', hint: 'Listen, then accept or reject' }
  ] : [];

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Review language data, contributions, and published stories" />
      <div className="admin-content">
        {error ? <div className="admin-empty">{error}</div> : null}
        {!data && !error ? <div className="admin-empty">Loading overview…</div> : null}
        {data ? (
          <>
            <div className="admin-stats">
              {stats.slice(0, 4).map((s) => (
                <Link key={s.label} href={s.href} className="admin-stat">
                  <div className="admin-stat-icon" style={{ background: s.color, color: s.fg }}>◆</div>
                  <div className="admin-stat-label">{s.label}</div>
                  <div className="admin-stat-value">{Number(s.value).toLocaleString()}</div>
                  {s.hint ? <div className="admin-stat-hint">{s.hint}</div> : null}
                </Link>
              ))}
            </div>
            <div className="admin-stats">
              {stats.slice(4).map((s) => (
                <Link key={s.label} href={s.href} className="admin-stat">
                  <div className="admin-stat-icon" style={{ background: s.color, color: s.fg }}>◆</div>
                  <div className="admin-stat-label">{s.label}</div>
                  <div className="admin-stat-value">{Number(s.value).toLocaleString()}</div>
                  {s.hint ? <div className="admin-stat-hint">{s.hint}</div> : null}
                </Link>
              ))}
              <div className="admin-stat">
                <div className="admin-stat-label">Massa lexicon</div>
                <div className="admin-stat-value">{Number(data.massaLex).toLocaleString()}</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-label">Gizey lexicon</div>
                <div className="admin-stat-value">{Number(data.gizeyLex).toLocaleString()}</div>
              </div>
            </div>
            <div className="admin-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>What to review</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
                Word suggestions and pronunciation recordings stay pending until you accept them into the matching Massa or Gizey table. Rejected items are deleted. Dummy video stories stay visible until you publish the first real story.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link className="admin-btn admin-btn-primary" href="/admin/suggestions">Review suggestions</Link>
                <Link className="admin-btn admin-btn-ghost" href="/admin/pronunciations">Listen to pronunciations</Link>
                <Link className="admin-btn admin-btn-ghost" href="/admin/stories">Manage stories</Link>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
