import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { IconVolume } from '../components/Icons';
import { ENGLISH_DICTIONARY_WORDS } from '../data/dictionariesData';

export const EnglishDictionaryScreen = ({ onNavigate, initialWord }) => {
  const [searchQuery, setSearchQuery] = useState(initialWord || '');
  const [activeWordType, setActiveWordType] = useState('All words');
  const [activeTab, setActiveTab] = useState('A-Z');
  const [speakingWord, setSpeakingWord] = useState(null);

  const speak = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      setSpeakingWord(word);
      utterance.onend = () => setSpeakingWord(null);
      utterance.onerror = () => setSpeakingWord(null);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Pronouncing: ${word}`);
    }
  };

  const filteredWords = useMemo(() => {
    return ENGLISH_DICTIONARY_WORDS.filter((item) => {
      const matchesSearch = 
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.usage.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = 
        activeWordType === 'All words' || item.type === activeWordType;

      return matchesSearch && matchesType;
    }).sort((a, b) => {
      if (activeTab === 'A-Z') return a.word.localeCompare(b.word);
      return 0;
    });
  }, [searchQuery, activeWordType, activeTab]);

  return (
    <div className="english-dictionary-screen">
      <Breadcrumbs 
        items={[
          { label: 'Dictionaries', screen: 'dictionaries' },
          { label: 'English Dictionary' }
        ]} 
        onNavigate={onNavigate} 
      />

      <div className="container">
        {/* Header */}
        <div style={{ marginTop: '8px', marginBottom: '28px' }}>
          <span className="page-badge-pill">ENGLISH</span>
          <h1 className="page-title">English Dictionary</h1>
          <p className="page-subtitle" style={{ marginBottom: '6px' }}>
            Clear definitions and practical examples for everyday English.
          </p>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Definitions, examples, pronunciation, and usage
          </p>
        </div>

        {/* Search Input Box */}
        <div style={{ marginBottom: '40px' }}>
          <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
            Search the English Dictionary
          </label>
          <form 
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', gap: '10px', maxWidth: '680px' }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a word"
              className="search-input-base"
              style={{ paddingLeft: '16px' }}
            />
            <button type="submit" className="search-btn-primary">
              Search
            </button>
          </form>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
            Search for words or phrases in this local sample dictionary.
          </div>
        </div>

        {/* Browse this dictionary */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Browse this dictionary
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Explore featured entries or narrow your view by word type.
              </p>
            </div>

            <div className="filter-pills-row">
              {['All words', 'Nouns', 'Adjectives'].map((type) => (
                <button
                  key={type}
                  className={`filter-pill-btn ${activeWordType === type ? 'active' : ''}`}
                  onClick={() => setActiveWordType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sub tabs: A-Z, Popular words, Recently added */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '32px' }}>
            {['A–Z', 'Popular words', 'Recently added'].map((tab) => (
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

        {/* Featured words */}
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
            Featured words
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredWords.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '28px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                      {item.word}
                    </h3>
                    <span style={{ fontSize: '15px', color: '#64748b', fontStyle: 'italic' }}>
                      {item.phonetic}
                    </span>
                    <button 
                      onClick={() => speak(item.word)}
                      title="Listen to pronunciation"
                      style={{ 
                        color: speakingWord === item.word ? '#1362dc' : '#64748b',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <IconVolume size={18} />
                    </button>
                  </div>
                  <span className="card-badge-category" style={{ textTransform: 'capitalize' }}>
                    {item.partOfSpeech}
                  </span>
                </div>

                <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6, marginBottom: '14px' }}>
                  {item.definition}
                </p>

                {/* Usage quote */}
                <div 
                  style={{ 
                    borderLeft: '3px solid #1362dc', 
                    paddingLeft: '16px', 
                    margin: '14px 0', 
                    color: '#475569', 
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}
                >
                  Usage: "{item.usage}"
                </div>

                {/* Synonyms & Antonyms */}
                {item.synonyms && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Synonyms:</span>
                    {item.synonyms.map((s, idx) => (
                      <span 
                        key={idx}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related resources section */}
        <div style={{ margin: '64px 0 48px 0', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
            Related resources
          </h2>

          <div className="cards-grid-2">
            <div 
              className="directory-card"
              onClick={() => onNavigate('lexicons')}
              style={{ cursor: 'pointer', padding: '24px' }}
            >
              <h3 className="card-title" style={{ fontSize: '17px', marginBottom: '6px' }}>
                English learner’s lexicon
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Explore everyday vocabulary organised by theme.
              </p>
            </div>

            <div 
              className="directory-card"
              onClick={() => onNavigate('stories')}
              style={{ cursor: 'pointer', padding: '24px' }}
            >
              <h3 className="card-title" style={{ fontSize: '17px', marginBottom: '6px' }}>
                Word stories
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Watch short stories about language, meaning, and usage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
