import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { IconSearch, IconPlay } from '../components/Icons';
import { VIDEO_STORIES } from '../data/storiesData';

export const VideoStoriesScreen = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All stories');
  const [sortBy, setSortBy] = useState('Newest');
  const [visibleCount, setVisibleCount] = useState(3);

  const featuredStory = VIDEO_STORIES[0];

  const filteredStories = useMemo(() => {
    return VIDEO_STORIES.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTopic = 
        activeTopic === 'All stories' || item.topic === activeTopic;
      
      return matchesSearch && matchesTopic;
    }).sort((a, b) => {
      if (sortBy === 'Duration') return parseInt(b.duration) - parseInt(a.duration);
      return 0; // Newest default
    });
  }, [searchQuery, activeTopic, sortBy]);

  const handleOpenStory = (story) => {
    onNavigate('story-detail', { storyId: story.id });
  };

  return (
    <div className="video-stories-screen">
      <Breadcrumbs 
        items={[{ label: 'Video Stories' }]} 
        onNavigate={onNavigate} 
      />

      <div className="container">
        {/* Header */}
        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
          <h1 className="page-title">Video Stories</h1>
          <p className="page-subtitle">
            Language, people, history, and ideas come to life through short educational stories.
          </p>
        </div>

        {/* Find a story Search Card */}
        <div className="search-card-container">
          <div className="search-card-title">Find a story</div>
          <div className="search-card-subtitle">
            Search titles, topics, speakers, or language themes
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
                placeholder="Search titles, topics, speakers, or language themes"
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

        {/* Browse by topic */}
        <div style={{ margin: '40px 0 20px 0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Browse by topic
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Choose a theme to focus the story collection.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="filter-sort-header">
          <div className="filter-pills-row">
            {['All stories', 'Language', 'People', 'History', 'Culture', 'Ideas'].map((topic) => (
              <button
                key={topic}
                className={`filter-pill-btn ${activeTopic === topic ? 'active' : ''}`}
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
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
              <option value="Newest">Newest</option>
              <option value="Most viewed">Most viewed</option>
              <option value="Duration">Duration</option>
            </select>
          </div>
        </div>

        {/* Featured story Section with blue left bar */}
        <div style={{ margin: '36px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '4px', height: '18px', background: '#1362dc', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Featured story</h2>
          </div>

          <div 
            onClick={() => handleOpenStory(featuredStory)}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            className="featured-story-banner"
          >
            {/* Left image */}
            <div style={{ flex: '1.2', position: 'relative', minHeight: '276px', background: '#0f172a' }}>
              <img
                src={featuredStory.heroImage}
                alt={featuredStory.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#1362dc',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <IconPlay size={20} fill="#ffffff" />
                </div>
              </div>
              <div 
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}
              >
                {featuredStory.durationFormatted}
              </div>
            </div>

            {/* Right content */}
            <div style={{ flex: '1', padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1362dc', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {featuredStory.category}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                {featuredStory.title}
              </h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.5, marginBottom: '24px' }}>
                {featuredStory.description}
              </p>
              <div>
                <button 
                  className="btn-primary-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStory(featuredStory);
                  }}
                  style={{ width: '48px', height: '48px', padding: 0, borderRadius: '8px' }}
                >
                  <IconPlay size={20} fill="#ffffff" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Story directory */}
        <div style={{ marginTop: '56px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Story directory
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
            Short films to help you see language from a fresh perspective.
          </p>

          <div className="cards-grid-3">
            {filteredStories.slice(0, visibleCount).map((story) => (
              <div
                key={story.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease'
                }}
                className="directory-card"
                onClick={() => handleOpenStory(story)}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', height: '184px', background: '#e2e8f0', margin: '-24px -24px 20px -24px', width: 'calc(100% + 48px)' }}>
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconPlay size={14} fill="#ffffff" />
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1362dc', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {story.category}
                  </div>
                  <h3 className="card-title" style={{ fontSize: '18px', marginBottom: '8px' }}>
                    {story.title}
                  </h3>
                  <p className="card-description" style={{ marginBottom: '16px' }}>
                    {story.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{story.duration}</span>
                  <span className="card-action-link" style={{ fontSize: '13px' }}>
                    Watch story
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load more stories */}
        {visibleCount < filteredStories.length && (
          <div className="load-more-container">
            <button 
              className="btn-load-more"
              onClick={() => setVisibleCount((prev) => prev + 3)}
            >
              Load more stories
            </button>
          </div>
        )}

        {/* Bottom Callout */}
        <div className="bottom-callout-card">
          <div>
            <h3 className="callout-title">Explore the language behind every story</h3>
            <p className="callout-subtitle">
              Keep following the threads with definitions, word histories, and curated lexical collections.
            </p>
          </div>

          <div className="callout-actions">
            <button 
              className="btn-callout-solid"
              onClick={() => onNavigate('dictionaries')}
            >
              Browse dictionaries
            </button>
            <button 
              className="btn-callout-outline"
              onClick={() => onNavigate('lexicons')}
            >
              Browse lexicons
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
