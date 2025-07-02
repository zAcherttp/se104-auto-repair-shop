// Simple QR Code generator utility
// In a real application, you would use a proper QR code library like 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
    // For demo purposes, we'll create a simple data URL
    // In production, you should use a proper QR code library

    try {
        // Create a simple canvas-based QR code placeholder
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("Canvas context not available");

        canvas.width = 200;
        canvas.height = 200;

        // Fill with white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 200, 200);

        // Draw a simple grid pattern as placeholder
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";

        // Draw border
        ctx.strokeRect(10, 10, 180, 180);

        // Add text
        ctx.fillText("QR Code", 100, 50);
        ctx.fillText("Payment Data:", 100, 80);

        // Split data into lines for display
        const lines = data.match(/.{1,25}/g) || [data];
        lines.forEach((line, index) => {
            ctx.fillText(line, 100, 110 + (index * 15));
        });

        return canvas.toDataURL();
    } catch (error) {
        console.error("Error generating QR code:", error);
        // Return a simple placeholder data URL
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZjlmOSIgc3Ryb2tlPSIjZGRkIi8+CiAgPHRleHQgeD0iMTAwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMyI+UVIgQ29kZTwvdGV4dD4KPC9zdmc+";
    }
}
