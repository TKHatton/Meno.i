import { NextRequest } from 'next/server';

/**
 * POST /api/chat/send-stream
 * Proxies streaming chat requests to the backend API
 * Returns Server-Sent Events (SSE) stream
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const backendEndpoint = `${backendUrl}/api/chat/send-stream`;

    console.log(`[Proxy] Forwarding streaming request to: ${backendEndpoint}`);

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

    if (!response.ok) {
      console.error(`[Proxy] Backend error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'Backend request failed' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if the response is actually a stream
    if (!response.body) {
      throw new Error('No response body from backend');
    }

    // Create a new ReadableStream that proxies the backend stream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            // Forward the chunk as-is
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('[Proxy] Stream error:', error);
          controller.error(error);
        }
      },
    });

    // Return the stream with proper SSE headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[Proxy] Error forwarding streaming request:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to connect to backend',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
