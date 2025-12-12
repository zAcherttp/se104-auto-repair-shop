"use server";

import sharp from "sharp";
import { checkAdminRole } from "./settings";

/**
 * Processes logo images under 10MB, resizes to fit within 512x512 square (preserving aspect ratio), and compresses to under 1MB
 * @param buffer - The image buffer
 * @param contentType - The MIME type
 * @returns Processed buffer and potentially updated content type
 */
async function processLogoImage(
  buffer: ArrayBuffer,
  contentType: string,
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB
  const TARGET_SIZE = 1 * 1024 * 1024; // 1MB

  // Reject if over 10MB
  if (buffer.byteLength > MAX_INPUT_SIZE) {
    throw new Error("Image file too large. Maximum size is 10MB.");
  }

  try {
    // Convert ArrayBuffer to Buffer for sharp
    const inputBuffer = Buffer.from(buffer);
    let finalContentType = contentType;

    // Start with high quality and progressively reduce until under 1MB
    let quality = 90;
    let processedBuffer: Buffer;

    do {
      if (finalContentType.includes("png")) {
        // Preserve transparency for PNG logos - resize to fit in 512x512 square
        processedBuffer = await sharp(inputBuffer)
          .resize(512, 512, {
            fit: "inside", // Fit the entire image inside the square without cropping
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
          })
          .png({ quality, progressive: true })
          .toBuffer();
      } else if (finalContentType.includes("webp")) {
        processedBuffer = await sharp(inputBuffer)
          .resize(512, 512, {
            fit: "inside",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality })
          .toBuffer();
      } else {
        // Convert to PNG for transparency support in other formats
        processedBuffer = await sharp(inputBuffer)
          .resize(512, 512, {
            fit: "inside",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png({ quality, progressive: true })
          .toBuffer();
        finalContentType = "image/png";
      }

      // Reduce quality for next iteration if still too large
      quality -= 10;
    } while (processedBuffer.byteLength > TARGET_SIZE && quality > 30);

    return {
      buffer: processedBuffer.buffer as ArrayBuffer,
      contentType: finalContentType,
    };
  } catch (error) {
    console.error("Error processing logo image:", error);
    throw new Error(
      "Failed to process logo image. Please try a different image.",
    );
  }
}

/**
 * Uploads a new logo image, deleting the previous one if provided.
 * @param buffer - The image data
 * @param fileName - The original file name
 * @param contentType - The MIME type
 * @param previousUrl - The previous logo image public URL (optional)
 * @returns The new public URL or null
 */
export async function uploadLogoImage({
  buffer,
  fileName,
  contentType,
  previousUrl,
}: {
  buffer: ArrayBuffer;
  fileName: string;
  contentType: string;
  previousUrl?: string | null;
}): Promise<string | null> {
  try {
    // Check admin role first
    const { supabase } = await checkAdminRole();

    // Process image: crop to 1:1 aspect ratio and compress to under 1MB
    const { buffer: processedBuffer, contentType: finalContentType } =
      await processLogoImage(buffer, contentType);

    // Remove previous image if previousUrl is provided
    if (previousUrl) {
      try {
        // Extract the filename from the public URL
        const url = new URL(previousUrl);
        const parts = url.pathname.split("/");
        const fileKey = parts
          .slice(parts.indexOf("garage-logos") + 1)
          .join("/");
        if (fileKey) {
          await supabase.storage.from("garage-logos").remove([fileKey]);
        }
      } catch (err) {
        // Log and continue
        console.warn("Failed to remove previous logo image:", err);
      }
    }

    // Check if garage-logos bucket exists and is accessible
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      throw new Error(
        "Unable to access storage. Please contact administrator.",
      );
    }

    const garageBucket = buckets?.find(
      (bucket) => bucket.name === "garage-logos",
    );
    if (!garageBucket) {
      console.error("garage-logos bucket not found");
      throw new Error(
        "Storage bucket not configured. Please contact administrator.",
      );
    }

    const ext = fileName.split(".").pop();
    const uniqueName = `logo_${crypto.randomUUID()}.${ext}`;

    // Try to upload with detailed error information
    const { error } = await supabase.storage
      .from("garage-logos")
      .upload(uniqueName, processedBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: finalContentType,
      });

    if (error) {
      console.error("Error uploading logo image:", error);

      // Provide specific error messages based on error type
      if (error.message?.includes("row-level security policy")) {
        throw new Error(
          "Storage permissions not configured properly. Admin access required.",
        );
      }
      if (error.message?.includes("bucket")) {
        throw new Error(
          "Storage bucket configuration error. Please contact administrator.",
        );
      }
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("garage-logos")
      .getPublicUrl(uniqueName);
    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.error("Logo upload error:", error);
    if (error instanceof Error) {
      throw error; // Re-throw known errors
    }
    throw new Error("Failed to upload logo image. Please try again.");
  }
}
