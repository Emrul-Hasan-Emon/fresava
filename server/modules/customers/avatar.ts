import { randomUUID } from "node:crypto";
import { database } from "../../infrastructure/supabase";
import { HttpError, databaseError } from "../../http/errors";
export function imageType(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { mime: "image/jpeg", ext: "jpg" };
  if (
    Buffer.from(bytes.subarray(0, 8)).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
  )
    return { mime: "image/png", ext: "png" };
  if (
    Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" &&
    Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP"
  )
    return { mime: "image/webp", ext: "webp" };
  throw new HttpError(400, "Choose a JPG, PNG or WebP image.");
}
export async function uploadAvatar(id: string, file: File) {
  if (file.size > 5 * 1024 * 1024 || file.size < 12)
    throw new HttpError(400, "Choose an image smaller than 5 MB.");
  const data = new Uint8Array(await file.arrayBuffer());
  const type = imageType(data);
  if (type.mime !== file.type)
    throw new HttpError(400, "Image type does not match its content.");
  const path = `customer/${id}/${randomUUID()}.${type.ext}`,
    db = database();
  const previous = await db
    .from("customers")
    .select("avatar_path")
    .eq("id", id)
    .single();
  databaseError(previous.error);
  const upload = await db.storage
    .from("avatars")
    .upload(path, data, { contentType: type.mime });
  databaseError(upload.error);
  const updated = await db
    .from("customers")
    .update({ avatar_path: path })
    .eq("id", id);
  if (updated.error) {
    await db.storage.from("avatars").remove([path]);
    databaseError(updated.error);
  }
  if (previous.data?.avatar_path)
    await db.storage.from("avatars").remove([previous.data.avatar_path]);
}
