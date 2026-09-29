import React from 'react';

export const Footer = ({ isHome = false, onNavigate }) => {
  return (
    <footer className="app-footer">
      <div className="container footer-inner">
        {isHome ? (
          <div className="footer-left">
            <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate('home')}>
              <div className="brand-icon-box">X</div>
              <span>X Dictionary</span>
            </div>
            <p className="footer-caption">
              A clear, useful place to explore words, knowledge, and language in context.
            </p>
          </div>
        ) : (
          <div className="footer-copy">
            © 2026 X Dictionary · Educational language resources
          </div>
        )}

        <div className="footer-links">
          <button className="footer-link" onClick={() => onNavigate('dictionaries')}>
            Dictionaries
          </button>
          <button className="footer-link" onClick={() => onNavigate('lexicons')}>
            Lexicons
          </button>
          <button className="footer-link" onClick={() => onNavigate('stories')}>
            Stories
          </button>
          <button className="footer-link" onClick={() => alert('Privacy Policy: All interactions in this prototype are preserved locally in browser memory.')}>
            Privacy
          </button>
          <button className="footer-link" onClick={() => alert('Contact: support@xdictionary.org')}>
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};
