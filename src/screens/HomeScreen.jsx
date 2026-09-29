import React, { useState } from 'react';
import { 
  IconBook, 
  IconStackBooks, 
  IconVideo, 
  IconGraduationCap, 
  IconQuote, 
  IconLeaf, 
  IconSearch, 
  IconArrowRight, 
  IconArrowUpRight, 
  IconArrowDown 
} from '../components/Icons';

export const HomeScreen = ({ onNavigate, onSearchWord }) => {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearchWord(query.trim());
  };

  const scrollToExplore = () => {
    const el = document.getElementById('explore-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-screen-wrapper">
      {/* Hero Section */}
      <section className="hero-section" style={{ background: '#f0f5fa', padding: '72px 0 88px 0', borderBottom: '1px solid #e5eaf2' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <div className="section-eyebrow" style={{ color: '#1362dc', letterSpacing: '0.08em', marginBottom: '14px' }}>
            LANGUAGE, MADE NAVIGABLE
          </div>
          
          <h1 className="page-title" style={{ fontSize: '46px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
            One place for every word.
          </h1>
          
          <p className="page-subtitle" style={{ margin: '0 auto 36px auto', fontSize: '16px', color: '#475569', lineHeight: 1.6 }}>
            X Dictionary brings trusted dictionaries, specialist lexicons, and video stories together so you can explore language with confidence.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '640px', margin: '0 auto 24px auto' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '16px', color: '#64748b' }}>
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a word, term, or topic..."
                style={{
                  width: '100%',
                  height: '52px',
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                }}
              />
            </div>
            <button 
              type="submit" 
              className="search-btn-primary"
              style={{ height: '52px', padding: '0 28px', fontSize: '15px' }}
            >
              Search
            </button>
          </form>

          {/* Down arrow link */}
          <button 
            onClick={scrollToExplore}
            aria-label="Scroll to explore"
            style={{ 
              color: '#1362dc', 
              marginTop: '8px', 
              display: 'inline-flex',
              padding: '6px',
              borderRadius: '50%',
              transition: 'transform 0.2s ease'
            }}
          >
            <IconArrowDown size={20} />
          </button>
        </div>
      </section>

      {/* Explore the platform */}
      <section id="explore-section" style={{ padding: '64px 0', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ marginBottom: '32px' }}>
            <div className="section-eyebrow">EXPLORE</div>
            <h2 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
              Explore the platform
            </h2>
            <p className="page-subtitle">
              Find the right resource for a quick definition, deeper specialist knowledge, or a fresh perspective on how language lives in the world.
            </p>
          </div>

          <div className="cards-grid-4">
            {/* Dictionaries Card */}
            <div 
              className="directory-card"
              onClick={() => onNavigate('dictionaries')}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="card-icon-badge">
                  <IconBook size={22} />
                </div>
                <h3 className="card-title" style={{ marginBottom: '10px' }}>Dictionaries</h3>
                <p className="card-description">
                  Clear definitions, examples, pronunciation, and related words.
                </p>
              </div>
              <div className="card-action-link" style={{ marginTop: '16px' }}>
                <span>Explore dictionaries</span>
                <IconArrowRight size={16} />
              </div>
            </div>

            {/* Lexicons Card */}
            <div 
              className="directory-card"
              onClick={() => onNavigate('lexicons')}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="card-icon-badge">
                  <IconStackBooks size={22} />
                </div>
                <h3 className="card-title" style={{ marginBottom: '10px' }}>Lexicons</h3>
                <p className="card-description">
                  Specialist terminology organised for deeper understanding.
                </p>
              </div>
              <div className="card-action-link" style={{ marginTop: '16px' }}>
                <span>Explore lexicons</span>
                <IconArrowRight size={16} />
              </div>
            </div>

            {/* Video Stories Card */}
            <div 
              className="directory-card"
              onClick={() => onNavigate('stories')}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="card-icon-badge">
                  <IconVideo size={22} />
                </div>
                <h3 className="card-title" style={{ marginBottom: '10px' }}>Video Stories</h3>
                <p className="card-description">
                  Watch language unfold through short, thoughtful stories.
                </p>
              </div>
              <div className="card-action-link" style={{ marginTop: '16px' }}>
                <span>Watch stories</span>
                <IconArrowRight size={16} />
              </div>
            </div>

            {/* Learning Resources Card */}
            <div 
              className="directory-card"
              onClick={() => onNavigate('english-dictionary')}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="card-icon-badge">
                  <IconGraduationCap size={22} />
                </div>
                <h3 className="card-title" style={{ marginBottom: '10px' }}>Learning Resources</h3>
                <p className="card-description">
                  Practical guides for building language skills and curiosity.
                </p>
              </div>
              <div className="card-action-link" style={{ marginTop: '16px' }}>
                <span>Start learning</span>
                <IconArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources / Discover something new */}
      <section style={{ padding: '64px 0', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div className="section-eyebrow">FEATURED RESOURCES</div>
              <h2 className="page-title" style={{ fontSize: '28px', marginBottom: '0' }}>
                Discover something new
              </h2>
            </div>
            <button 
              className="card-action-link" 
              onClick={() => onNavigate('dictionaries')}
              style={{ fontSize: '14px' }}
            >
              View all resources <IconArrowRight size={16} />
            </button>
          </div>

          <div className="cards-grid-3">
            {/* Card 1: Featured Word */}
            <div 
              className="directory-card"
              onClick={() => onNavigate('english-dictionary', { word: 'serendipity' })}
              style={{ cursor: 'pointer', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div className="card-icon-badge" style={{ marginBottom: 0 }}>
                  <IconQuote size={20} />
                </div>
                <IconArrowUpRight size={18} style={{ color: '#1362dc' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1362dc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                FEATURED WORD
              </div>
              <h3 className="card-title" style={{ fontSize: '20px', marginBottom: '8px' }}>
                serendipity
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                A happy discovery made by chance.
              </p>
            </div>

            {/* Card 2: Specialist Lexicon */}
            <div 
              className="directory-card"
              onClick={() => onNavigate('lexicons')}
              style={{ cursor: 'pointer', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div className="card-icon-badge" style={{ marginBottom: 0 }}>
                  <IconLeaf size={20} />
                </div>
                <IconArrowUpRight size={18} style={{ color: '#1362dc' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1362dc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                SPECIALIST LEXICON
              </div>
              <h3 className="card-title" style={{ fontSize: '20px', marginBottom: '8px' }}>
                Climate & environment
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Essential terms for understanding climate conversations.
              </p>
            </div>

            {/* Card 3: Video Story */}
            <div 
              className="directory-card"
              onClick={() => onNavigate('story-detail')}
              style={{ cursor: 'pointer', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div className="card-icon-badge" style={{ marginBottom: 0 }}>
                  <IconVideo size={20} />
                </div>
                <IconArrowUpRight size={18} style={{ color: '#1362dc' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1362dc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                VIDEO STORY
              </div>
              <h3 className="card-title" style={{ fontSize: '20px', marginBottom: '8px' }}>
                The words we inherit
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                A short exploration of family language and memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for everyday curiosity */}
      <section style={{ padding: '64px 0', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ marginBottom: '40px' }}>
            <h2 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
              Built for everyday curiosity
            </h2>
            <p className="page-subtitle">
              X Dictionary gives you a straightforward path from a simple question to a meaningful understanding.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '32px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '32px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1362dc', marginBottom: '8px' }}>
                01
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Clear definitions
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                Understand a word quickly with direct explanations and useful context.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1362dc', marginBottom: '8px' }}>
                02
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Specialist knowledge
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                Explore the vocabulary that helps complex subjects make sense.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1362dc', marginBottom: '8px' }}>
                03
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Stories that bring language to life
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                Meet language in use through concise, human-centred video stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start exploring language CTA Banner */}
      <section style={{ padding: '48px 0 64px 0' }}>
        <div className="container">
          <div style={{
            background: '#eaf2fd',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Start exploring language
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', marginBottom: '24px', maxWidth: '500px' }}>
              Search for a word, follow your curiosity, and find a useful place to begin.
            </p>
            <button 
              className="btn-primary-action"
              onClick={() => onNavigate('dictionaries')}
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              Explore X Dictionary
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
