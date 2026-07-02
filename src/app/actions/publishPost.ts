"use server"

import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/db";

export async function publishPost(
  postId: string,
  _getSession = getSession,
  _db = prisma
) {
  try {
    const session = await _getSession();

    if (!session) {
      return { ok: false, error: "Unauthorized" };
    }

    const post = await _db.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      return { ok: false, error: "Not found" };
    }

    if (post.author.userId !== session.userId) {
      return { ok: false, error: "Forbidden" };
    }

    await _db.post.update({
      where: { id: postId },
      data: { published: true },
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}