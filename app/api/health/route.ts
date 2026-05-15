import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'rotan-lite',
    timestamp: Date.now(),
  });
}

// Made with Bob
