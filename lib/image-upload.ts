import { supabase } from './supabase';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param imageData - Base64 data URL (data:image/...) or File object
 * @param userId - User ID for organizing uploads
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  imageData: string | File,
  userId: string = 'temp_user_id'
): Promise<string> {
  try {
    let file: File;
    let fileName: string;

    // Generate unique filename: scan_${Date.now()}.jpg
    const timestamp = Date.now();
    const uniqueFileName = `scan_${timestamp}.jpg`;

    if (typeof imageData === 'string') {
      // Convert base64 data URL to File
      const response = await fetch(imageData);
      const blob = await response.blob();
      fileName = `${userId}/${uniqueFileName}`;
      file = new File([blob], uniqueFileName, { type: blob.type || 'image/jpeg' });
    } else {
      // Already a File object - use the unique filename
      fileName = `${userId}/${uniqueFileName}`;
      file = new File([imageData], uniqueFileName, { type: imageData.type || 'image/jpeg' });
    }

    console.log('📤 Uploading image to Supabase Storage...');
    console.log('   File name:', fileName);
    console.log('   File size:', file.size, 'bytes');

    const { data, error } = await supabase.storage
      .from('scan-images')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('scan-images')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL after upload');
    }

    console.log('✅ Image uploaded successfully');
    console.log('   Public URL:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
}
