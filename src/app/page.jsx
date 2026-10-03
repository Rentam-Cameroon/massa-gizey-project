'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function HomePage() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/dictionaries/massa?search=${encodeURIComponent(query.trim())}`);
  };

  const scrollToExplore = () => {
    const el = document.getElementById('explore-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-screen-wrapper">
      {/* Hero Section */}
      <section className="hero-section" style={{ background: '#f0f5fa', padding: 'clamp(48px, 8vw, 84px) 0', borderBottom: '1px solid #e5eaf2' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          
          <h1 className="page-title" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
            One place for every word.
          </h1>
          
          <p className="page-subtitle" style={{ margin: '0 auto 36px auto', fontSize: 'clamp(15px, 2vw, 17px)', color: '#475569', lineHeight: 1.6 }}>
            The Massa Gizey Project brings trusted dictionaries, specialist lexicons, and video stories together so you can explore language with confidence.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="search-input-group" style={{ maxWidth: '640px', margin: '0 auto 20px auto' }}>
            <div className="search-field-wrapper">
              <span className="search-icon-inside">
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Massa or Gizey words, meanings..."
                className="search-input-base"
                style={{ height: '52px', fontSize: '15px' }}
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
              marginTop: '12px', 
              display: 'inline-flex',
              padding: '8px',
              borderRadius: '50%',
              transition: 'transform 0.2s ease'
            }}
          >
            <IconArrowDown size={22} />
          </button>
        </div>
      </section>

      {/* Explore the platform */}
      <section id="explore-section" style={{ padding: 'clamp(44px, 6vw, 64px) 0', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ marginBottom: '32px' }}>
            <h2 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
              Explore the platform
            </h2>
            <p className="page-subtitle">
              Find the right resource for a quick definition, deeper specialist knowledge, or a fresh perspective on how language lives in the world.
            </p>
          </div>

          <div className="cards-grid-4">
            {/* Dictionaries Card */}
            <Link href="/dictionaries" className="directory-card">
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
            </Link>

            {/* Lexicons Card */}
            <Link href="/lexicons" className="directory-card">
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
            </Link>

            {/* Video Stories Card */}
            <Link href="/stories" className="directory-card">
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
            </Link>

            {/* Learning Resources Card */}
            <Link href="/dictionaries/massa" className="directory-card">
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
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Resources / Discover something new */}
      <section style={{ padding: 'clamp(44px, 6vw, 64px) 0', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="page-title" style={{ fontSize: '28px', marginBottom: '0' }}>
                Discover something new
              </h2>
            </div>
            <Link 
              href="/dictionaries"
              className="card-action-link" 
              style={{ fontSize: '14px' }}
            >
              View all resources <IconArrowRight size={16} />
            </Link>
          </div>

          <div className="cards-grid-3">
            {/* Card 1: Featured Word */}
            <Link 
              href="/dictionaries/massa"
              className="directory-card"
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="card-icon-badge" style={{ marginBottom: 0 }}>
                  <IconQuote size={20} />
                </div>
                <IconArrowUpRight size={18} style={{ color: '#1362dc' }} />
              </div>
              <h3 className="card-title" style={{ fontSize: '20px', marginBottom: '8px' }}>
                bà
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Massa interjection and expressive verbal marker for emphasis and vivid storytelling.
              </p>
            </Link>

            {/* Card 2: Specialist Lexicon */}
            <Link 
              href="/lexicons/massa"
              className="directory-card"
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="card-icon-badge" style={{ marginBottom: 0 }}>
                  <IconLeaf size={20} />
                </div>
                <IconArrowUpRight size={18} style={{ color: '#1362dc' }} />
              </div>
              <h3 className="card-title" style={{ fontSize: '20px', marginBottom: '8px' }}>
                French — Massa Lexicon
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Essential bilingual vocabulary pairs bridging French concepts and Massa dialect expressions.
              </p>
            </Link>

            {/* Card 3: Video Story */}
            <Link 
              href="/stories/why-words-travel"
              className="directory-card"
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="card-icon-badge" style={{ marginBottom: 0 }}>
                  <IconVideo size={20} />
                </div>
                <IconArrowUpRight size={18} style={{ color: '#1362dc' }} />
              </div>
              <h3 className="card-title" style={{ fontSize: '20px', marginBottom: '8px' }}>
                Why Words Travel
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Follow how trade, migration, and storytelling carry words across Chadic linguistic regions.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Built for everyday curiosity */}
      <section style={{ padding: 'clamp(44px, 6vw, 64px) 0', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <h2 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
              Built for everyday curiosity
            </h2>
            <p className="page-subtitle">
              The Massa Gizey Project gives you a straightforward path from a simple question to a meaningful understanding.
            </p>
          </div>

          <div className="cards-grid-3" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1362dc', marginBottom: '8px' }}>
                01
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Clear definitions
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                Understand a word quickly with direct explanations, tone accents, and useful cultural context.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1362dc', marginBottom: '8px' }}>
                02
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Specialist knowledge
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                Explore the vocabulary and dialect variations that help complex regional expressions make sense.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1362dc', marginBottom: '8px' }}>
                03
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Stories that bring language to life
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                Meet language in use through concise, human-centred video stories and oral histories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start exploring language CTA Banner */}
      <section style={{ padding: '40px 0 64px 0' }}>
        <div className="container">
          <div style={{
            background: '#eaf2fd',
            borderRadius: '16px',
            padding: 'clamp(32px, 5vw, 48px) 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Start exploring language
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', marginBottom: '24px', maxWidth: '500px' }}>
              Search for a word, follow your curiosity, and find a useful place to begin.
            </p>
            <Link 
              href="/dictionaries"
              className="btn-primary-action"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              Explore Massa Gizey Project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
