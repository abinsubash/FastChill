import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

/**
 * Upload image to S3
 * @param buffer - Image buffer
 * @param fileName - File name/path in S3 (e.g., "products/123456-image.jpg")
 * @param contentType - MIME type (e.g., "image/jpeg")
 * @returns Public URL of uploaded image
 */
export async function uploadImage(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the public URL
  const region = process.env.AWS_REGION || "eu-north-1"; // Use your actual region
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${fileName}`;
}

/**
 * Delete image from S3
 * @param key - S3 key/path (e.g., "products/123456-image.jpg")
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteImage(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  console.log(`Successfully deleted ${key} from S3`);
}

/**
 * Delete multiple images from S3
 * @param keys - Array of S3 keys/paths
 * @returns Promise with results of each deletion
 */
export async function deleteImages(keys: string[]): Promise<{
  succeeded: string[];
  failed: Array<{ key: string; error: string }>;
}> {
  const results = {
    succeeded: [] as string[],
    failed: [] as Array<{ key: string; error: string }>,
  };

  for (const key of keys) {
    try {
      await deleteImage(key);
      results.succeeded.push(key);
    } catch (error) {
      results.failed.push({
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

/**
 * Extract S3 key from full URL
 * @param url - Full S3 URL
 * @returns S3 key or null if invalid
 */
export function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // For standard S3 URLs (bucket.s3.region.amazonaws.com)
    if (urlObj.hostname.includes('.s3.')) {
      return urlObj.pathname.substring(1);
    }
    
    // For path-style URLs (s3.region.amazonaws.com/bucket)
    if (urlObj.hostname.includes('s3.')) {
      const pathParts = urlObj.pathname.substring(1).split('/');
      return pathParts.slice(1).join('/');
    }
    
    // For custom domains or CloudFront
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error("Error parsing S3 URL:", error);
    return null;
  }
}