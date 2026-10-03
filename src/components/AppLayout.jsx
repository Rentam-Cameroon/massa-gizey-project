'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthModal } from './AuthModal';
import { AboutModal } from './AboutModal';

export function AppLayout({ children }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Hydrate user from localStorage if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('massa_current_user');
      if (savedUser) {
        setCurrentUser(savedUser);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLoginSuccess = (name) => {
    setCurrentUser(name);
    try {
      localStorage.setItem('massa_current_user', name);
    } catch {
      // ignore
    }
    setToastMessage(`Welcome back, ${name}!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('massa_current_user');
    } catch {
      // ignore
    }
    setToastMessage('You have been logged out.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#1362dc',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(19, 98, 220, 0.3)',
          zIndex: 5000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      <Header
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        {children}
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
}
