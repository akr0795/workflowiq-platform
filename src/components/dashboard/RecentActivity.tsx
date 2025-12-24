import React from 'react';
import { CheckCircle2, Clock, AlertCircle, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'task_completed' | 'task_created' | 'approval_pending' | 'deadline_warning';
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    title: 'Task Completed',
    description: 'User authentication module marked as done',
    time: '10 minutes ago',
  },
  {
    id: '2',
    type: 'approval_pending',
    title: 'Approval Required',
    description: 'Leave request from Amit Patel awaiting review',
    time: '2 hours ago',
  },
  {
    id: '3',
    type: 'deadline_warning',
    title: 'Deadline Approaching',
    description: 'Database schema design due in 2 days',
    time: '5 hours ago',
  },
  {
    id: '4',
    type: 'task_created',
    title: 'New Task Assigned',
    description: 'Setup CI/CD pipeline added to your queue',
    time: '1 day ago',
  },
  {
    id: '5',
    type: 'task_completed',
    title: 'Milestone Achieved',
    description: 'Cloud Migration reached 80% completion',
    time: '1 day ago',
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'task_completed':
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    case 'task_created':
      return <Clock className="w-5 h-5 text-primary" />;
    case 'approval_pending':
      return <FileCheck className="w-5 h-5 text-warning" />;
    case 'deadline_warning':
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    default:
      return <Clock className="w-5 h-5 text-muted-foreground" />;
  }
};

const RecentActivity: React.FC = () => {
  return (
    <div className="enterprise-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              'flex items-start gap-3 pb-4',
              index !== activities.length - 1 && 'border-b border-border'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
