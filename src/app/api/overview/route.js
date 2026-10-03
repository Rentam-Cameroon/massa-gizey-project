import { NextResponse } from 'next/server';
import { getOverview } from '../../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dictionary = searchParams.get('dictionary') || 'massa';

  if (!['massa', 'gizey'].includes(dictionary.toLowerCase())) {
    return NextResponse.json({
      success: false,
      message: 'Invalid dictionary specified. Must be massa or gizey.'
    }, { status: 400 });
  }

  try {
    const data = await getOverview(dictionary.toLowerCase());
    return NextResponse.json({
      success: true,
      ...data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
