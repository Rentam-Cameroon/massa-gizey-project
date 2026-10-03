'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IconX, IconVolume } from './Icons';

export function PronunciationModal({
  isOpen,
  onClose,
  word,
  dictionary,
  onPronunciationSaved
}) {
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [base64Audio, setBase64Audio] = useState(null);
  const [manualUrl, setManualUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputTab, setInputTab] = useState('record'); // 'record' | 'upload' | 'url'

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setRecording(false);
    setRecordTime(0);
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupRecording();
      setAudioBlob(null);
      setAudioUrl(null);
      setBase64Audio(null);
      setManualUrl('');
      setSaving(false);
      setSaveSuccess(false);
      setErrorMessage('');
      setInputTab('record');
    }
  }, [isOpen]);

  const startRecording = async () => {
    setErrorMessage('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Microphone access is not supported by your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setBase64Audio(reader.result);
        };
      };

      mediaRecorder.start(100);
      setRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((t) => {
          if (t >= 15) {
            // max 15 seconds for pronunciation
            stopRecording();
            return t;
          }
          return t + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
          : 'Unable to access microphone: ' + err.message
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setRecording(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setErrorMessage('Please select a valid audio file (e.g. .mp3, .wav, .m4a, .webm).');
      return;
    }

    setErrorMessage('');
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioBlob(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setBase64Audio(reader.result);
    };
  };

  const handleSave = async () => {
    if (!base64Audio && !manualUrl.trim()) {
      setErrorMessage('Please record your voice or provide an audio file/link.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/${dictionary}/pronunciation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: word?.id,
          wordForm: word?.wordForm,
          audioData: base64Audio,
          audioUrl: manualUrl.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save pronunciation');
      }

      setSaveSuccess(true);
      if (onPronunciationSaved) {
        onPronunciationSaved(word, data.pronunciation_url);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'Failed to save pronunciation');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !word) return null;

  const formatSeconds = (sec) => {
    const s = sec % 60;
    return `00:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '92%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#eef5fd',
              color: '#1362dc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <IconVolume size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>
                Pronunciation · {word.wordForm}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                No audio recorded yet. Record or upload a pronunciation below.
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              {errorMessage}
            </div>
          )}

          {saveSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a', marginBottom: '6px' }}>
                Pronunciation Attached!
              </h4>
              <p style={{ fontSize: '14px', color: '#475569' }}>
                The audio has been saved to the {dictionary === 'gizey' ? 'Gizey' : 'Massa'} database. You can now listen to it directly on the word card!
              </p>
            </div>
          ) : (
            <>
              {/* Option Tabs */}
              <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInputTab('record')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: inputTab === 'record' ? '#ffffff' : 'transparent',
                    color: inputTab === 'record' ? '#0f172a' : '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: inputTab === 'record' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  🎙️ Record Voice
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('upload')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: inputTab === 'upload' ? '#ffffff' : 'transparent',
                    color: inputTab === 'upload' ? '#0f172a' : '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: inputTab === 'upload' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  📁 Upload Audio File
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('url')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: inputTab === 'url' ? '#ffffff' : 'transparent',
                    color: inputTab === 'url' ? '#0f172a' : '#64748b',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: inputTab === 'url' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  🔗 Audio Link
                </button>
              </div>

              {/* Tab 1: Live Voice Recording */}
              {inputTab === 'record' && (
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '28px 20px',
                  textAlign: 'center',
                  background: recording ? '#fef2f2' : '#fafafa',
                  transition: 'all 0.2s ease'
                }}>
                  {recording ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        animation: 'pulse 1.2s infinite'
                      }}>
                        <div style={{ width: '18px', height: '18px', background: '#ffffff', borderRadius: '3px' }}></div>
                      </div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626' }}>
                          Recording... {formatSeconds(recordTime)}
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Speak clearly: &quot;{word.wordForm}&quot; (max 15s)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 20px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Stop Recording
                      </button>
                    </div>
                  ) : audioUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>
                        ✓ Voice recording ready ({formatSeconds(recordTime || 3)})
                      </div>
                      <audio controls src={audioUrl} style={{ width: '100%', maxWidth: '340px' }} />
                      <button
                        type="button"
                        onClick={startRecording}
                        className="search-btn-clear"
                        style={{ fontSize: '13px', padding: '6px 14px' }}
                      >
                        ↺ Record Again
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#eef5fd',
                        color: '#1362dc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="22"></line>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                          Record pronunciation for &quot;{word.wordForm}&quot;
                        </div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          Click the button below to start your microphone
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={startRecording}
                        className="btn-primary-action"
                        style={{ padding: '10px 24px' }}
                      >
                        🎙️ Start Recording
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: File Upload */}
              {inputTab === 'upload' && (
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  background: '#fafafa'
                }}>
                  <input
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      Choose an audio file from your device
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Supported formats: MP3, WAV, M4A, OGG, WebM (max 10MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-callout-outline"
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                    >
                      Browse Files
                    </button>
                    {audioUrl && (
                      <div style={{ width: '100%', marginTop: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, marginBottom: '6px' }}>
                          ✓ Selected file: {audioBlob?.name || 'audio clip'}
                        </div>
                        <audio controls src={audioUrl} style={{ width: '100%', maxWidth: '340px' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: URL input */}
              {inputTab === 'url' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Direct Audio URL
                  </label>
                  <input
                    type="url"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://example.com/audio/pronunciation.mp3"
                    className="search-input-base"
                    style={{ paddingLeft: '14px', height: '42px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Enter a direct link to an MP3, WAV, or audio stream.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  className="search-btn-clear"
                  onClick={onClose}
                  style={{ height: '42px', padding: '0 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || (!base64Audio && !manualUrl.trim())}
                  onClick={handleSave}
                  className="btn-primary-action"
                  style={{
                    height: '42px',
                    padding: '0 24px',
                    opacity: (!base64Audio && !manualUrl.trim()) ? 0.5 : 1,
                    cursor: (!base64Audio && !manualUrl.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save & Attach Pronunciation'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
