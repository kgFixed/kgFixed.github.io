
import React from 'react';
import { LDESFeed } from '../types';
import { Sparkles, Tag, ChevronRight, Hash } from 'lucide-react';

interface MemberDetailsProps {
  feed: LDESFeed;
}

export const MemberDetails: React.FC<MemberDetailsProps> = ({ feed }) => {
  if (!feed.members.length && !feed.loading && !feed.error) {
    return (
      <div className="bg-white border rounded-xl p-12 text-center text-slate-400">
        <p>No members found in this fragment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      {feed.aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
            <Sparkles size={18} />
            <span>AI Insights</span>
          </div>
          <p className="text-slate-700 leading-relaxed italic">
            "{feed.aiAnalysis}"
          </p>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Hash size={14} />
          Feed Members ({feed.members.length})
        </h4>
        
        {feed.members.map((member, idx) => (
          <div key={member.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:border-blue-200 transition-colors">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{member.label}</span>
              </div>
              <span className="text-[10px] mono text-slate-400 truncate max-w-[300px]">{member.id}</span>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {member.properties.slice(0, 10).map((prop, pIdx) => (
                <div key={pIdx} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {prop.shortPredicate || 'Property'}
                  </span>
                  <span className="text-xs text-slate-600 truncate bg-slate-50 px-2 py-1 rounded border border-slate-100" title={prop.object}>
                    {prop.object}
                  </span>
                </div>
              ))}
              {member.properties.length > 10 && (
                <div className="col-span-full text-[10px] text-slate-400 italic text-center pt-2">
                  + {member.properties.length - 10} more properties
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
