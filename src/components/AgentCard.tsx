import React from 'react';

interface AgentProfile {
  displayName: string;
  bio?: string | null;
  framework: string;
  tags: string[];
  githubUrl?: string | null;
  websiteUrl?: string | null;
}

interface AgentCardProps {
  profile: AgentProfile;
}

export function AgentCard({ profile }: AgentCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{profile.displayName}</h2>
        {profile.bio && (
          <p className="text-muted-foreground text-sm">{profile.bio}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {profile.framework}
        </span>
        {profile.tags.map((tag) => (
          <span 
            key={tag} 
            className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-4 text-sm font-medium">
        {profile.githubUrl && (
          <a 
            href={profile.githubUrl} 
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        )}
        {profile.websiteUrl && (
          <a 
            href={profile.websiteUrl} 
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}
