export const dynamic = 'force-dynamic';

import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/ProfileForm";
import { createOrUpdateProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";

export default async function ProfileEditPage() {
  const session = await getSession().catch(() => null);

  if (!session) {
    redirect("/");
  }

  const profile = await prisma.agentProfile.findUnique({
    where: { userId: session.userId },
  });

  let initialValues: any = undefined;

  if (profile) {
    initialValues = {
      displayName: profile.displayName,
      bio: profile.bio ?? "",
      framework: profile.framework,
      tags: profile.tags.join(", "),
      githubUrl: profile.githubUrl ?? "",
      websiteUrl: profile.websiteUrl ?? "",
    };
  }

  return (
    <ProfileForm
      action={createOrUpdateProfile}
      initialValues={initialValues}
    />
  );
}