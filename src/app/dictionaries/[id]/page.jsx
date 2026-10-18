'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { IconVolume, IconSearch, IconX } from '../../../components/Icons';
import { PronunciationModal } from '../../../components/PronunciationModal';

export default function DictionaryDetailPage({ params }) {
  const resolvedParams = use(params);
  const dictionary = (resolvedParams.id || 'massa').toLowerCase() === 'gizey' ? 'gizey' : 'massa';
  const dictName = dictionary === 'gizey' ? 'Gizey' : 'Massa';

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [availableLetters, setAvailableLetters] = useState([]);
  const [letterCounts, setLetterCounts] = useState({});

  // Audio playback state
  const [playingWordId, setPlayingWordId] = useState(null);
  const audioPlayerRef = useRef(null);

  // Missing pronunciation modal state
  const [pronunciationModalWord, setPronunciationModalWord] = useState(null);

  // Suggestion modal state
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    spelling: '',
    dialect: '',
    part_of_speech: 'noun',
    meaning_1: '',
    example_1: '',
    translation_1: '',
    pronunciation_url: '',
    audioData: null
  });
  const [suggestRecording, setSuggestRecording] = useState(false);
  const [suggestAudioPreview, setSuggestAudioPreview] = useState(null);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);

  const suggestMediaRecorderRef = useRef(null);
  const suggestChunksRef = useRef([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 1. Fetch dynamic initial letters directly from the dictionary database
  useEffect(() => {
    let ignore = false;
    fetch(`/api/${dictionary}/letters`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setAvailableLetters(data.letters || []);
          setLetterCounts(data.counts || {});
        }
      })
      .catch((err) => console.error('Error fetching letters:', err));

    return () => {
      ignore = true;
    };
  }, [dictionary]);

  // 2. Fetch words based on search, selected letter, and page
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (selectedLetter) queryParams.set('letter', selectedLetter);
    queryParams.set('page', page.toString());
    queryParams.set('limit', '15');

    fetch(`/api/${dictionary}/words?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setWords(data.words || []);
          setPagination(data.pagination || { total: 0, totalPages: 1, page: 1 });
        }
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [dictionary, search, selectedLetter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClear = () => {
    setSearch('');
    setSelectedLetter('');
    setPage(1);
  };

  // 3. Audio Pronunciation Handler
  const handlePlayPronunciation = (item) => {
    if (item.pronunciation_url) {
      if (playingWordId === item.id) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        setPlayingWordId(null);
        return;
      }

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }

      const audio = new Audio(item.pronunciation_url);
      audioPlayerRef.current = audio;
      setPlayingWordId(item.id);

      audio.onended = () => {
        setPlayingWordId(null);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        setPlayingWordId(null);
        audioPlayerRef.current = null;
        // If playback failed, open modal to allow fixing/recording new pronunciation
        setPronunciationModalWord(item);
      };

      audio.play().catch((err) => {
        console.error('Playback error:', err);
        setPlayingWordId(null);
      });
    } else {
      // Requirement 3: If there is no pronunciation attached yet, show popup modal!
      setPronunciationModalWord(item);
    }
  };

  // Callback when user submits pronunciation for admin review
  const handlePronunciationSaved = (savedWord) => {
    showToast(`Pronunciation for “${savedWord.wordForm}” is waiting for editor review.`);
  };

  // Voice recording inside "Suggest a Word" form (Requirement 4)
  const startSuggestRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported by your browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      suggestChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      suggestMediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          suggestChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(suggestChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setSuggestAudioPreview(url);

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setSuggestForm((f) => ({ ...f, audioData: reader.result }));
        };
      };

      recorder.start();
      setSuggestRecording(true);
    } catch (err) {
      alert('Unable to access microphone: ' + err.message);
    }
  };

  const stopSuggestRecording = () => {
    if (suggestMediaRecorderRef.current && suggestMediaRecorderRef.current.state === 'recording') {
      suggestMediaRecorderRef.current.stop();
    }
    setSuggestRecording(false);
  };

  const handleSuggestFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSuggestAudioPreview(url);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setSuggestForm((f) => ({ ...f, audioData: reader.result }));
    };
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    setSuggestSubmitting(true);
    try {
      const res = await fetch(`/api/contributions/word/${dictionary}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestForm)
      });
      const data = await res.json();
      if (data.success) {
        setSuggestSuccess(true);
        setTimeout(() => {
          setSuggestSuccess(false);
          setSuggestModalOpen(false);
          setSuggestAudioPreview(null);
          setSuggestForm({
            spelling: '',
            dialect: '',
            part_of_speech: 'noun',
            meaning_1: '',
            example_1: '',
            translation_1: '',
            pronunciation_url: '',
            audioData: null
          });
          showToast(`✓ Your suggestion has been recorded!`);
        }, 1200);
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSuggestSubmitting(false);
    }
  };

  return (
    <div className="dictionary-detail-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#16a34a',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.3)',
          zIndex: 5000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      <Breadcrumbs 
        items={[
          { label: 'Dictionaries', href: '/dictionaries' },
          { label: `${dictName} Dictionary` }
        ]} 
      />

      <div className="container">
        {/* Header */}
        <div style={{ 
          marginTop: '8px', 
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="card-badge-category" style={{ background: '#f1f5f9', color: '#0f172a' }}>
                Primary Dictionary
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {dictionary === 'massa' ? 'Massa (Chadic / Chad-Cameroon)' : 'Gizey (Massa Group)'}
              </span>
            </div>
            <h1 className="page-title">{dictName} Dictionary</h1>
            <p className="page-subtitle" style={{ marginBottom: '6px' }}>
              Clear definitions, dialect variations, and authentic contextual examples for everyday {dictName}.
            </p>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              {pagination.total ? `${pagination.total.toLocaleString()} documented entries` : 'Loading entries...'}
            </p>
          </div>

          <button
            onClick={() => setSuggestModalOpen(true)}
            className="btn-primary-action"
            style={{ padding: '10px 20px' }}
          >
            + Suggest a Word
          </button>
        </div>

        {/* Search Input Box */}
        <div style={{ marginBottom: '28px' }}>
          <form 
            onSubmit={handleSearchSubmit}
            className="search-input-group"
            style={{ maxWidth: '680px' }}
          >
            <div className="search-field-wrapper">
              <span className="search-icon-inside">
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={`Search for a ${dictName} word or meaning...`}
                className="search-input-base"
              />
            </div>
            <button type="submit" className="search-btn-primary">
              Search
            </button>
            {(search || selectedLetter) && (
              <button 
                type="button" 
                className="search-btn-clear"
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Letter Navigation Bar (Requirement 1: Phonetic & Authentic Initial Letters) */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Skip directly to letter ({availableLetters.length} phonetic &amp; initial keys)
            </div>
            {selectedLetter && (
              <button
                onClick={() => { setSelectedLetter(''); setPage(1); }}
                style={{ fontSize: '12px', color: '#1362dc', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Show all words
              </button>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '6px', 
            background: '#ffffff', 
            padding: '12px 14px', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <button
              className={`filter-pill-btn ${selectedLetter === '' ? 'active' : ''}`}
              onClick={() => { setSelectedLetter(''); setPage(1); }}
              style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 600 }}
            >
              All
            </button>
            {availableLetters.map((letter) => {
              const count = letterCounts[letter];
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  className={`filter-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => { setSelectedLetter(letter); setPage(1); }}
                  title={`${count || 0} words starting with ${letter}`}
                  style={{ 
                    padding: '6px 10px', 
                    fontSize: '14px', 
                    minWidth: '36px', 
                    textAlign: 'center',
                    fontWeight: isSelected ? 700 : 500,
                    fontFamily: 'var(--font-display), sans-serif'
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Words List */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              Dictionary entries {selectedLetter ? `starting with "${selectedLetter}"` : ''}
              {search && <span style={{ fontWeight: 400, fontSize: '16px', color: '#64748b' }}> — matching &quot;{search}&quot;</span>}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing page {pagination.page} of {pagination.totalPages || 1} ({pagination.total.toLocaleString()} total entries)
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Searching {dictName} dictionary database...</div>
              <div style={{ fontSize: '13px' }}>Querying SQLite entries</div>
            </div>
          ) : words.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No words found</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Try searching another keyword or select a different initial letter.</p>
              <button className="btn-callout-outline" onClick={handleClear}>Clear Search &amp; Filters</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {words.map((item) => {
                const isPlaying = playingWordId === item.id;
                const hasPronunciation = Boolean(item.pronunciation_url);

                return (
                  <div 
                    key={item.id}
                    className="word-detail-card"
                    style={{ position: 'relative' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {item.wordForm}
                        </h3>
                        {item.otherForms && (
                          <span style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>
                            [{item.otherForms}]
                          </span>
                        )}
                        {item.dialect && (
                          <span style={{ fontSize: '12px', color: '#1362dc', background: '#eef5fd', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {item.dialect}
                          </span>
                        )}

                        {/* Audio Pronunciation Button */}
                        <button 
                          onClick={() => handlePlayPronunciation(item)}
                          title={hasPronunciation ? (isPlaying ? 'Pause pronunciation' : 'Listen to pronunciation') : 'No pronunciation attached - Click to add'}
                          style={{ 
                            background: isPlaying ? '#1362dc' : hasPronunciation ? '#eef5fd' : '#f8fafc',
                            color: isPlaying ? '#ffffff' : hasPronunciation ? '#1362dc' : '#64748b',
                            border: hasPronunciation ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                          aria-label={hasPronunciation ? 'Play pronunciation' : 'Add pronunciation'}
                        >
                          <IconVolume size={16} />
                        </button>
                      </div>

                      <span className="filter-pill-btn" style={{ fontSize: '12px', padding: '4px 10px', background: '#f1f5f9', border: 'none', color: '#334155' }}>
                        {item.partOfSpeech || 'n/a'}
                      </span>
                    </div>

                    {item.otherParts && (
                      <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {item.otherParts}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '36px' }}>
              <button
                disabled={page <= 1}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className="btn-callout-outline"
                style={{ opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => { setPage((p) => Math.min(pagination.totalPages, p + 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className="btn-callout-outline"
                style={{ opacity: page >= pagination.totalPages ? 0.4 : 1, cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Related resources section */}
        <div style={{ margin: '64px 0 48px 0', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
            Related resources
          </h2>

          <div className="cards-grid-2">
            <Link 
              href={`/lexicons/${dictionary}`}
              className="directory-card"
              style={{ padding: '24px' }}
            >
              <h3 className="card-title" style={{ fontSize: '17px', marginBottom: '6px' }}>
                French — {dictName} Lexicon
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Explore thousands of verified French-to-{dictName} vocabulary translations.
              </p>
            </Link>

            <Link 
              href="/stories"
              className="directory-card"
              style={{ padding: '24px' }}
            >
              <h3 className="card-title" style={{ fontSize: '17px', marginBottom: '6px' }}>
                Video Stories
              </h3>
              <p className="card-description" style={{ marginBottom: 0 }}>
                Watch short documentary stories about regional history and dialect diversity.
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Requirement 3: Missing Pronunciation Recording/Upload Modal */}
      {pronunciationModalWord && (
        <PronunciationModal
          isOpen={Boolean(pronunciationModalWord)}
          onClose={() => setPronunciationModalWord(null)}
          word={pronunciationModalWord}
          dictionary={dictionary}
          onPronunciationSaved={handlePronunciationSaved}
        />
      )}

      {/* Requirement 4: Suggest a Word Modal with Pronunciation Audio Field */}
      {suggestModalOpen && (
        <div className="modal-overlay" onClick={() => setSuggestModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '92%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Suggest a {dictName} Word</h3>
              <button className="modal-close-btn" onClick={() => setSuggestModalOpen(false)}>
                <IconX size={20} />
              </button>
            </div>

            <div className="modal-body">
              {suggestSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ color: '#16a34a', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                    ✓ Word Submitted!
                  </div>
                  <p style={{ color: '#475569', fontSize: '14px' }}>
                    Thank you for contributing to the {dictName} dictionary archive.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSuggestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      Word Spelling *
                    </label>
                    <input
                      type="text"
                      required
                      value={suggestForm.spelling}
                      onChange={(e) => setSuggestForm({ ...suggestForm, spelling: e.target.value })}
                      placeholder={`e.g. ${dictionary === 'massa' ? 'gùrjúnà' : 'dàfà'}`}
                      className="search-input-base"
                      style={{ paddingLeft: '14px', height: '42px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                        Part of Speech *
                      </label>
                      <select
                        value={suggestForm.part_of_speech}
                        onChange={(e) => setSuggestForm({ ...suggestForm, part_of_speech: e.target.value })}
                        className="sort-select"
                        style={{ width: '100%', height: '42px' }}
                      >
                        <option value="noun">Noun (n)</option>
                        <option value="verb">Verb (v)</option>
                        <option value="adjective">Adjective (adj)</option>
                        <option value="interjection">Interjection (interj)</option>
                        <option value="ideophone">Ideophone (id)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                        Dialect (optional)
                      </label>
                      <input
                        type="text"
                        value={suggestForm.dialect}
                        onChange={(e) => setSuggestForm({ ...suggestForm, dialect: e.target.value })}
                        placeholder="e.g. Gumay, Haara"
                        className="search-input-base"
                        style={{ paddingLeft: '14px', height: '42px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      Meaning / Definition
                    </label>
                    <textarea
                      rows={2}
                      value={suggestForm.meaning_1}
                      onChange={(e) => setSuggestForm({ ...suggestForm, meaning_1: e.target.value })}
                      placeholder="Explain the meaning in French or English..."
                      className="search-input-base"
                      style={{ height: 'auto', padding: '10px 14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      Example sentence
                    </label>
                    <input
                      type="text"
                      value={suggestForm.example_1}
                      onChange={(e) => setSuggestForm({ ...suggestForm, example_1: e.target.value })}
                      placeholder="Use the word in an authentic sentence..."
                      className="search-input-base"
                      style={{ paddingLeft: '14px', height: '42px' }}
                    />
                  </div>

                  {/* Requirement 4: Pronunciation Field (Optional) */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px'
                  }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      Pronunciation (Optional)
                    </label>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>
                      Record your voice with microphone, upload an audio clip, or paste a link.
                    </p>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {suggestRecording ? (
                        <button
                          type="button"
                          onClick={stopSuggestRecording}
                          style={{
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          ⏹ Stop Recording
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startSuggestRecording}
                          className="btn-callout-outline"
                          style={{ fontSize: '13px', padding: '8px 14px' }}
                        >
                          🎙️ Record Voice
                        </button>
                      )}

                      <label style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: '#334155'
                      }}>
                        📁 Upload Audio
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleSuggestFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {suggestAudioPreview && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginBottom: '4px' }}>
                          ✓ Pronunciation audio attached
                        </div>
                        <audio controls src={suggestAudioPreview} style={{ width: '100%', height: '36px' }} />
                      </div>
                    )}

                    <div style={{ marginTop: '10px' }}>
                      <input
                        type="url"
                        value={suggestForm.pronunciation_url}
                        onChange={(e) => setSuggestForm({ ...suggestForm, pronunciation_url: e.target.value })}
                        placeholder="Or enter audio URL (e.g. https://.../audio.mp3)"
                        className="search-input-base"
                        style={{ paddingLeft: '12px', height: '38px', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="search-btn-clear"
                      onClick={() => setSuggestModalOpen(false)}
                      style={{ height: '40px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={suggestSubmitting}
                      className="search-btn-primary"
                      style={{ height: '40px', padding: '0 20px' }}
                    >
                      {suggestSubmitting ? 'Submitting...' : 'Submit Contribution'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
