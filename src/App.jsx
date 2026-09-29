import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/AboutModal';

import { HomeScreen } from './screens/HomeScreen';
import { DictionariesScreen } from './screens/DictionariesScreen';
import { LexiconsScreen } from './screens/LexiconsScreen';
import { VideoStoriesScreen } from './screens/VideoStoriesScreen';
import { EnglishDictionaryScreen } from './screens/EnglishDictionaryScreen';
import { ComputingLexiconScreen } from './screens/ComputingLexiconScreen';
import { VideoStoryDetailScreen } from './screens/VideoStoryDetailScreen';

export function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenParams, setScreenParams] = useState({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userNotification, setUserNotification] = useState('');

  const navigateTo = (screen, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchWord = (word) => {
    navigateTo('english-dictionary', { word });
  };

  const handleLoginSuccess = (name) => {
    setCurrentUser(name);
    setUserNotification(`Welcome back, ${name}!`);
    setTimeout(() => setUserNotification(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert */}
      {userNotification && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '24px',
          background: '#1362dc',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(19, 98, 220, 0.3)',
          zIndex: 4000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {userNotification}
        </div>
      )}

      {/* Header */}
      <Header
        currentScreen={currentScreen}
        currentUser={currentUser}
        onNavigate={navigateTo}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
      />

      {/* Screen Views */}
      <main style={{ flex: 1 }}>
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={navigateTo}
            onSearchWord={handleSearchWord}
          />
        )}

        {currentScreen === 'dictionaries' && (
          <DictionariesScreen
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'lexicons' && (
          <LexiconsScreen
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'stories' && (
          <VideoStoriesScreen
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'english-dictionary' && (
          <EnglishDictionaryScreen
            onNavigate={navigateTo}
            initialWord={screenParams.word}
          />
        )}

        {currentScreen === 'computing-lexicon' && (
          <ComputingLexiconScreen
            onNavigate={navigateTo}
            lexiconTitle={screenParams.lexiconTitle}
          />
        )}

        {currentScreen === 'story-detail' && (
          <VideoStoryDetailScreen
            onNavigate={navigateTo}
            storyId={screenParams.storyId || 'why-words-travel'}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        isHome={currentScreen === 'home'}
        onNavigate={navigateTo}
      />

      {/* Modals */}
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

export default App;
