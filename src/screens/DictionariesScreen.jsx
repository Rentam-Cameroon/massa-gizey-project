import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  IconBook, 
  IconTranslate, 
  IconGraduationCap, 
  IconAtom, 
  IconPalette, 
  IconScale, 
  IconSearch, 
  IconArrowRight 
} from '../components/Icons';
import { DICTIONARIES } from '../data/dictionariesData';

export const DictionariesScreen = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All dictionaries');
  const [sortBy, setSortBy] = useState('Most useful');
  const [visibleCount, setVisibleCount] = useState(5);

  const getIcon = (type) => {
    switch (type) {
      case 'book': return <IconBook size={22} />;
      case 'translate': return <IconTranslate size={22} />;
      case 'graduation': return <IconGraduationCap size={22} />;
      case 'atom': return <IconAtom size={22} />;
      case 'palette': return <IconPalette size={22} />;
      case 'scale': return <IconScale size={22} />;
      default: return <IconBook size={22} />;
    }
  };

  const filteredDictionaries = useMemo(() => {
    return DICTIONARIES.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        activeCategory === 'All dictionaries' || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'Alphabetical') return a.title.localeCompare(b.title);
      if (sortBy === 'Most entries') return parseInt(b.entriesCount) - parseInt(a.entriesCount);
      return 0; // Most useful default
    });
  }, [searchQuery, activeCategory, sortBy]);

  const handleCardClick = (dict) => {
    if (dict.id === 'english') {
      onNavigate('english-dictionary');
    } else {
      onNavigate('english-dictionary', { dictionaryTitle: dict.title });
    }
  };

  return (
    <div className="dictionaries-screen">
      <Breadcrumbs 
        items={[{ label: 'Dictionaries' }]} 
        onNavigate={onNavigate} 
      />

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
        </div>

        {/* Browse dictionaries section */}
        <div style={{ margin: '40px 0 24px 0' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Browse dictionaries
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Choose a collection to start exploring.
          </p>
        </div>

        {/* Filter bar */}
        <div className="filter-sort-header">
          <div className="filter-pills-row">
            {['All dictionaries', 'Language', 'Learner', 'Subject'].map((cat) => (
              <button
                key={cat}
                className={`filter-pill-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
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
              <option value="Most useful">Most useful</option>
              <option value="Alphabetical">Alphabetical</option>
              <option value="Most entries">Most entries</option>
            </select>
          </div>
        </div>

        {/* Dictionaries Grid */}
        <div className="cards-grid-3">
          {filteredDictionaries.slice(0, visibleCount).map((dict) => (
            <div
              key={dict.id}
              className="directory-card"
              onClick={() => handleCardClick(dict)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="card-icon-badge">
                  {getIcon(dict.iconType)}
                </div>
                <h3 className="card-title">{dict.title}</h3>
                <p className="card-description">{dict.description}</p>
              </div>

              <div>
                <div className="card-meta-count">{dict.entriesCount}</div>
                <div className="card-action-link">
                  <span>Open dictionary</span>
                  <IconArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more button */}
        {visibleCount < filteredDictionaries.length && (
          <div className="load-more-container">
            <button 
              className="btn-load-more"
              onClick={() => setVisibleCount((prev) => prev + 3)}
            >
              Load more dictionaries
            </button>
          </div>
        )}

        {/* Featured dictionaries section */}
        <div style={{ marginTop: '56px', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Featured dictionaries
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Popular starting points for everyday reference and study.
          </p>

          <div className="cards-grid-3">
            {DICTIONARIES.filter((d) => d.featured).map((dict) => (
              <div
                key={`feat-${dict.id}`}
                className="directory-card"
                onClick={() => handleCardClick(dict)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1362dc', marginBottom: '8px' }}>
                    {dict.featureTag}
                  </div>
                  <h3 className="card-title" style={{ marginBottom: '8px' }}>
                    {dict.title}
                  </h3>
                  <p className="card-description" style={{ marginBottom: 0 }}>
                    {dict.featureDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="bottom-callout-card">
          <div>
            <h3 className="callout-title">Not sure where to begin?</h3>
            <p className="callout-subtitle">
              Choose a general dictionary for everyday words, a learner dictionary for study support, or a subject dictionary for specialist terms.
            </p>
          </div>

          <div className="callout-actions">
            <button 
              className="btn-callout-outline"
              onClick={() => onNavigate('lexicons')}
            >
              Browse lexicons
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
