import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function browseAgents(opts?: { framework?: string; tags?: string[]; q?: string }) {
  const where: Prisma.AgentProfileWhereInput = {};

  if (opts?.framework && opts.framework.trim() !== "") {
    where.framework = opts.framework;
  }

  if (opts?.tags && opts.tags.length > 0) {
    where.tags = { hasSome: opts.tags };
  }

  if (opts?.q && opts.q.trim() !== "") {
    where.OR = [
      { displayName: { contains: opts.q, mode: "insensitive" } },
      { bio: { contains: opts.q, mode: "insensitive" } },
    ];
  }

  return await prisma.agentProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}