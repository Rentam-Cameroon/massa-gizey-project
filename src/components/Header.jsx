'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconX } from './Icons';

export const Header = ({ onOpenAuth, onOpenAbout, currentUser, onLogout }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Lock body scroll when mobile drawer is open to prevent page jumping/overflow
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogoutClick = () => {
    setUserDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="app-header">
        <div className="container app-header-inner">
          {/* Logo */}
          <Link href="/" className="brand-logo" aria-label="Massa Gizey Project Home">
            <div className="brand-icon-box">MG</div>
            <span>Massa Gizey Project</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links desktop-only" aria-label="Main Navigation">
            <Link
              href="/dictionaries"
              className={`nav-link-item ${isActive('/dictionaries') ? 'active' : ''}`}
            >
              Dictionaries
            </Link>
            <Link
              href="/lexicons"
              className={`nav-link-item ${isActive('/lexicons') ? 'active' : ''}`}
            >
              Lexicons
            </Link>
            <Link
              href="/stories"
              className={`nav-link-item ${isActive('/stories') ? 'active' : ''}`}
            >
              Stories
            </Link>
            <button
              className="nav-link-item"
              onClick={onOpenAbout}
            >
              About
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="nav-actions desktop-only" style={{ position: 'relative' }}>
            {currentUser ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px 6px 8px',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    background: userDropdownOpen ? '#f1f5f9' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  title="Account menu"
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#1362dc',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getInitials(currentUser)}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    {currentUser}
                  </span>
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease',
                      color: '#64748b'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    padding: '8px',
                    zIndex: 2000,
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    <div style={{ padding: '8px 12px 10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Signed in as</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser}
                      </div>
                      <span style={{ 
                        display: 'inline-block', 
                        marginTop: '4px',
                        fontSize: '11px', 
                        fontWeight: 600, 
                        color: '#15803d', 
                        background: '#f0fdf4', 
                        padding: '2px 8px', 
                        borderRadius: '10px' 
                      }}>
                        Active Session
                      </span>
                    </div>

                    <div style={{ paddingTop: '6px' }}>
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'transparent',
                          color: '#dc2626',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="btn-sign-in"
                onClick={onOpenAuth}
              >
                Sign in
              </button>
            )}

            <Link 
              href="/dictionaries"
              className="btn-primary-action"
            >
              Explore
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-hamburger-btn mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <IconX size={24} />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Backdrop & Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="mobile-nav-backdrop mobile-only"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="mobile-nav-drawer mobile-only">
              {currentUser && (
                <div style={{
                  background: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#1362dc',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getInitials(currentUser)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser}
                      </div>
                      <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                        Active Session
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Link
                  href="/"
                  className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Home</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
                <Link
                  href="/dictionaries"
                  className={`mobile-nav-link ${isActive('/dictionaries') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Dictionaries</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
                <Link
                  href="/lexicons"
                  className={`mobile-nav-link ${isActive('/lexicons') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Lexicons</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
                <Link
                  href="/stories"
                  className={`mobile-nav-link ${isActive('/stories') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Stories</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
                <button
                  type="button"
                  className="mobile-nav-link"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAbout();
                  }}
                >
                  <span>About Project</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </nav>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!currentUser && (
                  <button 
                    className="btn-sign-in"
                    style={{ width: '100%', height: '44px', justifyContent: 'center' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                  >
                    Sign in
                  </button>
                )}
                <Link 
                  href="/dictionaries"
                  className="btn-primary-action"
                  style={{ width: '100%', height: '44px', justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore Dictionaries
                </Link>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
};
