import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  size: number;
  duration?: number; // For videos
  resourceType: 'image' | 'video';
}

export interface CloudinaryDeleteResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}

export const cloudinaryService = {
  // Add configuration check method
  checkConfiguration() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(`Cloudinary configuration missing: cloudName=${!!cloudName}, apiKey=${!!apiKey}, apiSecret=${!!apiSecret}`);
    }
    
    return { cloudName, apiKey, apiSecret };
  },

  async uploadImage(
    file: File | Buffer | string,
    folder: string = 'properties',
    options: {
      transformation?: string | boolean;
      quality?: number;
      format?: string;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      // Check configuration first
      this.checkConfiguration();
      
      let result: any;

      if (typeof file === 'string') {
        // If file is a URL or base64 string
        try {
          result = await cloudinary.uploader.upload(file, {
            folder,
            // Don't apply any transformations - preserve original dimensions
            quality: options.quality || 'auto',
            // Only specify format if explicitly provided and not undefined
            ...(options.format && options.format !== 'auto' && { format: options.format })
          });
        } catch (uploadError) {
          console.error('Cloudinary upload error for string:', uploadError);
          throw new Error(`Failed to upload from string: ${this.extractErrorMessage(uploadError)}`);
        }
      } else if (file instanceof File) {
        // If file is a File object
        try {
          // Check if it's a video file
          const isVideo = file.type.startsWith('video/');
          
          if (isVideo) {
            // Use video upload for video files
            result = await this.uploadVideoFile(file, folder, options);
          } else {
            // Use image upload for image files
            result = await this.uploadImageFile(file, folder, options);
          }
        } catch (uploadError) {
          console.error('Cloudinary upload error for File:', uploadError);
          throw new Error(`Failed to upload file: ${this.extractErrorMessage(uploadError)}`);
        }
      } else if (Buffer.isBuffer(file)) {
        // If file is a Buffer
        try {
          // For buffers, we'll assume it's an image unless specified otherwise
          result = await this.uploadImageBuffer(file, folder, options);
        } catch (uploadError) {
          console.error('Cloudinary upload error for Buffer:', uploadError);
          throw new Error(`Failed to upload buffer: ${this.extractErrorMessage(uploadError)}`);
        }
      } else {
        throw new Error('Unsupported file type. Must be File, Buffer, or string.');
      }

      if (!result || !result.secure_url) {
        throw new Error('Upload completed but no valid result returned');
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        duration: result.duration, // For videos
        resourceType: result.resource_type || 'image' // Default to image if not specified
      };

    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      
      // Extract meaningful error message
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }
  },

  // Dedicated method for video uploads
  async uploadVideo(
    file: File | Buffer | string,
    folder: string = 'videos',
    options: {
      quality?: number;
      format?: string;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      // Check configuration first
      this.checkConfiguration();
      
      let result: any;

      if (typeof file === 'string') {
        // If file is a URL or base64 string
        try {
          result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'video',
            quality: options.quality || 'auto',
            // Don't force format for videos - let them keep original format
          });
        } catch (uploadError) {
          console.error('Cloudinary video upload error for string:', uploadError);
          throw new Error(`Failed to upload video from string: ${this.extractErrorMessage(uploadError)}`);
        }
      } else if (file instanceof File) {
        // If file is a File object
        try {
          result = await this.uploadVideoFile(file, folder, options);
        } catch (uploadError) {
          console.error('Cloudinary video upload error for File:', uploadError);
          throw new Error(`Failed to upload video file: ${this.extractErrorMessage(uploadError)}`);
        }
      } else if (Buffer.isBuffer(file)) {
        // If file is a Buffer
        try {
          result = await this.uploadVideoBuffer(file, folder, options);
        } catch (uploadError) {
          console.error('Cloudinary video upload error for Buffer:', uploadError);
          throw new Error(`Failed to upload video buffer: ${this.extractErrorMessage(uploadError)}`);
        }
      } else {
        throw new Error('Unsupported file type for video upload. Must be File, Buffer, or string.');
      }

      if (!result || !result.secure_url) {
        throw new Error('Video upload completed but no valid result returned');
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        duration: result.duration,
        resourceType: 'video'
      };

    } catch (error) {
      console.error('Cloudinary video upload failed:', error);
      
      // Extract meaningful error message
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(`Cloudinary video upload failed: ${errorMessage}`);
    }
  },

  // Helper method to upload video files
  async uploadVideoFile(
    file: File,
    folder: string,
    options: {
      quality?: number;
      format?: string;
    } = {}
  ): Promise<any> {
    // Convert File to buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use upload_stream with video-specific options
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video', // Specify this is a video
          quality: options.quality || 'auto',
          // Don't force format for videos - let them keep original format
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary video upload stream error:', error);
            reject(new Error(`Video upload stream failed: ${this.extractErrorMessage(error)}`));
          } else if (uploadResult) {
            resolve(uploadResult);
          } else {
            reject(new Error('Video upload stream completed but no result returned'));
          }
        }
      );
      
      uploadStream.on('error', (streamError) => {
        reject(new Error(`Video stream error: ${this.extractErrorMessage(streamError)}`));
      });
      
      uploadStream.end(buffer);
    });
  },

  // Helper method to upload image files
  async uploadImageFile(
    file: File,
    folder: string,
    options: {
      quality?: number;
      format?: string;
    } = {}
  ): Promise<any> {
    // Convert File to buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use upload_stream with image-specific options
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image', // Specify this is an image
          quality: options.quality || 'auto',
          // Only specify format if explicitly provided and not undefined
          ...(options.format && options.format !== 'auto' && { format: options.format })
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary image upload stream error:', error);
            reject(new Error(`Image upload stream failed: ${this.extractErrorMessage(error)}`));
          } else if (uploadResult) {
            resolve(uploadResult);
          } else {
            reject(new Error('Image upload stream completed but no result returned'));
          }
        }
      );
      
      uploadStream.on('error', (streamError) => {
        reject(new Error(`Image stream error: ${this.extractErrorMessage(streamError)}`));
      });
      
      uploadStream.end(buffer);
    });
  },

  // Helper method to upload document files (PDFs, docs, etc.)
  async uploadDocumentFile(
    file: File,
    folder: string,
    options: {
      format?: string;
    } = {}
  ): Promise<any> {
    // Convert File to buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use upload_stream with raw resource type for documents
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'raw', // Use raw for documents
          format: options.format || 'auto',
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary document upload stream error:', error);
            reject(new Error(`Document upload stream failed: ${this.extractErrorMessage(error)}`));
          } else if (uploadResult) {
            resolve(uploadResult);
          } else {
            reject(new Error('Document upload stream completed but no result returned'));
          }
        }
      );
      
      uploadStream.on('error', (streamError) => {
        reject(new Error(`Document stream error: ${this.extractErrorMessage(streamError)}`));
      });
      
      uploadStream.end(buffer);
    });
  },

  // Helper method to upload image buffers
  async uploadImageBuffer(
    buffer: Buffer,
    folder: string,
    options: {
      quality?: number;
      format?: string;
    } = {}
  ): Promise<any> {
    // Use upload_stream with image-specific options
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image', // Specify this is an image
          quality: options.quality || 'auto',
          // Only specify format if explicitly provided and not undefined
          ...(options.format && options.format !== 'auto' && { format: options.format })
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary image upload stream error for buffer:', error);
            reject(new Error(`Image upload stream failed: ${this.extractErrorMessage(error)}`));
          } else if (uploadResult) {
            resolve(uploadResult);
          } else {
            reject(new Error('Image upload stream completed but no result returned'));
          }
        }
      );
      
      uploadStream.on('error', (streamError) => {
        reject(new Error(`Image stream error: ${this.extractErrorMessage(streamError)}`));
      });
      
      uploadStream.end(buffer);
    });
  },

  // Helper method to upload video buffers
  async uploadVideoBuffer(
    buffer: Buffer,
    folder: string,
    options: {
      quality?: number;
      format?: string;
    } = {}
  ): Promise<any> {
    // Use upload_stream with video-specific options
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video', // Specify this is a video
          quality: options.quality || 'auto',
          // Don't force format for videos - let them keep original format
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary video upload stream error for buffer:', error);
            reject(new Error(`Video upload stream failed: ${this.extractErrorMessage(error)}`));
          } else if (uploadResult) {
            resolve(uploadResult);
          } else {
            reject(new Error('Video upload stream completed but no result returned'));
          }
        }
      );
      
      uploadStream.on('error', (streamError) => {
        reject(new Error(`Video stream error: ${this.extractErrorMessage(streamError)}`));
      });
      
      uploadStream.end(buffer);
    });
  },

  // Helper method to extract meaningful error messages
  extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (error && typeof error === 'object') {
      // Try to extract common error fields
      if (error.message) return error.message;
      if (error.error) return error.error;
      if (error.msg) return error.msg;
      if (error.details) return error.details;
      
      // If it's a Cloudinary error object, try to get the error message
      if (error.http_code) {
        return `HTTP ${error.http_code}: ${error.message || 'Upload failed'}`;
      }
      
      // Try to stringify the error object
      try {
        const errorStr = JSON.stringify(error);
        if (errorStr !== '{}' && errorStr !== '[object Object]') {
          return errorStr;
        }
      } catch (e) {
        // Ignore JSON.stringify errors
      }
      
      // Last resort: return a generic message
      return 'Unknown upload error';
    }
    
    return String(error);
  },

  async uploadMultipleImages(
    files: (File | Buffer | string)[],
    folder: string = 'properties',
    options: {
      transformation?: string | boolean;
      quality?: number;
      format?: string;
    } = {}
  ): Promise<CloudinaryUploadResult[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadImage(file, folder, options)
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Cloudinary multiple upload error:', error);
      throw new Error('Failed to upload multiple images to Cloudinary');
    }
  },

  async deleteImage(publicId: string): Promise<CloudinaryDeleteResult> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        return {
          success: true,
          deletedCount: 1,
        };
      } else {
        return {
          success: false,
          deletedCount: 0,
          error: 'Failed to delete image',
        };
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        deletedCount: 0,
        error: 'Failed to delete image from Cloudinary',
      };
    }
  },

  async deleteMultipleImages(publicIds: string[]): Promise<CloudinaryDeleteResult> {
    try {
      const deletePromises = publicIds.map(publicId => 
        this.deleteImage(publicId)
      );
      
      const results = await Promise.all(deletePromises);
      
      const totalDeleted = results.reduce((sum, result) => 
        sum + result.deletedCount, 0
      );
      
      const hasErrors = results.some(result => !result.success);
      
      return {
        success: !hasErrors,
        deletedCount: totalDeleted,
        error: hasErrors ? 'Some images failed to delete' : undefined,
      };
    } catch (error) {
      console.error('Cloudinary multiple delete error:', error);
      return {
        success: false,
        deletedCount: 0,
        error: 'Failed to delete multiple images from Cloudinary',
      };
    }
  },

  async generateImageUrl(
    publicId: string,
    options: {
      transformation?: string | boolean;
      quality?: number;
      format?: string;
      width?: number;
      height?: number;
    } = {}
  ): Promise<string> {
    try {
      const url = cloudinary.url(publicId, {
        // Don't apply any transformations by default - preserve original dimensions
        quality: options.quality,
        format: options.format,
        width: options.width,
        height: options.height,
        secure: true,
      });
      
      return url;
    } catch (error) {
      console.error('Cloudinary URL generation error:', error);
      throw new Error('Failed to generate Cloudinary URL');
    }
  },

  async getImageInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary get image info error:', error);
      throw new Error('Failed to get image information from Cloudinary');
    }
  },
};
