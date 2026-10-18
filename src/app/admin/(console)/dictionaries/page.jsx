'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminConfirmDialog, AdminHeader, useToast } from '../../../../components/admin/AdminShell';

const EMPTY = { wordForm: '', otherForms: '', dialect: '', partOfSpeech: '', otherParts: '', pronunciation_url: '', audioData: '' };

export default function AdminDictionariesPage() {
  const { show, node } = useToast();
  const [lang, setLang] = useState('massa');
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [letterData, setLetterData] = useState({ letters: [], counts: {} });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ words: [], pagination: { total: 0, totalPages: 1, page: 1 } });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ search, page: String(page), limit: '15' });
    if (selectedLetter) q.set('letter', selectedLetter);
    fetch(`/api/admin/${lang}/words?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => show(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [lang, search, page, selectedLetter]);

  const loadLetters = useCallback(() => {
    fetch(`/api/admin/${lang}/letters`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error || 'Could not load dictionary letters');
        setLetterData({ letters: d.letters || [], counts: d.counts || {} });
      })
      .catch((e) => show(e.message, 'error'));
  }, [lang]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadLetters(); }, [loadLetters]);

  const openCreate = () => {
    setForm(EMPTY);
    setModal({ mode: 'create' });
  };

  const openEdit = (word) => {
    setForm({
      wordForm: word.wordForm || '',
      otherForms: word.otherForms || '',
      dialect: word.dialect || '',
      partOfSpeech: word.partOfSpeech || '',
      otherParts: word.otherParts || '',
      pronunciation_url: word.pronunciation_url || '',
      audioData: ''
    });
    setModal({ mode: 'edit', id: word.id });
  };

  const save = async (e) => {
    e.preventDefault();
    const url = modal.mode === 'create'
      ? `/api/admin/${lang}/words`
      : `/api/admin/${lang}/words/${modal.id}`;
    const res = await fetch(url, {
      method: modal.mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Save failed', 'error');
      return;
    }
    setModal(null);
    show(modal.mode === 'create' ? 'Entry created' : 'Entry updated');
    load();
    loadLetters();
  };

  const remove = async (word) => {
    const res = await fetch(`/api/admin/${lang}/words/${word.id}`, { method: 'DELETE' });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Delete failed', 'error');
      return;
    }
    show('Entry deleted', 'warning');
    load();
    loadLetters();
  };

  const fields = lang === 'massa'
    ? ['wordForm', 'otherForms', 'dialect', 'partOfSpeech', 'otherParts', 'pronunciation_url']
    : ['wordForm', 'otherForms', 'partOfSpeech', 'otherParts', 'pronunciation_url'];

  return (
    <>
      {node}
      <AdminHeader
        title="Dictionaries"
        subtitle="Select a dictionary, then create, edit, or remove entries using that language’s fields"
        actions={<button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add entry</button>}
      />
      <div className="admin-content">
        <div className="admin-toolbar">
          <select className="admin-select" value={lang} onChange={(e) => { setLang(e.target.value); setSelectedLetter(''); setPage(1); }}>
            <option value="massa">Massa dictionary</option>
            <option value="gizey">Gizey dictionary</option>
          </select>
          <input className="admin-search" placeholder="Search word form…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="admin-letter-filter" aria-label={`${lang === 'gizey' ? 'Gizey' : 'Massa'} dictionary initial letters`}>
          <div className="admin-letter-filter-head">
            <span>Browse {lang === 'gizey' ? 'Gizey' : 'Massa'} initials</span>
            <small>{selectedLetter ? `${letterData.counts[selectedLetter] || 0} entries` : `${letterData.letters.length} available letters`}</small>
          </div>
          <div className="admin-letter-tabs">
            <button type="button" className={!selectedLetter ? 'active' : ''} onClick={() => { setSelectedLetter(''); setPage(1); }}>All</button>
            {letterData.letters.map((letter) => (
              <button type="button" key={letter} className={selectedLetter === letter ? 'active' : ''} onClick={() => { setSelectedLetter(letter); setPage(1); }} title={`${letterData.counts[letter] || 0} entries starting with ${letter}`}>
                {letter}<span>{letterData.counts[letter] || 0}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="admin-schema">
          {fields.map((f) => <span key={f}>{f}</span>)}
        </div>
        <div className="admin-card">
          {loading ? <div className="admin-empty">Loading entries…</div> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>POS</th>
                  {lang === 'massa' ? <th>Dialect</th> : null}
                  <th>Definition / other parts</th>
                  <th>Audio</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.words.map((word) => (
                  <tr key={word.id}>
                    <td>
                      <strong>{word.wordForm}</strong>
                      {word.otherForms ? <div style={{ color: '#64748b' }}>{word.otherForms}</div> : null}
                    </td>
                    <td><span className="admin-badge admin-badge-slate">{word.partOfSpeech || '—'}</span></td>
                    {lang === 'massa' ? <td>{word.dialect || '—'}</td> : null}
                    <td style={{ maxWidth: 320, whiteSpace: 'pre-line' }}>{(word.otherParts || '—').slice(0, 180)}</td>
                    <td>
                      {word.pronunciation_url ? (
                        <audio controls preload="none" src={word.pronunciation_url} style={{ height: 32, width: 160 }} />
                      ) : '—'}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(word)}>Edit</button>
                        <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setConfirm({ title: 'Delete dictionary entry?', message: `“${word.wordForm}” will be permanently removed from the ${lang === 'gizey' ? 'Gizey' : 'Massa'} dictionary.`, onConfirm: () => remove(word) })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="admin-pagination">
            <span>{data.pagination.total.toLocaleString()} entries</span>
            <div className="admin-page-btns">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              <button type="button" className="active">{page}</button>
              <button type="button" disabled={page >= (data.pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          </div>
        </div>
      </div>

      {modal ? (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className="admin-modal-head">
              <h3>{modal.mode === 'create' ? 'Add dictionary entry' : 'Edit dictionary entry'}</h3>
              <button type="button" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-grid-2">
                <div className="admin-field">
                  <label>wordForm</label>
                  <input className="admin-input" required value={form.wordForm} onChange={(e) => setForm({ ...form, wordForm: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>partOfSpeech</label>
                  <input className="admin-input" required value={form.partOfSpeech} onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })} />
                </div>
              </div>
              <div className="admin-field">
                <label>otherForms</label>
                <input className="admin-input" value={form.otherForms} onChange={(e) => setForm({ ...form, otherForms: e.target.value })} />
              </div>
              {lang === 'massa' ? (
                <div className="admin-field">
                  <label>dialect</label>
                  <input className="admin-input" value={form.dialect} onChange={(e) => setForm({ ...form, dialect: e.target.value })} />
                </div>
              ) : null}
              <div className="admin-field">
                <label>otherParts</label>
                <textarea className="admin-textarea" value={form.otherParts} onChange={(e) => setForm({ ...form, otherParts: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>pronunciation_url</label>
                <input className="admin-input" value={form.pronunciation_url} onChange={(e) => setForm({ ...form, pronunciation_url: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Upload audio</label>
                <input
                  className="admin-input"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setForm((prev) => ({ ...prev, audioData: reader.result }));
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
              {form.pronunciation_url || form.audioData ? (
                <audio controls src={form.audioData || form.pronunciation_url} style={{ width: '100%' }} />
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save</button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
      <AdminConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
