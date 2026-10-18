export function parseVideoKind(url) {
  if (!url) return { type: 'none', src: '' };
  const value = String(url).trim();
  const yt = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i);
  if (yt) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${yt[1]}`, id: yt[1] };
  }
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeo[1]}`, id: vimeo[1] };
  }
  return { type: 'file', src: value };
}
