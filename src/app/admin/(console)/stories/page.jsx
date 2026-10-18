'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminConfirmDialog, AdminHeader, useToast } from '../../../../components/admin/AdminShell';
import { VideoPlayer } from '../../../../components/VideoPlayer';

const EMPTY = {
  title: '',
  category: 'LANGUAGE',
  topic: 'Language',
  description: '',
  full_description: '',
  duration: '',
  duration_formatted: '',
  speaker: '',
  video_url: '',
  thumbnail_url: '',
  hero_image_url: '',
  featured: false,
  vocabulary_text: ''
};

export default function AdminStoriesPage() {
  const { show, node } = useToast();
  const [stories, setStories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState({ video: null, thumbnail: null, hero: null });

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    fetch(`/api/admin/stories?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error);
        setStories(d.stories || []);
      })
      .catch((e) => show(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(EMPTY);
    setFiles({ video: null, thumbnail: null, hero: null });
    setModal({ mode: 'create' });
  };

  const openEdit = (story) => {
    setForm({
      title: story.title || '',
      category: story.category || '',
      topic: story.topic || '',
      description: story.description || '',
      full_description: story.fullDescription || '',
      duration: story.duration || '',
      duration_formatted: story.durationFormatted || '',
      speaker: story.speaker || '',
      video_url: story.videoUrl || '',
      thumbnail_url: story.thumbnail || '',
      hero_image_url: story.heroImage || '',
      featured: story.featured,
      vocabulary_text: (story.vocabulary || []).map((v) => `${v.tag}|${v.desc}`).join('\n')
    });
    setFiles({ video: null, thumbnail: null, hero: null });
    setModal({ mode: 'edit', id: story.id, story });
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'vocabulary_text') return;
      fd.set(key, key === 'featured' ? (value ? '1' : '0') : String(value ?? ''));
    });
    const vocabulary = form.vocabulary_text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [tag, ...rest] = line.split('|');
        return { tag: tag.trim(), desc: rest.join('|').trim() };
      });
    fd.set('vocabulary_json', JSON.stringify(vocabulary));
    if (files.video) fd.set('video', files.video);
    if (files.thumbnail) fd.set('thumbnail', files.thumbnail);
    if (files.hero) fd.set('hero', files.hero);
    return fd;
  };

  const save = async (e) => {
    e.preventDefault();
    const url = modal.mode === 'create' ? '/api/admin/stories' : `/api/admin/stories/${modal.id}`;
    const res = await fetch(url, { method: modal.mode === 'create' ? 'POST' : 'PUT', body: buildFormData() });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Save failed', 'error');
      return;
    }
    setModal(null);
    show(modal.mode === 'create' ? 'Story published. Dummy stories were removed.' : 'Story updated');
    load();
  };

  const remove = async (story) => {
    const res = await fetch(`/api/admin/stories/${story.id}`, { method: 'DELETE' });
    const d = await res.json();
    if (!res.ok || !d.success) {
      show(d.error || 'Delete failed', 'error');
      return;
    }
    show('Story deleted', 'warning');
    load();
  };

  return (
    <>
      {node}
      <AdminHeader
        title="Video stories"
        subtitle="Dummy stories remain until you add a real one. New stories appear on the public site immediately."
        actions={<button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add story</button>}
      />
      <div className="admin-content">
        <div className="admin-toolbar">
          <input className="admin-search" placeholder="Search stories…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="admin-card">
          {loading ? <div className="admin-empty">Loading stories…</div> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Story</th>
                  <th>Topic</th>
                  <th>Video</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {stories.map((story) => (
                  <tr key={story.id}>
                    <td>
                      <strong>{story.title}</strong>
                      <div style={{ color: '#64748b' }}>{story.duration || '—'}</div>
                    </td>
                    <td><span className="admin-badge admin-badge-blue">{story.topic || story.category || '—'}</span></td>
                    <td>{story.videoUrl ? 'Attached' : 'Poster only'}</td>
                    <td>
                      {story.isSeed
                        ? <span className="admin-badge admin-badge-amber">Dummy</span>
                        : <span className="admin-badge admin-badge-green">Published</span>}
                      {story.featured ? <span className="admin-badge admin-badge-slate" style={{ marginLeft: 6 }}>Featured</span> : null}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(story)}>Edit</button>
                        <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setConfirm({ title: 'Delete video story?', message: `“${story.title}” will be permanently removed.`, onConfirm: () => remove(story) })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal ? (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className="admin-modal-head">
              <h3>{modal.mode === 'create' ? 'Add video story' : 'Edit video story'}</h3>
              <button type="button" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              {(form.video_url || modal.story?.videoUrl || modal.story?.heroImage) ? (
                <VideoPlayer
                  className="admin-video-frame"
                  src={form.video_url || modal.story?.videoUrl}
                  poster={form.hero_image_url || form.thumbnail_url || modal.story?.heroImage}
                  title={form.title}
                />
              ) : null}
              <div className="admin-grid-2">
                <div className="admin-field">
                  <label>Title</label>
                  <input className="admin-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Speaker</label>
                  <input className="admin-input" value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Topic</label>
                  <select className="admin-select" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value, category: e.target.value.toUpperCase() })}>
                    {['Language', 'People', 'History', 'Culture', 'Ideas'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              <div className="admin-field">
                <label>Duration</label>
                <input className="admin-input" placeholder="8 min watch" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value, duration_formatted: form.duration_formatted || e.target.value })} />
              </div>
              </div>
              <div className="admin-field">
                <label>Short description</label>
                <textarea className="admin-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Full description</label>
                <textarea className="admin-textarea" value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Video URL (YouTube, Vimeo, or MP4)</label>
                <input className="admin-input" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
              </div>
              <div className="admin-grid-2">
                <div className="admin-field">
                  <label>Upload video file</label>
                  <input className="admin-input" type="file" accept="video/*" onChange={(e) => setFiles({ ...files, video: e.target.files?.[0] || null })} />
                </div>
                <div className="admin-field">
                  <label>Upload thumbnail</label>
                  <input className="admin-input" type="file" accept="image/*" onChange={(e) => setFiles({ ...files, thumbnail: e.target.files?.[0] || null })} />
                </div>
                <div className="admin-field">
                  <label>Upload hero / poster</label>
                  <input className="admin-input" type="file" accept="image/*" onChange={(e) => setFiles({ ...files, hero: e.target.files?.[0] || null })} />
                </div>
              </div>
              <div className="admin-field">
                <label>Thumbnail URL</label>
                <input className="admin-input" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Vocabulary (one per line: tag|description)</label>
                <textarea className="admin-textarea" value={form.vocabulary_text} onChange={(e) => setForm({ ...form, vocabulary_text: e.target.value })} />
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 700 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured story
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save story</button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
      <AdminConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
