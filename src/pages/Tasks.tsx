import React, { useState, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import TaskTable from '@/components/tasks/TaskTable';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import StatusFilter from '@/components/common/StatusFilter';
import { TaskStatus, Task } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const Tasks: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { tasks, projects, teamMembers, addTask, updateTask, deleteTask, getMemberById, getProjectById } = useData();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const statusOptions = useMemo(() => [
    { value: 'all' as const, label: 'All', count: tasks.length },
    { value: 'created' as const, label: 'Created', count: tasks.filter(t => t.status === 'created').length },
    { value: 'in-progress' as const, label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { value: 'review' as const, label: 'Review', count: tasks.filter(t => t.status === 'review').length },
    { value: 'done' as const, label: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ], [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesSearch =
        debouncedSearch === '' ||
        task.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, statusFilter, priorityFilter, debouncedSearch]);

  const handleSaveTask = useCallback((taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast({ title: 'Task Updated', description: `"${taskData.title}" has been updated successfully.` });
    } else {
      addTask({ ...taskData, reporterId: user?.id || '2', assigneeId: taskData.assigneeId || user?.id || '3' });
      toast({ title: 'Task Created', description: `"${taskData.title}" has been created successfully.` });
    }
  }, [editingTask, addTask, updateTask, user, toast]);

  const handleDeleteTask = useCallback(() => {
    if (deleteTarget) {
      deleteTask(deleteTarget.id);
      toast({ title: 'Task Deleted', description: `"${deleteTarget.title}" has been deleted.`, variant: 'destructive' });
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteTask, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Tasks" subtitle={`${filteredTasks.length} tasks found`} />

      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <StatusFilter options={statusOptions} value={statusFilter} onChange={(v) => setStatusFilter(v as TaskStatus | 'all')} />
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="search" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 pl-10" />
            </div>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Task['priority'] | 'all')}>
              <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setEditingTask(null); setIsFormModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Task
            </Button>
          </div>
        </div>

        {filteredTasks.length > 0 ? (
          <TaskTable
            tasks={filteredTasks}
            onTaskClick={(task) => { setEditingTask(task); setIsFormModalOpen(true); }}
            onDeleteTask={setDeleteTarget}
            getAssigneeName={(id) => getMemberById(id)?.name || 'Unassigned'}
            getProjectName={(id) => getProjectById(id)?.name || id}
          />
        ) : (
          <div className="enterprise-card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Search className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground max-w-md">No tasks match your current filters.</p>
          </div>
        )}
      </div>

      <TaskFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        task={editingTask}
        projects={projects}
        teamMembers={teamMembers}
        onSave={handleSaveTask}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{deleteTarget?.title}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasks;
