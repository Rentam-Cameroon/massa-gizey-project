'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { 
  IconStackBooks, 
  IconSearch, 
  IconArrowRight 
} from '../../components/Icons';

export default function LexiconsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const lexicons = [
    {
      id: 'massa',
      title: 'French — Massa Lexicon',
      badge: 'Bilingual Lexicon',
      language: 'Massa',
      description: 'Comprehensive French-to-Massa lexical entries organized alphabetically and semantically, connecting everyday spoken French to authentic Massa terminology.',
      coverage: '4,853 bilingual pairs',
      href: '/lexicons/massa',
      accentColor: '#1362dc',
      features: ['Alphabetical lexical index', 'Contextual expressions', 'Native phonetic roots']
    },
    {
      id: 'gizey',
      title: 'French — Gizey Lexicon',
      badge: 'Bilingual Lexicon',
      language: 'Gizey',
      description: 'Complete French-to-Gizey vocabulary translations and phrase correlations, preserving distinct Gizey cultural expressions and terminology.',
      coverage: '3,171 bilingual pairs',
      href: '/lexicons/gizey',
      accentColor: '#0d9488',
      features: ['Full bilingual mapping', 'Dialectical distinctions', 'Tonal & grammatical context']
    }
  ];

  const filtered = lexicons.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.coverage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="lexicons-screen">
      <Breadcrumbs items={[{ label: 'Lexicons' }]} />

      <div className="container">
        {/* Header */}
        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
          <h1 className="page-title">Lexicons</h1>
          <p className="page-subtitle">
            Explore authentic French — Massa and French — Gizey bilingual lexicons, bringing together thousands of curated lexical pairs from the native languages.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="search-card-container">
          <div className="search-card-title">Search bilingual lexicons</div>
          <div className="search-card-subtitle">
            Search lexicon titles, language families, or bilingual pairings.
          </div>

          <div className="search-input-group">
            <div className="search-field-wrapper">
              <span className="search-icon-inside">
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search French, Massa, or Gizey lexicons..."
                className="search-input-base"
              />
            </div>
            <button type="button" className="search-btn-primary">
              Search
            </button>
            {searchQuery && (
              <button 
                type="button" 
                className="search-btn-clear"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '14px' }}>
            {filtered.length} bilingual lexicons available.
          </div>
        </div>

        {/* Browse lexicons section */}
        <div style={{ margin: '40px 0 24px 0' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Available Bilingual Lexicons
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Select a lexicon to explore its full vocabulary database and translations.
          </p>
        </div>

        {/* Lexicons Grid (2 cards layout) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {filtered.map((lex) => (
            <Link
              key={lex.id}
              href={lex.href}
              className="directory-card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div className="card-icon-badge" style={{ marginBottom: 0, background: '#eef5fd', color: lex.accentColor }}>
                    <IconStackBooks size={24} />
                  </div>
                  <span className="card-badge-category" style={{ background: '#f1f5f9', color: '#0f172a' }}>
                    {lex.badge}
                  </span>
                </div>

                <h3 className="card-title" style={{ fontSize: '22px', marginBottom: '12px' }}>
                  {lex.title}
                </h3>
                <p className="card-description" style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                  {lex.description}
                </p>

                <div style={{
                  display: 'inline-block',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '20px'
                }}>
                  {lex.coverage}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '24px' }}>
                  {lex.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: lex.accentColor }}></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-action-link" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <span style={{ fontWeight: 600 }}>Explore {lex.title}</span>
                <IconArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="bottom-callout-card" style={{ marginTop: '48px' }}>
          <div>
            <h3 className="callout-title">Looking for the complete dictionary?</h3>
            <p className="callout-subtitle">
              Browse full grammatical definitions, phonetic pronunciations, and dialect variations in the Massa & Gizey Dictionaries.
            </p>
          </div>

          <div className="callout-actions">
            <Link href="/dictionaries" className="btn-callout-solid">
              Browse dictionaries
            </Link>
            <Link href="/stories" className="btn-callout-outline">
              Watch cultural stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
