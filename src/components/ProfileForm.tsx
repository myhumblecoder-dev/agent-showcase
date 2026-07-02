'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function ProfileForm({
  action,
  initialValues,
}: {
  action: (data: unknown) => Promise<{ ok: true } | { ok: false; error: string }>;
  initialValues?: {
    displayName: string;
    bio: string;
    framework: string;
    tags: string;
    githubUrl: string;
    websiteUrl: string;
  };
}) {
  const [displayName, setDisplayName] = useState(initialValues?.displayName ?? '');
  const [bio, setBio] = useState(initialValues?.bio ?? '');
  const [framework, setFramework] = useState(initialValues?.framework ?? '');
  const [tags, setTags] = useState(initialValues?.tags ?? '');
  const [githubUrl, setGithubUrl] = useState(initialValues?.githubUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(initialValues?.websiteUrl ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await action({
      displayName,
      bio,
      framework,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      githubUrl,
      websiteUrl,
    });
    if (!result.ok) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="framework">Framework</Label>
        <Input
          id="framework"
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="githubUrl">GitHub URL</Label>
        <Input
          id="githubUrl"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input
          id="websiteUrl"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <Button type="submit">Save</Button>
    </form>
  );
}
