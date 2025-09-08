import { NextRequest, NextResponse } from 'next/server';

const CRISP_IDENTIFIER = process.env.CRISP_IDENTIFIER || process.env.NEXT_PUBLIC_CRISP_IDENTIFIER || "d625da82-2384-48d1-aa27-290288104f09";
const CRISP_KEY = process.env.CRISP_KEY || process.env.NEXT_PUBLIC_CRISP_KEY || "5fc9b5ac587e4f3685648c4649524ac9f6c227315aedcb017ee3fa6ec826f8fb";
const CRISP_WEBSITE_ID = process.env.CRISP_WEBSITE_ID || process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || "549f16a7-988a-4df9-b3d8-b694fe274009";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { success: false, message: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${CRISP_IDENTIFIER}:${CRISP_KEY}`).toString('base64');
    const response = await fetch(
      `https://api.crisp.chat/v1/website/${CRISP_WEBSITE_ID}/conversation/${sessionId}/message`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'X-Crisp-Tier': 'plugin'
        },
        body: JSON.stringify({
          type: 'text',
          from: 'operator',
          origin: 'chat',
          content: message,
          timestamp: Date.now()
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Crisp API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Send message API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
