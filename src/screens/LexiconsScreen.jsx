import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  IconCode, 
  IconHeartPulse, 
  IconScale, 
  IconTrendingUp, 
  IconLeaf, 
  IconClapperboard, 
  IconSearch, 
  IconArrowRight 
} from '../components/Icons';
import { LEXICONS } from '../data/lexiconsData';

export const LexiconsScreen = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeField, setActiveField] = useState('All fields');
  const [sortBy, setSortBy] = useState('Most popular');
  const [visibleCount, setVisibleCount] = useState(6);

  const getIcon = (type) => {
    switch (type) {
      case 'code': return <IconCode size={22} />;
      case 'heart': return <IconHeartPulse size={22} />;
      case 'scale': return <IconScale size={22} />;
      case 'trending': return <IconTrendingUp size={22} />;
      case 'leaf': return <IconLeaf size={22} />;
      case 'clapperboard': return <IconClapperboard size={22} />;
      default: return <IconCode size={22} />;
    }
  };

  const filteredLexicons = useMemo(() => {
    return LEXICONS.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.coverage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badge.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesField = 
        activeField === 'All fields' || item.field === activeField;
      
      return matchesSearch && matchesField;
    }).sort((a, b) => {
      if (sortBy === 'Alphabetical') return a.title.localeCompare(b.title);
      return 0; // Most popular default
    });
  }, [searchQuery, activeField, sortBy]);

  const handleCardClick = (lex) => {
    if (lex.id === 'computing-software') {
      onNavigate('computing-lexicon');
    } else {
      onNavigate('computing-lexicon', { lexiconTitle: lex.title });
    }
  };

  return (
    <div className="lexicons-screen">
      <Breadcrumbs 
        items={[{ label: 'Lexicons' }]} 
        onNavigate={onNavigate} 
      />

      <div className="container">
        {/* Header */}
        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
          <h1 className="page-title">Lexicons</h1>
          <p className="page-subtitle">
            Explore specialist vocabularies organised by field and community, from technical disciplines to everyday cultural knowledge.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="search-card-container">
          <div className="search-card-title">Find a specialist lexicon</div>
          <div className="search-card-subtitle">
            Search lexicon names, fields, terms, or topics. Results use the local sample directory on this page.
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
                placeholder="Search lexicons, fields, terms, or topics"
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
            <button 
              type="button" 
              className="search-btn-clear"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          </div>

          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '14px' }}>
            {filteredLexicons.length} lexicons found.
          </div>
        </div>

        {/* Browse lexicons section */}
        <div style={{ margin: '40px 0 24px 0' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Browse lexicons
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Start with a field, then open a collection to focus your term search.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="filter-sort-header">
          <div className="filter-pills-row">
            {['All fields', 'Academic', 'Professional', 'Culture & Society', 'Technology'].map((field) => (
              <button
                key={field}
                className={`filter-pill-btn ${activeField === field ? 'active' : ''}`}
                onClick={() => setActiveField(field)}
              >
                {field}
              </button>
            ))}
          </div>

          <div className="sort-dropdown-wrapper">
            <span>Sort by</span>
            <select 
              className="sort-select" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Most popular">Most popular</option>
              <option value="Alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Lexicons Grid */}
        <div className="cards-grid-3">
          {filteredLexicons.slice(0, visibleCount).map((lex) => (
            <div
              key={lex.id}
              className="directory-card"
              onClick={() => handleCardClick(lex)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div className="card-icon-badge" style={{ marginBottom: 0 }}>
                    {getIcon(lex.iconType)}
                  </div>
                  <span className="card-badge-category">{lex.badge}</span>
                </div>

                <h3 className="card-title">{lex.title}</h3>
                <p className="card-description">{lex.description}</p>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  {lex.coverage}
                </div>
              </div>

              <div className="card-action-link">
                <span>Open lexicon</span>
                <IconArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Load more button */}
        {visibleCount < filteredLexicons.length && (
          <div className="load-more-container">
            <button 
              className="btn-load-more"
              onClick={() => setVisibleCount((prev) => prev + 3)}
            >
              Load more lexicons
            </button>
          </div>
        )}

        {/* Featured lexicons section */}
        <div style={{ marginTop: '56px', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Featured lexicons
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Popular starting points for readers moving between specialist and everyday language.
          </p>

          <div className="cards-grid-3">
            {LEXICONS.filter((l) => l.featured).map((lex) => (
              <div
                key={`feat-${lex.id}`}
                className="directory-card"
                onClick={() => handleCardClick(lex)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div style={{ color: '#1362dc', marginBottom: '8px', fontSize: '18px', fontWeight: 700 }}>
                    {lex.iconType === 'code' ? '{ }' : lex.iconType === 'heart' ? '⚕' : '☼'}
                  </div>
                  <h3 className="card-title" style={{ marginBottom: '8px' }}>
                    {lex.featureTag}
                  </h3>
                  <p className="card-description" style={{ marginBottom: 0 }}>
                    {lex.featureDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="bottom-callout-card">
          <div>
            <h3 className="callout-title">Find the right vocabulary</h3>
            <p className="callout-subtitle">
              Need a general definition or want to hear language used in context? Continue to the main dictionary or explore our video stories.
            </p>
          </div>

          <div className="callout-actions">
            <button 
              className="btn-callout-outline"
              onClick={() => onNavigate('dictionaries')}
            >
              Browse dictionaries
            </button>
            <button 
              className="btn-callout-solid"
              onClick={() => onNavigate('stories')}
            >
              Watch video stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
