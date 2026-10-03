import { NextResponse } from 'next/server';
import { getWordOfTheDay } from '../../../../../lib/db';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const dictionary = (resolvedParams.dictionary || 'massa').toLowerCase();

  if (!['massa', 'gizey'].includes(dictionary)) {
    return NextResponse.json({
      success: false,
      message: 'Invalid dictionary specified.'
    }, { status: 400 });
  }

  try {
    const word = await getWordOfTheDay(dictionary);
    if (!word) {
      return NextResponse.json({
        success: false,
        message: 'No word found.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      dictionary,
      data: word
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
