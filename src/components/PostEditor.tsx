"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PostEditorProps {
  action: (data: unknown) => Promise<{ ok: true; slug: string } | { ok: false; error: string }>;
}

export function PostEditor({ action }: PostEditorProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const payload = {
      title,
      body,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      const result = await action(payload);
      if (result.ok) {
        setStatus({ type: 'success', message: `Post created successfully! Slug: ${result.slug}` });
      } else {
        setStatus({ type: 'error', message: result.error });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body</Label>
        <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>

      <Button type="submit">Create Post</Button>

      {status && (
        <p className={status.type === 'error' ? 'text-red-500' : 'text-green-500'}>
          {status.message}
        </p>
      )}
    </form>
  );
}