import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, FileCheck, Users, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { ActivityType } from '@/types';

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'task_completed': return <CheckCircle2 className="w-5 h-5 text-success" />;
    case 'task_created':
    case 'task_updated': return <Clock className="w-5 h-5 text-primary" />;
    case 'approval_pending':
    case 'approval_approved':
    case 'approval_rejected': return <FileCheck className="w-5 h-5 text-warning" />;
    case 'deadline_warning': return <AlertCircle className="w-5 h-5 text-destructive" />;
    case 'project_created':
    case 'project_updated': return <FolderKanban className="w-5 h-5 text-primary" />;
    case 'team_update': return <Users className="w-5 h-5 text-info" />;
    default: return <Clock className="w-5 h-5 text-muted-foreground" />;
  }
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const RecentActivity: React.FC = () => {
  const navigate = useNavigate();
  const { activities } = useData();
  const recent = activities.slice(0, 5);

  return (
    <div className="enterprise-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      {recent.length > 0 ? (
        <div className="space-y-4">
          {recent.map((activity, index) => (
            <div
              key={activity.id}
              className={cn('flex items-start gap-3 pb-4 cursor-pointer hover:opacity-80', index !== recent.length - 1 && 'border-b border-border')}
              onClick={() => activity.link && navigate(activity.link)}
            >
              <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(activity.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No recent activity yet.</p>
      )}
    </div>
  );
};

export default RecentActivity;
