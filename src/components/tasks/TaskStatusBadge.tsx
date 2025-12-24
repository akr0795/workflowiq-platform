import React from 'react';
import { TaskStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  created: {
    label: 'Created',
    className: 'bg-muted text-muted-foreground border-muted',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-info/10 text-info border-info/20',
  },
  review: {
    label: 'In Review',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  done: {
    label: 'Done',
    className: 'bg-success/10 text-success border-success/20',
  },
};

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
};

export default TaskStatusBadge;
