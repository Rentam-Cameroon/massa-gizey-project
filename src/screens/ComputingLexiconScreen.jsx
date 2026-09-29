import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { IconSearch, IconArrowRight, IconInfo, IconX } from '../components/Icons';
import { COMPUTING_LEXICON_TERMS } from '../data/lexiconsData';

export const ComputingLexiconScreen = ({ onNavigate, lexiconTitle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All');
  const [activeTab, setActiveTab] = useState('A-Z');
  const [selectedTerm, setSelectedTerm] = useState(null);

  const filteredTerms = useMemo(() => {
    return COMPUTING_LEXICON_TERMS.filter((item) => {
      const matchesSearch = 
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.usage.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTopic = 
        activeTopic === 'All' || item.topic === activeTopic;

      return matchesSearch && matchesTopic;
    }).sort((a, b) => {
      if (activeTab === 'A-Z') return a.term.localeCompare(b.term);
      return 0;
    });
  }, [searchQuery, activeTopic, activeTab]);

  return (
    <div className="computing-lexicon-screen">
      <Breadcrumbs 
        items={[
          { label: 'Lexicons', screen: 'lexicons' },
          { label: lexiconTitle || 'Computing & Software Lexicon' }
        ]} 
        onNavigate={onNavigate} 
      />

      <div className="container">
        {/* Header with About Box on the right */}
        <div style={{ 
          marginTop: '8px', 
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '32px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 500px' }}>
            <span className="page-badge-pill">Technology</span>
            <h1 className="page-title">{lexiconTitle || 'Computing & Software Lexicon'}</h1>
            <p className="page-subtitle">
              A practical guide to the vocabulary behind modern software, systems, and the web.
            </p>
          </div>

          <div style={{ 
            background: '#f0f6fd', 
            border: '1px solid #d8e6fa', 
            borderRadius: '12px', 
            padding: '20px 24px',
            maxWidth: '320px',
            flex: '0 0 auto'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1362dc', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
              ABOUT THIS LEXICON
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Technical terms, plain-language meanings, and usage examples.
            </p>
          </div>
        </div>

        {/* Find a technical term Search Card */}
        <div className="search-card-container">
          <div className="search-card-title">Find a technical term</div>
          <div className="search-card-subtitle">
            Search terms or concepts in this specialist lexicon.
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
                placeholder="Search terms or concepts"
                className="search-input-base"
              />
            </div>
            <button 
              type="button" 
              className="search-btn-primary"
              onClick={() => {}}
            >
              Search
            </button>
          </div>
        </div>

        {/* Browse this lexicon */}
        <div style={{ margin: '40px 0 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
              Browse this lexicon
            </h2>

            {/* Sub-tabs: A-Z, Core concepts, Recently added */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['A–Z', 'Core concepts', 'Recently added'].map((tab) => (
                <button
                  key={tab}
                  className={`filter-pill-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ borderRadius: '6px' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Topics row: Web, Data, Security, Software */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Topics:</span>
            {['All', 'Web', 'Data', 'Security', 'Software'].map((topic) => (
              <button
                key={topic}
                className={`filter-pill-btn ${activeTopic === topic ? 'active' : ''}`}
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Featured terms header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            Featured terms
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {filteredTerms.length} terms shown
          </span>
        </div>

        {/* Term Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTerms.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '24px',
                transition: 'all 0.15s ease'
              }}
              className="lexicon-term-card"
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                    {item.term}
                  </h3>
                  <span className="card-badge-category">
                    {item.badge}
                  </span>
                </div>

                <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.5, marginBottom: '12px' }}>
                  {item.definition}
                </p>

                <div 
                  style={{ 
                    borderLeft: '3px solid #1362dc', 
                    paddingLeft: '14px', 
                    color: '#475569', 
                    fontSize: '14px' 
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Usage:</span> “{item.usage}”
                </div>
              </div>

              <div>
                <button
                  className="card-action-link"
                  onClick={() => setSelectedTerm(item)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Open term</span>
                  <IconArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Technical note callout */}
        <div 
          style={{
            background: '#eef5fd',
            border: '1px solid #d6e6fa',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            margin: '40px 0'
          }}
        >
          <div style={{ color: '#1362dc', flexShrink: 0 }}>
            <IconInfo size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
              Technical note
            </h4>
            <p style={{ fontSize: '14px', color: '#475569' }}>
              This prototype uses local sample content and does not connect to a live terminology database.
            </p>
          </div>
        </div>

        {/* Related resources */}
        <div style={{ margin: '48px 0 64px 0', borderTop: '1px solid #f1f5f9', paddingTop: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
            Related resources
          </h2>

          <div className="cards-grid-2">
            <div 
              className="directory-card"
              onClick={() => onNavigate('dictionaries')}
              style={{ cursor: 'pointer', padding: '24px' }}
            >
              <h3 className="card-title" style={{ fontSize: '17px', marginBottom: '6px' }}>
                Science & Technology Dictionary
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Explore fundamental scientific definitions and laboratory concepts.
              </p>
            </div>

            <div 
              className="directory-card"
              onClick={() => onNavigate('stories')}
              style={{ cursor: 'pointer', padding: '24px' }}
            >
              <h3 className="card-title" style={{ fontSize: '17px', marginBottom: '6px' }}>
                Technology in Language Stories
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                How digital networks and software reshape linguistic conventions worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Term Deep-Dive Modal */}
      {selectedTerm && (
        <div className="modal-overlay" onClick={() => setSelectedTerm(null)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 className="modal-title">{selectedTerm.term}</h3>
                <span className="card-badge-category">{selectedTerm.badge}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedTerm(null)}>
                <IconX size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Definition
                </h4>
                <p style={{ fontSize: '15px', color: '#1e293b', lineHeight: 1.5 }}>
                  {selectedTerm.definition}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Technical Details
                </h4>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                  {selectedTerm.details}
                </p>
              </div>

              <div style={{ borderLeft: '3px solid #1362dc', paddingLeft: '14px', fontStyle: 'italic', color: '#334155', fontSize: '14px' }}>
                "{selectedTerm.usage}"
              </div>

              {selectedTerm.related && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Related Concepts
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedTerm.related.map((r, i) => (
                      <span key={i} style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#334155' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn-primary-action" onClick={() => setSelectedTerm(null)}>
                  Close Term
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
