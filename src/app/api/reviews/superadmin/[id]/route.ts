import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Only superadmin can view individual review details
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can view review details.' },
        { status: 403 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get review by ID
    const review = await db.collection("reviews").findOne({
      _id: new ObjectId(id)
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Format review for response
    const formattedReview = {
      _id: review._id,
      body: review.body,
      date: review.date,
      display_name: review.display_name,
      property: review.property,
      property_id: review.property_id,
      response: review.response || '',
      reviewer: review.reviewer,
      stars: review.stars,
      status: review.status,
      created_at: review.created_at,
      updated_at: review.updated_at,
      rejection_reason: review.rejection_reason || null,
      updated_by: review.updated_by || null
    };

    return NextResponse.json({
      success: true,
      data: formattedReview
    });

  } catch (error) {
    console.error('Superadmin review GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Only superadmin can update reviews
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can update reviews.' },
        { status: 403 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID format' },
        { status: 400 }
      );
    }

    const { 
      body, 
      display_name, 
      stars, 
      status, 
      response, 
      rejection_reason 
    } = await request.json();

    // Validate stars rating if provided
    if (stars !== undefined && (stars < 1 || stars > 5 || !Number.isInteger(stars))) {
      return NextResponse.json(
        { success: false, message: 'Stars must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Check if review exists
    const existingReview = await db.collection("reviews").findOne({
      _id: new ObjectId(id)
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date(),
      updated_by: result.user._id
    };

    if (body !== undefined) updateData.body = body.trim();
    if (display_name !== undefined) updateData.display_name = display_name.trim();
    if (stars !== undefined) updateData.stars = stars;
    if (status !== undefined) updateData.status = status;
    if (response !== undefined) updateData.response = response.trim();
    if (rejection_reason !== undefined) updateData.rejection_reason = rejection_reason?.trim() || null;

    // Update review
    const updateResult = await db.collection("reviews").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Get updated review
    const updatedReview = await db.collection("reviews").findOne({
      _id: new ObjectId(id)
    });

    // Format updated review for response
    const formattedReview = {
      _id: updatedReview._id,
      body: updatedReview.body,
      date: updatedReview.date,
      display_name: updatedReview.display_name,
      property: updatedReview.property,
      property_id: updatedReview.property_id,
      response: updatedReview.response || '',
      reviewer: updatedReview.reviewer,
      stars: updatedReview.stars,
      status: updatedReview.status,
      created_at: updatedReview.created_at,
      updated_at: updatedReview.updated_at,
      rejection_reason: updatedReview.rejection_reason || null,
      updated_by: updatedReview.updated_by || null
    };

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      data: formattedReview
    });

  } catch (error) {
    console.error('Superadmin review update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Only superadmin can delete reviews
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can delete reviews.' },
        { status: 403 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Delete review
    const deleteResult = await db.collection("reviews").deleteOne({
      _id: new ObjectId(id)
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Superadmin review delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
