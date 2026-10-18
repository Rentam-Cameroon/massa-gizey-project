import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../../lib/auth';
import { updateWordSuggestion, acceptWordSuggestion, rejectWordSuggestion } from '../../../../../../../lib/store';

export async function PUT(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  const dictionary = (resolved.dictionary || 'massa').toLowerCase();
  try {
    const body = await request.json();
    const item = await updateWordSuggestion(dictionary, resolved.id, body);
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, item });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  const dictionary = (resolved.dictionary || 'massa').toLowerCase();
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'accept';
    if (action === 'reject') {
      await rejectWordSuggestion(dictionary, resolved.id);
      return NextResponse.json({ success: true, rejected: true });
    }
    const word = await acceptWordSuggestion(dictionary, resolved.id, body.overrides || body);
    if (!word) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, accepted: true, word });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  await rejectWordSuggestion((resolved.dictionary || 'massa').toLowerCase(), resolved.id);
  return NextResponse.json({ success: true, rejected: true });
}
