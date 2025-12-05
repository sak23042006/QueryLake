import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: NextRequest) {
  try {
    const bucketName = process.env.S3_BUCKET_NAME || process.env.BUCKET_NAME;
    
    if (!bucketName) {
      return NextResponse.json(
        { error: "S3 bucket name not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // --- ALLOWED EXTENSIONS CHECK (pdf, txt, json) ---
    const filename = (file as any).name || "";
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const allowed = new Set(["pdf", "txt", "json"]);

    if (!allowed.has(ext)) {
      // Ignore / reject unsupported types
      return NextResponse.json(
        { error: "Unsupported file type. Allowed: pdf, txt, json" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `raw/${file.name}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      key,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to S3" },
      { status: 500 }
    );
  }
}
