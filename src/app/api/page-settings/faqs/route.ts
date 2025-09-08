import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get FAQs page settings
    const faqsSettings = await db.collection("pageSettings").findOne(
      { type: "faqs" },
      { projection: { _id: 0 } }
    );

    if (!faqsSettings) {
      // Return default structure if no settings exist
      return NextResponse.json({
        success: true,
        data: {
          faqs: []
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: faqsSettings.data
    });

  } catch (error) {
    console.error('Get FAQs settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and check if user is superadmin
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only superadmin can update page settings
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { faqs } = await request.json();

    if (!Array.isArray(faqs)) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format. FAQs must be an array' },
        { status: 400 }
      );
    }

    // Validate each FAQ
    for (const faq of faqs) {
      if (!faq.id || !faq.question || !faq.answer || !faq.category) {
        return NextResponse.json(
          { success: false, message: 'Invalid FAQ data. Each FAQ must have id, question, answer, and category' },
          { status: 400 }
        );
      }

      if (!['property', 'booking'].includes(faq.category)) {
        return NextResponse.json(
          { success: false, message: 'Invalid category. Must be either "property" or "booking"' },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Upsert FAQs page settings
    await db.collection("pageSettings").updateOne(
      { type: "faqs" },
      { 
        $set: { 
          type: "faqs",
          data: { faqs },
          updatedAt: new Date(),
          updatedBy: result.user._id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'FAQs page settings updated successfully'
    });

  } catch (error) {
    console.error('Update FAQs settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
