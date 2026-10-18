import { NextResponse } from 'next/server';
import { saveWordPronunciation, getWordPronunciation } from '../../../../../lib/db';

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const dictionary = (resolvedParams.dictionary || 'massa').toLowerCase();

    if (dictionary !== 'massa' && dictionary !== 'gizey') {
      return NextResponse.json({ success: false, error: 'Invalid dictionary' }, { status: 400 });
    }

    const body = await request.json();
    const { wordId, wordForm, audioUrl, audioData } = body;

    if (!wordForm && !wordId) {
      return NextResponse.json({ success: false, error: 'Word identifier (wordId or wordForm) is required' }, { status: 400 });
    }

    if (!audioUrl && !audioData) {
      return NextResponse.json({ success: false, error: 'Audio recording or audio URL is required' }, { status: 400 });
    }

    const result = await saveWordPronunciation(dictionary, {
      wordId,
      wordForm,
      audioUrl,
      audioData
    });

    return NextResponse.json({
      success: true,
      pending: true,
      pronunciation_url: result.pronunciation_url,
      wordId: result.wordId,
      wordForm: result.wordForm,
      message: 'Pronunciation submitted for admin review. It will appear on the word after it is accepted.'
    });
  } catch (error) {
    console.error('Error saving pronunciation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const dictionary = (resolvedParams.dictionary || 'massa').toLowerCase();
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');

    if (!word) {
      return NextResponse.json({ success: false, error: 'Word parameter required' }, { status: 400 });
    }

    const data = await getWordPronunciation(dictionary, word);

    return NextResponse.json({
      success: true,
      hasPronunciation: data.hasPronunciation,
      pronunciation_url: data.pronunciation_url,
      wordForm: data.wordForm
    });
  } catch (error) {
    console.error('Error getting pronunciation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
