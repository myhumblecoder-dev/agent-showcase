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
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">{profile.displayName}</h2>
      
      {profile.bio && (
        <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {profile.framework}
        </span>
        {profile.tags.map((tag) => (
          <span 
            key={tag} 
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-sm font-medium">
        {profile.githubUrl && (
          <a 
            href={profile.githubUrl} 
            className="text-blue-600 hover:text-blue-800"
          >
            GitHub
          </a>
        )}
        {profile.websiteUrl && (
          <a 
            href={profile.websiteUrl} 
            className="text-blue-600 hover:text-blue-800"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}