'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { IconBook, IconSearch, IconArrowRight } from '../../components/Icons';

export default function DictionariesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const dictionaries = [
    {
      id: 'massa',
      title: 'Massa Dictionary',
      badge: 'Language',
      description: 'Comprehensive vocabulary, tone marks, dialect coverage (gumay, ɦaara), and everyday usage for the Massa language.',
      entriesCount: '4,748+ entries',
      href: '/dictionaries/massa',
      featureTag: 'Most used',
      featureDesc: 'An authoritative linguistic reference for Massa words, grammar, and usage.'
    },
    {
      id: 'gizey',
      title: 'Gizey Dictionary',
      badge: 'Language',
      description: 'Extensive dictionary for Gizey vocabulary, morphology, parts of speech, and idiomatic expressions.',
      entriesCount: '2,165+ entries',
      href: '/dictionaries/gizey',
      featureTag: 'Specialist terms',
      featureDesc: 'Explore rich Gizey vocabulary, cultural expressions, and authentic phrases.'
    }
  ];

  const filtered = dictionaries.filter((d) => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dictionaries-screen">
      <Breadcrumbs items={[{ label: 'Dictionaries' }]} />

      <div className="container">
        {/* Header */}
        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
          <h1 className="page-title">Dictionaries</h1>
          <p className="page-subtitle">
            Browse general, language, learner, and subject dictionaries designed to help you find the right words with confidence.
          </p>
        </div>

        {/* Find a dictionary Search Card */}
        <div className="search-card-container">
          <div className="search-card-title">Find a dictionary</div>
          <div className="search-card-subtitle">
            Search by dictionary name, language, or subject
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
                placeholder="Search dictionaries..."
                className="search-input-base"
              />
            </div>
            <button 
              type="button" 
              className="search-btn-primary"
            >
              Search
            </button>
            <button 
              type="button" 
              className="search-btn-clear"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Browse dictionaries section */}
        <div style={{ margin: '40px 0 20px 0' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Browse dictionaries
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Choose a collection to start exploring.
          </p>
        </div>

        {/* Filter bar - ONLY All Dictionaries kept and active */}
        <div className="filter-sort-header">
          <div className="filter-pills-row">
            <button className="filter-pill-btn active">
              All Dictionaries
            </button>
          </div>
        </div>

        {/* Exactly Two Dictionaries: Massa and Gizey */}
        <div className="cards-grid-2">
          {filtered.map((dict) => (
            <Link
              key={dict.id}
              href={dict.href}
              className="directory-card"
            >
              <div>
                <div className="card-icon-badge">
                  <IconBook size={24} />
                </div>
                <h3 className="card-title" style={{ fontSize: '22px', marginBottom: '10px' }}>
                  {dict.title}
                </h3>
                <p className="card-description" style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                  {dict.description}
                </p>
              </div>

              <div>
                <div className="card-meta-count" style={{ fontSize: '14px', fontWeight: 600, color: '#1362dc', marginBottom: '14px' }}>
                  {dict.entriesCount}
                </div>
                <div className="card-action-link" style={{ fontSize: '15px' }}>
                  <span>Open dictionary</span>
                  <IconArrowRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured dictionaries section */}
        <div style={{ marginTop: '56px', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Featured dictionaries
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Popular starting points for everyday reference and study.
          </p>

          <div className="cards-grid-2">
            {dictionaries.map((dict) => (
              <Link
                key={`feat-${dict.id}`}
                href={dict.href}
                className="directory-card"
              >
                <div>
                  <h3 className="card-title" style={{ marginBottom: '8px' }}>
                    {dict.title}
                  </h3>
                  <p className="card-description" style={{ marginBottom: 0 }}>
                    {dict.featureDesc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="bottom-callout-card">
          <div>
            <h3 className="callout-title">Not sure where to begin?</h3>
            <p className="callout-subtitle">
              Choose a general dictionary for everyday words, or explore the specialist lexicon for bilingual translations.
            </p>
          </div>

          <div className="callout-actions">
            <Link 
              href="/lexicons"
              className="btn-callout-outline"
            >
              Browse lexicons
            </Link>
            <Link 
              href="/stories"
              className="btn-callout-solid"
            >
              Watch video stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
