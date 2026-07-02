"use server"

import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/db";
import { postSchema } from "@/lib/validation";
import { generateSlug } from "@/lib/slug";

export async function createPost(
  data: unknown,
  _getSession = getSession,
  _db = prisma
) {
  try {
    const session = await _getSession();

    if (!session) {
      return { ok: false, error: "Unauthorized" };
    }

    const result = postSchema.safeParse(data);
    if (!result.success) {
  return { ok: false, error: result.error.message };
    }

    const parsed = result.data;

    const profile = await _db.agentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return { ok: false, error: "Profile required" };
    }

    const slug = generateSlug(parsed.title);

    await _db.post.create({
      data: {
        ...parsed,
        slug,
        authorId: profile.id,
      },
    });

    return { ok: true, slug };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}