import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import TaskTable from '@/components/tasks/TaskTable';
import StatusFilter from '@/components/common/StatusFilter';
import { mockTasks } from '@/data/mockData';
import { TaskStatus, Task } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Tasks: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const statusOptions = useMemo(() => [
    { value: 'all' as const, label: 'All', count: mockTasks.length },
    { value: 'created' as const, label: 'Created', count: mockTasks.filter(t => t.status === 'created').length },
    { value: 'in-progress' as const, label: 'In Progress', count: mockTasks.filter(t => t.status === 'in-progress').length },
    { value: 'review' as const, label: 'Review', count: mockTasks.filter(t => t.status === 'review').length },
    { value: 'done' as const, label: 'Done', count: mockTasks.filter(t => t.status === 'done').length },
  ], []);

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesSearch =
        debouncedSearch === '' ||
        task.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [statusFilter, priorityFilter, debouncedSearch]);

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task.id);
  };

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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Tasks Table */}
        {filteredTasks.length > 0 ? (
          <TaskTable tasks={filteredTasks} onTaskClick={handleTaskClick} />
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
    </div>
  );
};

export default Tasks;
