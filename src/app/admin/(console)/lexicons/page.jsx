'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminConfirmDialog, AdminHeader, useToast } from '../../../../components/admin/AdminShell';

export default function AdminLexiconsPage() {
  const { show, node } = useToast();
  const [lang, setLang] = useState('massa');
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [letterData, setLetterData] = useState({ letters: [], counts: {} });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pagination: { total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ french: '', massa: '', gizey: '' });

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ search, page: String(page), limit: '20' });
    if (selectedLetter) q.set('letter', selectedLetter);
    fetch(`/api/admin/${lang}/lexicon?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => show(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [lang, search, page, selectedLetter]);

  const loadLetters = useCallback(() => {
    fetch(`/api/admin/${lang}/lexicon/letters`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error || 'Could not load lexicon letters');
        setLetterData({ letters: d.letters || [], counts: d.counts || {} });
      })
      .catch((e) => show(e.message, 'error'));
  }, [lang]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadLetters(); }, [loadLetters]);

  const openCreate = () => {
    setForm({ french: '', massa: '', gizey: '' });
    setModal({ mode: 'create' });
  };

  const openEdit = (item) => {
    setForm({ french: item.french || '', massa: item.massa || '', gizey: item.gizey || '' });
    setModal({ mode: 'edit', id: item.id });
  };

  const save = async (e) => {
    e.preventDefault();
    const url = modal.mode === 'create' ? `/api/admin/${lang}/lexicon` : `/api/admin/${lang}/lexicon/${modal.id}`;
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
    show('Lexicon pair saved');
    load();
    loadLetters();
  };

  const remove = async (item) => {
    const res = await fetch(`/api/admin/${lang}/lexicon/${item.id}`, { method: 'DELETE' });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Delete failed', 'error');
      return;
    }
    show('Lexicon pair deleted', 'warning');
    load();
    loadLetters();
  };

  return (
    <>
      {node}
      <AdminHeader
        title="Lexicons"
        subtitle="French — Massa and French — Gizey bilingual pairs"
        actions={<button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add pair</button>}
      />
      <div className="admin-content">
        <div className="admin-toolbar">
          <select className="admin-select" value={lang} onChange={(e) => { setLang(e.target.value); setSelectedLetter(''); setPage(1); }}>
            <option value="massa">French — Massa</option>
            <option value="gizey">French — Gizey</option>
          </select>
          <input className="admin-search" placeholder="Search French or target language…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="admin-letter-filter" aria-label={`${lang === 'gizey' ? 'Gizey' : 'Massa'} lexicon initial letters`}>
          <div className="admin-letter-filter-head">
            <span>Browse {lang === 'gizey' ? 'Gizey' : 'Massa'} terms by first letter</span>
            <small>{selectedLetter ? `${letterData.counts[selectedLetter] || 0} pairs` : `${letterData.letters.length} available letters`}</small>
          </div>
          <div className="admin-letter-tabs">
            <button type="button" className={!selectedLetter ? 'active' : ''} onClick={() => { setSelectedLetter(''); setPage(1); }}>All</button>
            {letterData.letters.map((letter) => (
              <button type="button" key={letter} className={selectedLetter === letter ? 'active' : ''} onClick={() => { setSelectedLetter(letter); setPage(1); }} title={`${letterData.counts[letter] || 0} pairs starting with ${letter}`}>
                {letter}<span>{letterData.counts[letter] || 0}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="admin-schema">
          <span>french</span>
          <span>{lang}</span>
          <span>created_at</span>
          <span>updated_at</span>
        </div>
        <div className="admin-card">
          {loading ? <div className="admin-empty">Loading lexicon…</div> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>French</th>
                  <th>{lang === 'gizey' ? 'Gizey' : 'Massa'}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(data.items || []).map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.french}</strong></td>
                    <td>{lang === 'gizey' ? item.gizey : item.massa}</td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(item)}>Edit</button>
                        <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setConfirm({ title: 'Delete lexicon pair?', message: `The French entry “${item.french}” and its ${lang === 'gizey' ? 'Gizey' : 'Massa'} translation will be permanently removed.`, onConfirm: () => remove(item) })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="admin-pagination">
            <span>{(data.pagination?.total || 0).toLocaleString()} pairs</span>
            <div className="admin-page-btns">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              <button type="button" className="active">{page}</button>
              <button type="button" disabled={page >= (data.pagination?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          </div>
        </div>
      </div>
      {modal ? (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className="admin-modal-head">
              <h3>{modal.mode === 'create' ? 'Add lexical pair' : 'Edit lexical pair'}</h3>
              <button type="button" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-field">
                <label>French</label>
                <input className="admin-input" required value={form.french} onChange={(e) => setForm({ ...form, french: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>{lang === 'gizey' ? 'Gizey' : 'Massa'}</label>
                <input
                  className="admin-input"
                  required
                  value={lang === 'gizey' ? form.gizey : form.massa}
                  onChange={(e) => setForm({ ...form, [lang]: e.target.value })}
                />
              </div>
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
