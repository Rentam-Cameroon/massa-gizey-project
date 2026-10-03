'use client';

import React from 'react';
import Link from 'next/link';

export const Footer = ({ isHome = false }) => {
  return (
    <footer className="app-footer">
      <div className="container footer-inner">
        {isHome ? (
          <div className="footer-left">
            <Link href="/" className="brand-logo">
              <div className="brand-icon-box">MG</div>
              <span>Massa Gizey Project</span>
            </Link>
            <p className="footer-caption">
              A comprehensive digital portal preserving and celebrating Massa and Gizey languages, lexicons, and cultural heritage.
            </p>
          </div>
        ) : (
          <div className="footer-copy">
            © 2026 Massa Gizey Project · Educational language resources
          </div>
        )}

        <div className="footer-links">
          <Link href="/dictionaries" className="footer-link">
            Dictionaries
          </Link>
          <Link href="/lexicons" className="footer-link">
            Lexicons
          </Link>
          <Link href="/stories" className="footer-link">
            Stories
          </Link>
          <button className="footer-link" onClick={() => alert('Privacy Policy: All searches and contributions are stored securely.')}>
            Privacy
          </button>
          <button className="footer-link" onClick={() => alert('Contact: info@massagizey.org')}>
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};
