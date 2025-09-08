import { NextRequest, NextResponse } from 'next/server';

// Get these from Crisp Dashboard -> Settings -> API
const CRISP_IDENTIFIER = process.env.CRISP_IDENTIFIER || process.env.NEXT_PUBLIC_CRISP_IDENTIFIER || "d625da82-2384-48d1-aa27-290288104f09";
const CRISP_KEY = process.env.CRISP_KEY || process.env.NEXT_PUBLIC_CRISP_KEY || "5fc9b5ac587e4f3685648c4649524ac9f6c227315aedcb017ee3fa6ec826f8fb";
const CRISP_WEBSITE_ID = process.env.CRISP_WEBSITE_ID || process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || "549f16a7-988a-4df9-b3d8-b694fe274009"; // Get this from Settings -> Website Settings

async function fetchCrispConversations(page: number = 1) {
  try {
    const auth = Buffer.from(`${CRISP_IDENTIFIER}:${CRISP_KEY}`).toString('base64');
    const response = await fetch(`https://api.crisp.chat/v1/website/${CRISP_WEBSITE_ID}/conversations/${page}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'X-Crisp-Tier': 'plugin'
      }
    });

    if (!response.ok) {
      throw new Error(`Crisp API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Crisp conversations:', error);
    throw error;
  }
}

async function fetchConversationMessages(sessionId: string) {
  try {
    const auth = Buffer.from(`${CRISP_IDENTIFIER}:${CRISP_KEY}`).toString('base64');
    const response = await fetch(`https://api.crisp.chat/v1/website/${CRISP_WEBSITE_ID}/conversation/${sessionId}/messages`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'X-Crisp-Tier': 'plugin'
      }
    });

    if (!response.ok) {
      throw new Error(`Crisp API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate API credentials
    if (!CRISP_IDENTIFIER || !CRISP_KEY) {
      console.error('Crisp API credentials not configured');
      return NextResponse.json(
        { success: false, message: 'Chat API not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const sessionId = searchParams.get('sessionId');

    // If sessionId is provided, fetch specific conversation messages
    if (sessionId) {
      const messages = await fetchConversationMessages(sessionId);
      return NextResponse.json({ success: true, messages });
    }

    // Otherwise fetch conversation list
    const conversations = await fetchCrispConversations(page);
    return NextResponse.json({ success: true, conversations });

  } catch (error) {
    console.error('Chat messages API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}
