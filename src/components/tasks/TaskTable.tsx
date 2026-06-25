import React from 'react';
import { Task } from '@/types';
import TaskStatusBadge from './TaskStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Calendar, Trash2, User } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  getAssigneeName?: (id: string) => string;
  getProjectName?: (id: string) => string;
}

const priorityColors: Record<Task['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  critical: 'bg-destructive/10 text-destructive',
};

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onTaskClick, onDeleteTask, getAssigneeName, getProjectName }) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isOverdue = (dueDate: string, status: Task['status']) => status !== 'done' && new Date(dueDate) < new Date();

  return (
    <div className="enterprise-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[250px]">Task</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Time Logged</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer data-table-row" onClick={() => onTaskClick?.(task)}>
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[230px]">{task.description}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{getProjectName?.(task.projectId) || task.projectId}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {getAssigneeName?.(task.assigneeId) || task.assigneeId}
                </div>
              </TableCell>
              <TableCell><TaskStatusBadge status={task.status} /></TableCell>
              <TableCell><Badge className={cn(priorityColors[task.priority])}>{task.priority}</Badge></TableCell>
              <TableCell>
                <div className={cn('flex items-center gap-1.5', isOverdue(task.dueDate, task.status) && 'text-destructive')}>
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(task.dueDate)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{task.loggedHours}h / {task.estimatedHours}h</span>
                </div>
              </TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteTask?.(task); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
