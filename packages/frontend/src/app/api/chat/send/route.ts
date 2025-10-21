import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/chat/send
 * Proxies chat requests to the backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const backendEndpoint = `${backendUrl}/api/chat/send`;

    console.log(`[Proxy] Forwarding request to: ${backendEndpoint}`);

    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[Proxy] Backend error: ${response.status}`, data);
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Proxy] Error forwarding request:', error);
    return NextResponse.json(
      {
        error: 'Failed to connect to backend',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
