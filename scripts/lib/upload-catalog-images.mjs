/**
 * Upload local public/ images into a Supabase Storage bucket and return public URLs.
 * Prefer Storage over base64/bytea in Postgres — smaller rows, CDN-friendly, cheaper.
 */
import { readFileSync, existsSync } from "node:fs";
import { basename, extname, join } from "node:path";

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function contentTypeFor(filePath) {
  return MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
}

/** Safe object key segment (keeps extension). */
function safeObjectName(fileName) {
  const ext = extname(fileName);
  const stem = basename(fileName, ext)
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${stem || "image"}${ext.toLowerCase()}`;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{
 *   bucket: string,
 *   publicDir: string,
 *   localPaths: string[],
 *   objectPrefix: string,
 * }} opts
 * @returns {Promise<string[]>} public Storage URLs
 */
export async function uploadLocalImagesToBucket(supabase, opts) {
  const { bucket, publicDir, localPaths, objectPrefix } = opts;
  const urls = [];

  for (const localPath of localPaths) {
    const relative = localPath.replace(/^\//, "");
    const abs = join(publicDir, relative);
    if (!existsSync(abs)) {
      throw new Error(`Image file not found: ${abs}`);
    }

    const fileName = safeObjectName(basename(relative));
    const objectPath = `${objectPrefix.replace(/\/$/, "")}/${fileName}`;
    const body = readFileSync(abs);
    const contentType = contentTypeFor(fileName);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, body, { contentType, upsert: true });

    if (uploadError) {
      throw new Error(
        `Upload failed (${bucket}/${objectPath}): ${uploadError.message}`,
      );
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    if (!data?.publicUrl) {
      throw new Error(`Missing public URL for ${bucket}/${objectPath}`);
    }
    urls.push(data.publicUrl);
  }

  return urls;
}
