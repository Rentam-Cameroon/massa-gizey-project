'use client';

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { 
  IconThumbsUp, 
  IconShare, 
  IconBookmark, 
  IconStar, 
  IconArrowLeft, 
  IconArrowRight 
} from '../../../components/Icons';

export default function StoryDetailPage({ params }) {
  const resolvedParams = use(params);
  const storyId = resolvedParams.id || 'why-words-travel';
  const [story, setStory] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/stories/${storyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        if (!data.success || !data.story) {
          setLoadError(data.error || 'Story not found');
          return;
        }
        setStory(data.story);
        setLikes(data.story.likesCount || 0);
        setComments(data.story.comments || []);
      })
      .catch((err) => {
        if (!ignore) setLoadError(err.message);
      });
    return () => { ignore = true; };
  }, [storyId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
      showToast('Liked this story!');
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Saved to your library!' : 'Removed from saved stories.');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Story link copied to clipboard!');
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim() && userRating === 0) return;
    setReviewSubmitted(true);
    showToast('Thank you! Your review has been recorded.');
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: 'c_' + Date.now(),
      author: 'You (Learner)',
      avatar: '/images/avatar_amelia.png',
      timeAgo: 'Just now',
      text: newComment.trim()
    };

    setComments([commentObj, ...comments]);
    setNewComment('');
    showToast('Comment posted successfully!');
  };

  if (!story) {
    return (
      <div className="story-detail-screen">
        <Breadcrumbs items={[{ label: 'Video Stories', href: '/stories' }, { label: 'Story' }]} />
        <div className="container" style={{ padding: '48px 24px', color: '#64748b' }}>
          {loadError || 'Loading story…'}
        </div>
      </div>
    );
  }

  const vocabulary = story.vocabulary || [];

  return (
    <div className="story-detail-screen">
      <Breadcrumbs 
        items={[
          { label: 'Video Stories', href: '/stories' },
          { label: story.title }
        ]} 
      />

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          zIndex: 3000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      <div className="container">
        {/* Header Title & Subtitle */}
        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
          <h1 className="page-title">{story.title}</h1>
          <p className="page-subtitle" style={{ marginBottom: '8px' }}>
            {story.fullDescription}
          </p>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Video story · {story.duration || story.durationFormatted || 'Watch'}
            {story.speaker ? ` · ${story.speaker}` : ''}
          </div>
        </div>

        <VideoPlayer
          src={story.videoUrl}
          poster={story.heroImage || story.thumbnail || story.mainVideoFrame}
          title={story.title}
        />

        {/* Action bar below video */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <button 
            className="btn-sign-in"
            onClick={handleLike}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              color: isLiked ? '#1362dc' : '#0f172a',
              borderColor: isLiked ? '#1362dc' : '#e2e8f0',
              background: isLiked ? '#ebf3fe' : '#ffffff'
            }}
          >
            <IconThumbsUp size={16} />
            <span>Like {likes}</span>
          </button>

          <button 
            className="btn-sign-in"
            onClick={handleShare}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <IconShare size={16} />
            <span>Share</span>
          </button>

          <button 
            className="btn-sign-in"
            onClick={handleSave}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              color: isSaved ? '#1362dc' : '#0f172a',
              borderColor: isSaved ? '#1362dc' : '#e2e8f0',
              background: isSaved ? '#ebf3fe' : '#ffffff'
            }}
          >
            <IconBookmark size={16} fill={isSaved ? '#1362dc' : 'none'} />
            <span>Save</span>
          </button>

          <button 
            className="btn-sign-in"
            onClick={() => {
              const el = document.getElementById('rate-story-box');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <IconStar size={16} />
            <span>Review</span>
          </button>
        </div>

        {/* Two-column layout (stacks smoothly on mobile) */}
        <div className="story-details-layout">
          {/* Left Column: Rate this story & Community Discussion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Rate this story card */}
            <div 
              id="rate-story-box"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: 'clamp(20px, 4vw, 32px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    Rate this story
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>
                    Tell other learners what you thought.
                  </p>
                </div>

                {/* Score badge */}
                <div style={{ 
                  background: '#f0f6fd', 
                  border: '1px solid #d8e6fa', 
                  borderRadius: '8px', 
                  padding: '10px 16px',
                  textAlign: 'right'
                }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                    {(story.ratingAvg || 0).toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ 5</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {story.ratingCount || 0} ratings
                  </div>
                </div>
              </div>

              {/* Interactive Star rating */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Your rating
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(star)}
                      style={{ padding: '2px', color: (hoverRating || userRating) >= star ? '#f59e0b' : '#cbd5e1' }}
                    >
                      <IconStar size={24} fill={(hoverRating || userRating) >= star ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Write a review
                  </label>
                  <textarea
                    rows={4}
                    value={reviewText}
                    maxLength={500}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your perspective on this video story..."
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Up to 500 characters. Reviews are saved in local state.
                  </div>
                  <button type="submit" className="search-btn-primary" style={{ height: '42px', padding: '0 20px' }}>
                    {reviewSubmitted ? 'Submitted!' : 'Submit review'}
                  </button>
                </div>
              </form>
            </div>

            {/* Community discussion card */}
            <div 
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: 'clamp(20px, 4vw, 32px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                    Community discussion
                  </h3>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {comments.length} sample comments
                  </div>
                </div>

                <div className="sort-dropdown-wrapper">
                  <span>Sort</span>
                  <select className="sort-select">
                    <option>Most relevant</option>
                    <option>Newest</option>
                  </select>
                </div>
              </div>

              {/* Add comment input */}
              <form onSubmit={handleCommentSubmit} style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Add a comment
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Join the discussion..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    marginBottom: '12px'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="search-btn-primary" style={{ height: '40px', padding: '0 20px' }}>
                    Post local comment
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {comments.map((comment) => (
                  <div 
                    key={comment.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      paddingBottom: '20px',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', background: '#e2e8f0', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                          {comment.author}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {comment.timeAgo}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back Arrow link */}
            <div>
              <Link
                href="/stories"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#1362dc',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '8px 0'
                }}
              >
                <IconArrowLeft size={16} />
                <span>Back to Video Stories</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Key vocabulary & Related resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Key vocabulary card */}
            <div 
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: 'clamp(20px, 4vw, 28px)'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Key vocabulary
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                Explore terms that connect this story to the wider dictionary.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {vocabulary.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedTag(v);
                      showToast(`Vocabulary: ${v.tag} — ${v.desc}`);
                    }}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {v.tag}
                  </button>
                ))}
              </div>

              {selectedTag && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#eef5fd', borderRadius: '8px', fontSize: '13px', color: '#1e3a8a' }}>
                  <strong>{selectedTag.tag}:</strong> {selectedTag.desc}
                </div>
              )}
            </div>

            {/* Related resources card */}
            <div 
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: 'clamp(20px, 4vw, 28px)'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
                Related resources
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link 
                  href="/dictionaries/massa"
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'block'
                  }}
                  className="related-item-card"
                >
                  <img
                    src="/images/related_english_dict.png"
                    alt="Massa Dictionary"
                    style={{ width: '100%', height: '88px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    Massa Dictionary (4,748+ entries)
                  </div>
                </Link>

                <Link 
                  href="/lexicons/computing-software"
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'block'
                  }}
                  className="related-item-card"
                >
                  <img
                    src="/images/related_computing_lex.png"
                    alt="Computing & Software Lexicon"
                    style={{ width: '100%', height: '88px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    Computing & Software Lexicon
                  </div>
                </Link>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Link 
                  href="/stories"
                  className="card-action-link"
                  style={{ fontSize: '13px' }}
                >
                  Browse related video stories <IconArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
