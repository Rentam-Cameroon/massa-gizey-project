'use client';

import React, { useState } from 'react';
import { IconX } from './Icons';

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(name || email.split('@')[0] || 'Learner');
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {tab === 'signin' ? 'Sign in to Massa Gizey Project' : 'Create an Account'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              className={`filter-pill-btn ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => setTab('signin')}
              style={{ flex: 1 }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
              style={{ flex: 1 }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tab === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jean-Paul Massa"
                  className="search-input-base"
                  style={{ paddingLeft: '14px', height: '42px' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="search-input-base"
                style={{ paddingLeft: '14px', height: '42px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="search-input-base"
                style={{ paddingLeft: '14px', height: '42px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-action"
              style={{ height: '44px', marginTop: '8px' }}
            >
              {loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginTop: '4px' }}>
              Sample account mode. Enter any email to continue.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
