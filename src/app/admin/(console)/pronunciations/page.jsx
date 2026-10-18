'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminConfirmDialog, AdminHeader, useToast } from '../../../../components/admin/AdminShell';

export default function AdminPronunciationsPage() {
  const { show, node } = useToast();
  const [lang, setLang] = useState('massa');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pagination: { total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ search, page: String(page), limit: '20' });
    fetch(`/api/admin/pronunciations/${lang}?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => show(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [lang, search, page]);

  useEffect(() => { load(); }, [load]);

  const act = async (item, action) => {
    const res = await fetch(`/api/admin/pronunciations/${lang}/${item.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Action failed', 'error');
      return;
    }
    show(action === 'accept'
      ? `Accepted. Audio is now on the ${lang === 'gizey' ? 'Gizey' : 'Massa'} dictionary entry.`
      : 'Recording rejected and deleted', action === 'accept' ? 'success' : 'warning');
    load();
  };

  const askReject = (item) => setConfirm({
    title: 'Reject pronunciation recording?',
    message: `The recording for “${item.word_form}” will be rejected and permanently deleted.`,
    confirmLabel: 'Reject and delete',
    onConfirm: () => act(item, 'reject')
  });

  const askAccept = (item) => setConfirm({
    tone: 'positive',
    title: 'Accept this pronunciation?',
    message: `This recording will replace the pronunciation audio on the matching ${lang === 'gizey' ? 'Gizey' : 'Massa'} dictionary entry for “${item.word_form}”.`,
    confirmLabel: 'Accept recording',
    onConfirm: () => act(item, 'accept')
  });

  return (
    <>
      {node}
      <AdminHeader
        title="Pronunciation review"
        subtitle="Listen to contributed audio. Accepting attaches it to the matching dictionary word; rejecting deletes the contribution."
      />
      <div className="admin-content">
        <div className="admin-toolbar">
          <select className="admin-select" value={lang} onChange={(e) => { setLang(e.target.value); setPage(1); }}>
            <option value="massa">Massa recordings</option>
            <option value="gizey">Gizey recordings</option>
          </select>
          <input
            className="admin-search"
            placeholder="Search by word form…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="admin-card">
          {loading ? <div className="admin-empty">Loading contributions…</div> : (data.items || []).length === 0 ? (
            <div className="admin-empty">No pronunciation contributions waiting for review.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Listen</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.word_form}</strong></td>
                    <td>
                      {item.pronunciation_url ? (
                        <audio controls preload="metadata" src={item.pronunciation_url} style={{ height: 36, width: 260 }} />
                      ) : 'Missing file'}
                    </td>
                    <td>{item.created_at || '—'}</td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-success admin-btn-sm" onClick={() => askAccept(item)}>Accept</button>
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
      <AdminConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
