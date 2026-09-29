import React from 'react';

export const Header = ({ currentScreen, currentUser, onNavigate, onOpenAuth, onOpenAbout }) => {
  // Determine which main nav link is active
  let activeNav = 'home';
  if (currentScreen === 'dictionaries' || currentScreen === 'english-dictionary') {
    activeNav = 'dictionaries';
  } else if (currentScreen === 'lexicons' || currentScreen === 'computing-lexicon') {
    activeNav = 'lexicons';
  } else if (currentScreen === 'stories' || currentScreen === 'story-detail') {
    activeNav = 'stories';
  }

  const screensList = [
    { id: 'home', label: '1. Landing Page' },
    { id: 'dictionaries', label: '2. Dictionaries' },
    { id: 'lexicons', label: '3. Lexicons' },
    { id: 'stories', label: '4. Video Stories' },
    { id: 'english-dictionary', label: '5. English Dictionary' },
    { id: 'computing-lexicon', label: '6. Computing Lexicon' },
    { id: 'story-detail', label: '7. Video Story Detail' },
  ];

  return (
    <>
      {/* Quick Screen Switcher Bar for Pair Programming & Testing */}
      <div className="prototype-switcher-bar">
        <div className="prototype-switcher-title">
          <span>X Dictionary Interactive Suite</span>
        </div>
        <div className="prototype-screen-pills">
          {screensList.map((screen) => (
            <button
              key={screen.id}
              className={`prototype-pill ${currentScreen === screen.id ? 'active' : ''}`}
              onClick={() => onNavigate(screen.id)}
            >
              {screen.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <header className="app-header">
        <div className="container app-header-inner">
          {/* Logo */}
          <button 
            className="brand-logo" 
            onClick={() => onNavigate('home')}
            aria-label="X Dictionary Home"
          >
            <div className="brand-icon-box">X</div>
            <span>X Dictionary</span>
          </button>

          {/* Navigation Links */}
          <nav className="nav-links" aria-label="Main Navigation">
            <button
              className={`nav-link-item ${activeNav === 'dictionaries' ? 'active' : ''}`}
              onClick={() => onNavigate('dictionaries')}
            >
              Dictionaries
            </button>
            <button
              className={`nav-link-item ${activeNav === 'lexicons' ? 'active' : ''}`}
              onClick={() => onNavigate('lexicons')}
            >
              Lexicons
            </button>
            <button
              className={`nav-link-item ${activeNav === 'stories' ? 'active' : ''}`}
              onClick={() => onNavigate('stories')}
            >
              Stories
            </button>
            <button
              className="nav-link-item"
              onClick={onOpenAbout}
            >
              About
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="nav-actions">
            {currentUser ? (
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>
                {currentUser}
              </span>
            ) : (
              <button 
                className="btn-sign-in"
                onClick={onOpenAuth}
              >
                Sign in
              </button>
            )}
            <button 
              className="btn-primary-action"
              onClick={() => onNavigate('dictionaries')}
            >
              Explore
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
