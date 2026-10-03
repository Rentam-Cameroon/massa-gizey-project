import { NextResponse } from 'next/server';
import { insertWordSuggestion } from '../../../../../../lib/db';

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const dictionary = (resolvedParams.dictionary || 'massa').toLowerCase();

  if (!['massa', 'gizey'].includes(dictionary)) {
    return NextResponse.json({
      success: false,
      message: 'Invalid dictionary portal specified.'
    }, { status: 400 });
  }

  try {
    const body = await request.json();
    if (!body.spelling || !body.part_of_speech) {
      return NextResponse.json({
        success: false,
        message: 'Spelling and part of speech are required.'
      }, { status: 422 });
    }

    const suggestion = await insertWordSuggestion(dictionary, body);
    return NextResponse.json({
      success: true,
      message: 'Word suggestion submitted successfully.',
      data: suggestion
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
