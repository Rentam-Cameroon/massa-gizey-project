import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth';
import { listStories, createStory } from '../../../../../lib/store';
import { saveUploadedFile } from '../../../../../lib/uploads';

async function parseStoryPayload(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const data = Object.fromEntries(
      [...form.entries()].filter(([, value]) => typeof value === 'string')
    );
    if (form.get('featured') !== undefined) {
      data.featured = String(form.get('featured')) === '1' || String(form.get('featured')) === 'true';
    }
    if (form.get('vocabulary_json')) {
      try {
        data.vocabulary = JSON.parse(String(form.get('vocabulary_json')));
      } catch {
        data.vocabulary = [];
      }
    }
    const video = form.get('video');
    const thumbnail = form.get('thumbnail');
    const hero = form.get('hero');
    if (video && typeof video === 'object') {
      const url = await saveUploadedFile(video, 'videos');
      if (url) data.video_url = url;
    }
    if (thumbnail && typeof thumbnail === 'object') {
      const url = await saveUploadedFile(thumbnail, 'thumbnails');
      if (url) data.thumbnail_url = url;
    }
    if (hero && typeof hero === 'object') {
      const url = await saveUploadedFile(hero, 'thumbnails');
      if (url) data.hero_image_url = url;
    }
    return data;
  }
  return request.json();
}

export async function GET(request) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const { searchParams } = new URL(request.url);
  try {
    const stories = await listStories({
      search: searchParams.get('search') || '',
      topic: searchParams.get('topic') || '',
      admin: true
    });
    return NextResponse.json({ success: true, stories });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = requireAdmin(request);
  if (error) return error;
  try {
    const data = await parseStoryPayload(request);
    if (!data.title) {
      return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 422 });
    }
    const story = await createStory({ ...data, is_seed: 0 });
    return NextResponse.json({ success: true, story, dummyRemoved: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
