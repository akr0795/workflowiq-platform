import React, { useState, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import TaskTable from '@/components/tasks/TaskTable';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import StatusFilter from '@/components/common/StatusFilter';
import { mockTasks as initialTasks } from '@/data/mockData';
import { TaskStatus, Task } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Tasks: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

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

  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  }, []);

  const handleSaveTask = useCallback((taskData: Partial<Task>) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...taskData, updatedAt: new Date().toISOString().split('T')[0] }
          : t
      ));
      toast({
        title: 'Task Updated',
        description: `"${taskData.title}" has been updated successfully.`,
      });
    } else {
      // Create new task
      const newTask: Task = {
        id: `TSK${String(tasks.length + 1).padStart(3, '0')}`,
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'created',
        priority: taskData.priority || 'medium',
        projectId: taskData.projectId || 'PRJ001',
        assigneeId: '3',
        reporterId: '2',
        dueDate: taskData.dueDate || '',
        estimatedHours: taskData.estimatedHours || 0,
        loggedHours: 0,
        tags: taskData.tags || [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setTasks(prev => [newTask, ...prev]);
      toast({
        title: 'Task Created',
        description: `"${newTask.title}" has been created successfully.`,
      });
    }
  }, [editingTask, tasks.length, toast]);

  const handleDeleteTask = useCallback(() => {
    if (deleteTask) {
      setTasks(prev => prev.filter(t => t.id !== deleteTask.id));
      toast({
        title: 'Task Deleted',
        description: `"${deleteTask.title}" has been deleted.`,
        variant: 'destructive',
      });
      setDeleteTask(null);
    }
  }, [deleteTask, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Tasks"
        subtitle={`${filteredTasks.length} tasks found`}
      />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <StatusFilter
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as TaskStatus | 'all')}
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Task['priority'] | 'all')}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Task */}
            <Button onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Tasks Table */}
        {filteredTasks.length > 0 ? (
          <TaskTable 
            tasks={filteredTasks} 
            onTaskClick={handleEditTask}
            onDeleteTask={setDeleteTask}
          />
        ) : (
          <div className="enterprise-card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground max-w-md">
              No tasks match your current filters. Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <TaskFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTask} onOpenChange={() => setDeleteTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTask?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasks;
