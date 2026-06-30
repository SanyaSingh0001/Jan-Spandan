import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "community-hero";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Upload to Cloudinary using authenticated SDK
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    });
  } catch (error: unknown) {
    // Cloudinary SDK throws objects, not Error instances
    console.error("Upload error details:", JSON.stringify(error, null, 2));
    let msg = "Unknown error";
    if (error instanceof Error) {
      msg = error.message;
    } else if (typeof error === "object" && error !== null) {
      // Cloudinary error format: { error: { message: "..." }, http_code: 401 }
      const cloudinaryErr = error as any;
      msg = cloudinaryErr?.error?.message || cloudinaryErr?.message || JSON.stringify(error);
    }
    return NextResponse.json({ error: "Upload failed: " + msg }, { status: 500 });
  }
}
