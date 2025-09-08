import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const result = await authService.verifyToken(token);

    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (result.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admin users can download files' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('fileType'); // 'proofOfOwnership' or 'taxForm'

    if (!fileType || !['proofOfOwnership', 'taxForm'].includes(fileType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type parameter' },
        { status: 400 }
      );
    }

    // Get user data from database to access file metadata
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(result.user._id)
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if file exists
    const fileData = user[fileType];
    if (!fileData) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Handle both old format (string URL) and new format (object with metadata)
    let fileUrl: string;
    let fileName: string;
    let mimeType: string;

    if (typeof fileData === 'string') {
      // Old format - just a URL string
      fileUrl = fileData;
      fileName = `${fileType}_${Date.now()}`;
      mimeType = 'application/octet-stream';
    } else {
      // New format - object with metadata
      fileUrl = fileData.url;
      fileName = fileData.originalFileName || `${fileType}_${Date.now()}.${fileData.fileExtension || ''}`;
      mimeType = fileData.mimeType || 'application/octet-stream';
    }

    // Fetch the file from Cloudinary
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch file from Cloudinary' },
        { status: 500 }
      );
    }

    // Get the file content
    const fileBuffer = await response.arrayBuffer();

    // Create response with proper headers for download
    const downloadResponse = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });

    return downloadResponse;

  } catch (error) {
    console.error('Download file API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
