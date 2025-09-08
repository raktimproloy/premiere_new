import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { cloudinaryService } from '@/lib/cloudinaryService';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
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
        { success: false, message: 'Only admin users can upload files' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string; // 'proofOfOwnership' or 'taxForm'

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!fileType || !['proofOfOwnership', 'taxForm'].includes(fileType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = {
      proofOfOwnership: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
      taxForm: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (!allowedTypes[fileType as keyof typeof allowedTypes].includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `Invalid file type. Allowed types for ${fileType}: ${allowedTypes[fileType as keyof typeof allowedTypes].join(', ')}` },
        { status: 400 }
      );
    }

    try {
      // Upload to Cloudinary
      const folder = fileType === 'proofOfOwnership' ? 'admin/proof-of-ownership' : 'admin/tax-forms';
      
      let uploadResult;
      if (file.type.startsWith('image/')) {
        uploadResult = await cloudinaryService.uploadImageFile(file, folder);
      } else if (file.type === 'application/pdf' || file.type.startsWith('application/')) {
        // For PDFs and documents, use uploadDocumentFile
        uploadResult = await cloudinaryService.uploadDocumentFile(file, folder);
      } else {
        // For any other file types, try document upload as fallback
        uploadResult = await cloudinaryService.uploadDocumentFile(file, folder);
      }

      // Extract file extension from original filename
      const originalFileName = file.name;
      const fileExtension = originalFileName.split('.').pop() || '';
      const fileNameWithoutExtension = originalFileName.replace(/\.[^/.]+$/, '');

      // Create file metadata object
      const fileMetadata = {
        url: uploadResult.url,
        publicId: uploadResult.public_id,
        originalFileName: originalFileName,
        fileExtension: fileExtension,
        fileNameWithoutExtension: fileNameWithoutExtension,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date()
      };

      // Update user's file information in MongoDB
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const updateResult = await db.collection("users").updateOne(
        { _id: new ObjectId(result.user._id) },
        { 
          $set: { 
            [fileType]: fileMetadata,
            updatedAt: new Date()
          } 
        }
      );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json(
          { success: false, message: 'Failed to update user file information' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        fileUrl: uploadResult.url,
        publicId: uploadResult.public_id,
        fileType: fileType,
        fileMetadata: fileMetadata
      });

    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return NextResponse.json(
        { success: false, message: 'Failed to upload file to Cloudinary' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload file API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
