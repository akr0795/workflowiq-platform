import React, { useState, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import ProjectCard from '@/components/projects/ProjectCard';
import StatusFilter from '@/components/common/StatusFilter';
import { mockProjects } from '@/data/mockData';
import { ProjectStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Grid3X3, List } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';

type ViewMode = 'grid' | 'list';

const Projects: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const statusOptions = useMemo(() => [
    { value: 'all' as const, label: 'All', count: mockProjects.length },
    { value: 'active' as const, label: 'Active', count: mockProjects.filter(p => p.status === 'active').length },
    { value: 'on-hold' as const, label: 'On Hold', count: mockProjects.filter(p => p.status === 'on-hold').length },
    { value: 'completed' as const, label: 'Completed', count: mockProjects.filter(p => p.status === 'completed').length },
  ], []);

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesSearch =
        debouncedSearch === '' ||
        project.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        project.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        project.id.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, debouncedSearch]);

  const handleProjectClick = useCallback((project: typeof mockProjects[0]) => {
    console.log('Project clicked:', project.id);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Projects"
        subtitle={`${filteredProjects.length} projects found`}
      />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <StatusFilter
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as ProjectStatus | 'all')}
          />

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-background shadow-sm' : ''}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-background shadow-sm' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Add Project */}
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProjectCard
                  project={project}
                  onClick={() => handleProjectClick(project)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground max-w-md">
              No projects match your current filters. Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
