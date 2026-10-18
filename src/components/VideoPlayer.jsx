'use client';

import React from 'react';
import { parseVideoKind } from '../../lib/video';
import { IconPlay } from './Icons';

export function VideoPlayer({ src, poster, title, className = 'story-video-frame' }) {
  const kind = parseVideoKind(src);

  if (kind.type === 'youtube' || kind.type === 'vimeo') {
    return (
      <div className={className}>
        <iframe
          src={kind.src}
          title={title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (kind.type === 'file' && kind.src) {
    return (
      <div className={className}>
        <video
          src={kind.src}
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      {poster ? (
        <img src={poster} alt={title || 'Story'} className="story-video-poster" />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#0f172a' }} />
      )}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15,23,42,0.35)',
        color: '#fff',
        gap: 10
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#fff',
          color: '#1362dc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconPlay size={26} fill="#1362dc" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Video file not attached yet</div>
      </div>
    </div>
  );
}
