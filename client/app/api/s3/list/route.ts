import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function GET() {
  try {
    const bucketName = process.env.S3_BUCKET_NAME || process.env.BUCKET_NAME;
    
    if (!bucketName) {
      return NextResponse.json(
        { error: "S3 bucket name not configured" },
        { status: 500 }
      );
    }

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: "raw/",
    });

    const response = await s3Client.send(command);

    
    const files = response.Contents?.map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    })) || [];

    return NextResponse.json({ files });
  } catch (error) {
    console.error("S3 list error:", error);
    return NextResponse.json(
      { error: "Failed to list files from S3" },
      { status: 500 }
    );
  }
}
