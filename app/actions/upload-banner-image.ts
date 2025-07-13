"use server";

import { checkAdminRole } from "./settings";
import sharp from "sharp";

/**
 * Processes images under 10MB, crops to square, and compresses to under 1MB
 * @param buffer - The image buffer
 * @param contentType - The MIME type
 * @returns Processed buffer and potentially updated content type
 */
async function processImage(
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

        // Get image metadata to determine square crop dimensions
        const metadata = await sharp(inputBuffer).metadata();
        const { width = 1920, height = 1080 } = metadata;

        // Determine square size (use the smaller dimension)
        const squareSize = Math.min(width, height);

        // Calculate crop position to center the square
        const left = Math.floor((width - squareSize) / 2);
        const top = Math.floor((height - squareSize) / 2);

        // Start with high quality and progressively reduce until under 1MB
        let quality = 90;
        let processedBuffer: Buffer;

        do {
            if (contentType.includes("jpeg") || contentType.includes("jpg")) {
                processedBuffer = await sharp(inputBuffer)
                    .extract({
                        left,
                        top,
                        width: squareSize,
                        height: squareSize,
                    })
                    .resize(1024, 1024) // Standard square banner size
                    .jpeg({ quality, progressive: true })
                    .toBuffer();
            } else if (contentType.includes("png")) {
                processedBuffer = await sharp(inputBuffer)
                    .extract({
                        left,
                        top,
                        width: squareSize,
                        height: squareSize,
                    })
                    .resize(1024, 1024)
                    .png({ quality, progressive: true })
                    .toBuffer();
            } else if (contentType.includes("webp")) {
                processedBuffer = await sharp(inputBuffer)
                    .extract({
                        left,
                        top,
                        width: squareSize,
                        height: squareSize,
                    })
                    .resize(1024, 1024)
                    .webp({ quality })
                    .toBuffer();
            } else {
                // Convert to JPEG for other formats
                processedBuffer = await sharp(inputBuffer)
                    .extract({
                        left,
                        top,
                        width: squareSize,
                        height: squareSize,
                    })
                    .resize(1024, 1024)
                    .jpeg({ quality, progressive: true })
                    .toBuffer();
                contentType = "image/jpeg";
            }

            // Reduce quality for next iteration if still too large
            quality -= 10;
        } while (processedBuffer.byteLength > TARGET_SIZE && quality > 30);

        return {
            buffer: processedBuffer.buffer as ArrayBuffer,
            contentType,
        };
    } catch (error) {
        console.error("Error processing image:", error);
        throw new Error(
            "Failed to process image. Please try a different image.",
        );
    }
}

/**
 * Uploads a new banner image, deleting the previous one if provided.
 * @param buffer - The image data
 * @param fileName - The original file name
 * @param contentType - The MIME type
 * @param previousUrl - The previous banner image public URL (optional)
 * @returns The new public URL or null
 */
export async function uploadBannerImage({
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

        // Process image: crop to square and compress to under 1MB
        const { buffer: processedBuffer, contentType: finalContentType } =
            await processImage(buffer, contentType);

        // Remove previous image if previousUrl is provided
        if (previousUrl) {
            try {
                // Extract the filename from the public URL
                const url = new URL(previousUrl);
                const parts = url.pathname.split("/");
                const fileKey = parts.slice(parts.indexOf("garage-banners") + 1)
                    .join("/");
                if (fileKey) {
                    await supabase.storage.from("garage-banners").remove([
                        fileKey,
                    ]);
                }
            } catch (err) {
                // Log and continue
                console.warn("Failed to remove previous banner image:", err);
            }
        }

        // Check if garage-banners bucket exists and is accessible
        const { data: buckets, error: bucketsError } = await supabase.storage
            .listBuckets();
        if (bucketsError) {
            console.error("Error listing buckets:", bucketsError);
            throw new Error(
                "Unable to access storage. Please contact administrator.",
            );
        }
        //console.log("Available buckets:", buckets);

        const garageBucket = buckets?.find((bucket) =>
            bucket.name === "garage-banners"
        );
        if (!garageBucket) {
            console.error("garage-banners bucket not found");
            throw new Error(
                "Storage bucket not configured. Please contact administrator.",
            );
        }

        const ext = fileName.split(".").pop();
        const uniqueName = `banner_${crypto.randomUUID()}.${ext}`;

        // Try to upload with detailed error information
        const { error } = await supabase.storage
            .from("garage-banners")
            .upload(uniqueName, processedBuffer, {
                cacheControl: "3600",
                upsert: true,
                contentType: finalContentType,
            });

        if (error) {
            console.error("Error uploading banner image:", error);

            // Provide specific error messages based on error type
            if (error.message?.includes("row-level security policy")) {
                throw new Error(
                    "Storage permissions not configured properly. Admin access required.",
                );
            } else if (error.message?.includes("bucket")) {
                throw new Error(
                    "Storage bucket configuration error. Please contact administrator.",
                );
            } else {
                throw new Error(`Upload failed: ${error.message}`);
            }
        }

        const { data: publicUrlData } = supabase.storage
            .from("garage-banners")
            .getPublicUrl(uniqueName);
        return publicUrlData?.publicUrl || null;
    } catch (error) {
        console.error("Banner upload error:", error);
        if (error instanceof Error) {
            throw error; // Re-throw known errors
        }
        throw new Error("Failed to upload banner image. Please try again.");
    }
}
