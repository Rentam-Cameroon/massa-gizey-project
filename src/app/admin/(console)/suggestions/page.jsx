'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminConfirmDialog, AdminHeader, useToast } from '../../../../components/admin/AdminShell';

const EMPTY = {
  spelling: '',
  dialect: '',
  part_of_speech: '',
  meaning_1: '',
  meaning_2: '',
  meaning_3: '',
  example_1: '',
  example_2: '',
  example_3: '',
  translation_1: '',
  translation_2: '',
  translation_3: '',
  pronunciation_url: ''
};

export default function AdminSuggestionsPage() {
  const { show, node } = useToast();
  const [lang, setLang] = useState('massa');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pagination: { total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ search, page: String(page), limit: '15' });
    fetch(`/api/admin/suggestions/${lang}?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => show(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [lang, search, page]);

  useEffect(() => { load(); }, [load]);

  const openReview = (item) => {
    setForm({
      spelling: item.spelling || '',
      dialect: item.dialect || '',
      part_of_speech: item.part_of_speech || '',
      meaning_1: item.meaning_1 || '',
      meaning_2: item.meaning_2 || '',
      meaning_3: item.meaning_3 || '',
      example_1: item.example_1 || '',
      example_2: item.example_2 || '',
      example_3: item.example_3 || '',
      translation_1: item.translation_1 || '',
      translation_2: item.translation_2 || '',
      translation_3: item.translation_3 || '',
      pronunciation_url: item.pronunciation_url || ''
    });
    setModal({ item });
  };

  const saveEdits = async () => {
    const res = await fetch(`/api/admin/suggestions/${lang}/${modal.item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Could not save changes', 'error');
      return false;
    }
    return true;
  };

  const accept = async () => {
    const saved = await saveEdits();
    if (!saved) return;
    const res = await fetch(`/api/admin/suggestions/${lang}/${modal.item.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', overrides: form })
    });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Accept failed', 'error');
      return;
    }
    setModal(null);
    show(`Accepted into the ${lang === 'gizey' ? 'Gizey' : 'Massa'} dictionary`, 'success');
    load();
  };

  const reject = async (item) => {
    const res = await fetch(`/api/admin/suggestions/${lang}/${item.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' })
    });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Reject failed', 'error');
      return;
    }
    setModal(null);
    show('Suggestion rejected and deleted', 'warning');
    load();
  };

  const askReject = (item) => setConfirm({
    title: 'Reject word suggestion?',
    message: `“${item.spelling}” will be rejected and permanently deleted from the review queue.`,
    confirmLabel: 'Reject and delete',
    onConfirm: () => reject(item)
  });

  const askAccept = () => setConfirm({
    tone: 'positive',
    title: 'Accept this word suggestion?',
    message: `The edited entry will be added to the ${lang === 'gizey' ? 'Gizey' : 'Massa'} dictionary, and the pending suggestion will be removed.`,
    confirmLabel: 'Accept suggestion',
    onConfirm: accept
  });

  return (
    <>
      {node}
      <AdminHeader
        title="Word suggestions"
        subtitle="Review learner submissions. You can edit a suggestion, accept it into the matching dictionary, or reject it (deleted immediately)."
      />
      <div className="admin-content">
        <div className="admin-toolbar">
          <select className="admin-select" value={lang} onChange={(e) => { setLang(e.target.value); setPage(1); }}>
            <option value="massa">Massa suggestions</option>
            <option value="gizey">Gizey suggestions</option>
          </select>
          <input
            className="admin-search"
            placeholder="Search spelling, POS, or meaning…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="admin-card">
          {loading ? <div className="admin-empty">Loading suggestions…</div> : (data.items || []).length === 0 ? (
            <div className="admin-empty">No pending word suggestions for this dictionary.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Spelling</th>
                  <th>POS</th>
                  {lang === 'massa' ? <th>Dialect</th> : null}
                  <th>Meaning</th>
                  <th>Audio</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.spelling}</strong></td>
                    <td><span className="admin-badge admin-badge-slate">{item.part_of_speech || '—'}</span></td>
                    {lang === 'massa' ? <td>{item.dialect || '—'}</td> : null}
                    <td style={{ maxWidth: 280 }}>{item.meaning_1 || '—'}</td>
                    <td>
                      {item.pronunciation_url ? (
                        <audio controls preload="none" src={item.pronunciation_url} style={{ height: 32, width: 160 }} />
                      ) : '—'}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openReview(item)}>Review</button>
                        <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => askReject(item)}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="admin-pagination">
            <span>{(data.pagination?.total || 0).toLocaleString()} pending</span>
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
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Review suggestion</h3>
              <button type="button" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              {form.pronunciation_url ? (
                <div className="admin-field">
                  <label>Submitted audio</label>
                  <audio controls src={form.pronunciation_url} style={{ width: '100%' }} />
                </div>
              ) : null}
              <div className="admin-grid-2">
                <div className="admin-field">
                  <label>Spelling</label>
                  <input className="admin-input" value={form.spelling} onChange={(e) => setForm({ ...form, spelling: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Part of speech</label>
                  <input className="admin-input" value={form.part_of_speech} onChange={(e) => setForm({ ...form, part_of_speech: e.target.value })} />
                </div>
              </div>
              {lang === 'massa' ? (
                <div className="admin-field">
                  <label>Dialect</label>
                  <input className="admin-input" value={form.dialect} onChange={(e) => setForm({ ...form, dialect: e.target.value })} />
                </div>
              ) : null}
              {[1, 2, 3].map((n) => (
                <div key={n} className="admin-grid-2">
                  <div className="admin-field">
                    <label>Meaning {n}</label>
                    <textarea className="admin-textarea" value={form[`meaning_${n}`]} onChange={(e) => setForm({ ...form, [`meaning_${n}`]: e.target.value })} />
                  </div>
                  <div className="admin-field">
                    <label>Example {n}</label>
                    <textarea className="admin-textarea" value={form[`example_${n}`]} onChange={(e) => setForm({ ...form, [`example_${n}`]: e.target.value })} />
                  </div>
                  <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Translation {n}</label>
                    <input className="admin-input" value={form[`translation_${n}`]} onChange={(e) => setForm({ ...form, [`translation_${n}`]: e.target.value })} />
                  </div>
                </div>
              ))}
              <div className="admin-field">
                <label>Pronunciation URL</label>
                <input className="admin-input" value={form.pronunciation_url} onChange={(e) => setForm({ ...form, pronunciation_url: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Close</button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={async () => {
                    const ok = await saveEdits();
                    if (ok) {
                      show('Changes saved. This suggestion is still pending review.', 'info');
                      load();
                    }
                  }}
                >
                  Save edits
                </button>
                <button type="button" className="admin-btn admin-btn-danger" onClick={() => askReject(modal.item)}>Reject</button>
                <button type="button" className="admin-btn admin-btn-success" onClick={askAccept}>Accept into dictionary</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <AdminConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
