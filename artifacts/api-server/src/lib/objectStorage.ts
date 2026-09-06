import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { Storage, type File } from "@google-cloud/storage";

const SIDECAR = "http://127.0.0.1:1106";
const isGoogleCloudStorage = process.env.STORAGE_PROVIDER === "gcs";
const storage = isGoogleCloudStorage
  ? new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: process.env.GCS_CLIENT_EMAIL && process.env.GCS_PRIVATE_KEY
        ? {
            client_email: process.env.GCS_CLIENT_EMAIL,
            private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }
        : undefined,
    })
  : new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${SIDECAR}/token`,
        type: "external_account",
        credential_source: { url: `${SIDECAR}/credential`, format: { type: "json", subject_token_field_name: "access_token" } },
        universe_domain: "googleapis.com",
      },
      projectId: "",
    });

function parseObjectPath(value: string) {
  const normalized = value.startsWith("/") ? value : `/${value}`;
  const [, bucket, ...rest] = normalized.split("/");
  if (!bucket || rest.length === 0) throw new Error("مسار التخزين غير صالح");
  return { bucket, object: rest.join("/") };
}

async function signPutUrl(bucket: string, object: string, contentType: string) {
  if (isGoogleCloudStorage) {
    const [url] = await storage.bucket(bucket).file(object).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });
    return url;
  }

  const response = await fetch(`${SIDECAR}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucket,
      object_name: object,
      method: "PUT",
      content_type: contentType,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
  });
  if (!response.ok) throw new Error(`تعذر إنشاء رابط التخزين (${response.status})`);
  const body = await response.json() as { signed_url: string };
  return body.signed_url;
}

export async function requestImageUpload(contentType: string) {
  const privateDir = process.env.PRIVATE_OBJECT_DIR;
  if (!privateDir) throw new Error("PRIVATE_OBJECT_DIR غير مضبوط");
  const { bucket } = parseObjectPath(privateDir);
  const object = `${privateDir.replace(/^\/[^/]+\/?/, "")}/uploads/${randomUUID()}`;
  const uploadURL = await signPutUrl(bucket, object, contentType);
  return { uploadURL, objectPath: `/objects/${object.replace(/^.*?\/uploads\//, "uploads/")}`, contentType };
}

export async function getObjectFile(objectPath: string): Promise<File> {
  const privateDir = process.env.PRIVATE_OBJECT_DIR;
  if (!privateDir || !objectPath.startsWith("/objects/")) throw new Error("المسار غير صالح");
  const { bucket } = parseObjectPath(privateDir);
  const object = `${privateDir.replace(/^\/[^/]+\/?/, "")}/${objectPath.slice("/objects/".length)}`;
  const file = storage.bucket(bucket).file(object);
  const [exists] = await file.exists();
  if (!exists) throw new Error("الملف غير موجود");
  return file;
}

export async function streamObject(file: File, res: { setHeader: (name: string, value: string) => void; status: (code: number) => any; end: () => void }) {
  const [metadata] = await file.getMetadata();
  res.setHeader("Content-Type", metadata.contentType || "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  if (metadata.size) res.setHeader("Content-Length", String(metadata.size));
  Readable.from(file.createReadStream()).pipe(res as any);
}