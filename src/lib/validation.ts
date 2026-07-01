import { z } from "zod"

export const agentProfileSchema = z.object({
  displayName: z.string().trim().min(1),
  bio: z.string().trim().optional(),
  framework: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).max(10),
  githubUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal(""))
})

export const postSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).max(10)
})