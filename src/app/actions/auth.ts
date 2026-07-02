import { auth } from '@/auth';

export async function getSession(): Promise<{ userId: string; name: string | null; email: string | null; image: string | null }> {
  const session = await auth();

  if (!session || !session.user?.id) {
    throw new Error('Unauthenticated');
  }

  return {
    userId: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };
}

export { getSession as defaultGetSession };