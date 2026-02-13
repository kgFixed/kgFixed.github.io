
import React from 'react';
import { ExternalLink, Copy, CheckCircle2, Info, Loader2, Database } from 'lucide-react';
import { LDESFeed } from '../types';

interface FeedCardProps {
  feed: LDESFeed;
  onSelect: (url: string) => void;
  isSelected: boolean;
}

export const FeedCard: React.FC<FeedCardProps> = ({ feed, onSelect, isSelected }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(feed.latestTtlUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => onSelect(feed.baseUrl)}
      className={`group relative overflow-hidden rounded-xl border p-5 transition-all cursor-pointer bg-white hover:shadow-lg ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            <Database size={20} />
          </div>
          <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{feed.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-400 hover:text-blue-600 transition-colors"
            title="Copy latest.ttl link"
          >
            {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
          <a 
            href={feed.latestTtlUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-slate-100 rounded-md text-slate-400 hover:text-blue-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
        {feed.description || "No description provided for this stream."}
      </p>

      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
            {feed.members.length} Members
          </span>
          {feed.error && (
            <span className="text-red-500 font-semibold">Fetch Failed</span>
          )}
        </div>
        <span className="mono truncate max-w-[150px] opacity-60">{feed.baseUrl}</span>
      </div>

      {feed.loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
};
