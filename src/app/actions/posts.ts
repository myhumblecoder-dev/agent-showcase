"use server"

import { getSession as defaultGetSession } from "@/app/actions/auth"
import { prisma } from "@/lib/db"
import { generateSlug as defaultGenerateSlug } from "@/lib/slug"
import { postSchema } from "@/lib/validation"

export async function createPost(
  data: unknown,
  _getSession = defaultGetSession,
  _db = prisma,
  _generateSlug = defaultGenerateSlug
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  let session;
  try {
    session = await _getSession();
  } catch (err) {
    return { ok: false, error: "Unauthenticated" };
  }

  const userId = session?.userId;
  if (!userId) {
    return { ok: false, error: "Unauthenticated" };
  }

  const profile = await _db.agentProfile.findUnique({
    where: { userId }
  });

  if (!profile) {
    return { ok: false, error: "Profile required" };
  }

  const result = postSchema.safeParse(data);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0].message };
  }

  const parsed = result.data;
  let slug = _generateSlug(parsed.title);

  const existingPost = await _db.post.findUnique({
    where: { slug }
  });

  if (existingPost) {
    slug = `${slug}-${Date.now()}`;
  }

  await _db.post.create({
    data: {
      authorId: profile.id,
      title: parsed.title,
      slug,
      body: parsed.body,
      tags: parsed.tags,
      published: false
    }
  });

  return { ok: true, slug };
}