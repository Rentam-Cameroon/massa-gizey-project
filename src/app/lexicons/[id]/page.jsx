'use client';

import React, { useState, useEffect, use } from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { IconSearch, IconInfo } from '../../../components/Icons';

export default function LexiconDetailPage({ params }) {
  const resolvedParams = use(params);
  const rawId = (resolvedParams.id || 'massa').toLowerCase();
  // Valid lexicons are French - Massa and French - Gizey
  const lexiconId = rawId === 'gizey' ? 'gizey' : 'massa';
  const langName = lexiconId === 'gizey' ? 'Gizey' : 'Massa';
  const pageTitle = `French — ${langName} Lexicon`;

  const [lexiconItems, setLexiconItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const q = new URLSearchParams();
    if (search) q.set('search', search);
    q.set('page', page.toString());
    q.set('limit', '25');

    fetch(`/api/${lexiconId}/lexicon?${q.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setLexiconItems(data.items || []);
          setPagination(data.pagination || { total: 0, totalPages: 1, page: 1 });
        }
      })
      .catch((err) => console.error('Lexicon fetch error:', err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [lexiconId, search, page]);

  return (
    <div className="lexicon-detail-screen">
      <Breadcrumbs 
        items={[
          { label: 'Lexicons', href: '/lexicons' },
          { label: pageTitle }
        ]} 
      />

      <div className="container">
        {/* Header */}
        <div style={{ marginTop: '8px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="card-badge-category" style={{ background: '#f1f5f9', color: '#0f172a' }}>
              Bilingual Lexicon
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {lexiconId === 'massa' ? '4,853 terms' : '3,171 terms'}
            </span>
          </div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-subtitle">
            Authoritative French-to-{langName} bilingual lexicon mapping common French words, phrases, and technical concepts to authentic {langName} equivalents.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="search-card-container">
          <div className="search-card-title">
            Search French or {langName} equivalents
          </div>
          <div className="search-card-subtitle">
            Search by French term or {langName} translation.
          </div>

          <div className="search-input-group">
            <div className="search-field-wrapper">
              <span className="search-icon-inside">
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={`Search French or ${langName} terms...`}
                className="search-input-base"
              />
            </div>
            <button type="button" className="search-btn-primary">
              Search
            </button>
            {search && (
              <button 
                type="button" 
                className="search-btn-clear"
                onClick={() => { setSearch(''); setPage(1); }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Lexical Pairs List */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              Lexical Pairs (French → {langName})
              {search && <span style={{ fontWeight: 400, fontSize: '16px', color: '#64748b' }}> — matching &quot;{search}&quot;</span>}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {lexiconItems.length} results (Page {pagination.page} of {pagination.totalPages || 1}, {pagination.total.toLocaleString()} total)
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Loading {langName} lexical pairs...</div>
              <div style={{ fontSize: '13px' }}>Querying SQLite database</div>
            </div>
          ) : lexiconItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No matches found</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Try searching another keyword or phrase.</p>
              {search && (
                <button className="btn-callout-outline" onClick={() => { setSearch(''); setPage(1); }}>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div style={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', 
                background: '#f8fafc', 
                padding: '14px 24px', 
                borderBottom: '1px solid #e2e8f0',
                fontWeight: 700,
                fontSize: '13px',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <div>French Term</div>
                <div>{langName} Equivalent</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {lexiconItems.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', 
                      padding: '16px 24px', 
                      borderBottom: idx === lexiconItems.length - 1 ? 'none' : '1px solid #f1f5f9',
                      fontSize: '15px',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafcff',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {item.french}
                    </div>
                    <div style={{ color: lexiconId === 'gizey' ? '#0d9488' : '#1362dc', fontWeight: 700 }}>
                      {lexiconId === 'gizey' ? item.gizey : item.massa}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
              <button
                disabled={page <= 1}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className="btn-callout-outline"
                style={{ opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => { setPage((p) => Math.min(pagination.totalPages, p + 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className="btn-callout-outline"
                style={{ opacity: page >= pagination.totalPages ? 0.4 : 1, cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Technical Note */}
        <div 
          style={{
            background: '#eef5fd',
            border: '1px solid #d6e6fa',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '40px'
          }}
        >
          <div style={{ color: '#1362dc', flexShrink: 0 }}>
            <IconInfo size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
              Authentic Linguistic Records
            </h4>
            <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
              Queried directly from the verified {langName} lexicon repository with full bilingual matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
