import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../../lib/auth';
import { acceptPronunciationSuggestion, rejectPronunciationSuggestion } from '../../../../../../../lib/store';

export async function POST(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  const dictionary = (resolved.dictionary || 'massa').toLowerCase();
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'accept';
    if (action === 'reject') {
      await rejectPronunciationSuggestion(dictionary, resolved.id);
      return NextResponse.json({ success: true, rejected: true });
    }
    const result = await acceptPronunciationSuggestion(dictionary, resolved.id);
    if (!result.ok && result.reason === 'not_found') {
      return NextResponse.json({ success: false, error: 'Contribution not found.' }, { status: 404 });
    }
    if (!result.ok && result.reason === 'word_missing') {
      return NextResponse.json({
        success: false,
        error: `No ${dictionary} dictionary entry matches “${result.suggestion.word_form}”. Create or rename the word first, then accept.`
      }, { status: 422 });
    }
    return NextResponse.json({ success: true, accepted: true, word: result.word });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  await rejectPronunciationSuggestion((resolved.dictionary || 'massa').toLowerCase(), resolved.id);
  return NextResponse.json({ success: true, rejected: true });
}
