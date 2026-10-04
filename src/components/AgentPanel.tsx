import { Sparkles, CheckCircle2 } from 'lucide-react';
import type { AgentActivity } from '@/types';

interface AgentPanelProps {
  activities: AgentActivity[];
  compact?: boolean;
}

export function AgentPanel({ activities, compact }: AgentPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-plum" />
        <h3 className="font-semibold text-text-primary text-sm">AI Learning System</h3>
      </div>
      <div className={`space-y-3 ${compact ? '' : ''}`}>
        {activities.map((activity) => (
          <div key={activity.agent} className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {activity.status === 'done' ? (
                <CheckCircle2 size={18} className="text-sage" />
              ) : activity.status === 'active' ? (
                <div className="flex h-[18px] w-[18px] items-center justify-center">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-plum border-t-transparent" />
                </div>
              ) : (
                <div className="h-[18px] w-[18px] rounded-full border-2 border-border" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  activity.status === 'done'
                    ? 'text-text-primary'
                    : activity.status === 'active'
                    ? 'text-plum'
                    : 'text-text-secondary'
                }`}
              >
                {activity.agent}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
