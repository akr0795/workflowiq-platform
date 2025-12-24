import React, { useState, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFormModal from '@/components/projects/ProjectFormModal';
import StatusFilter from '@/components/common/StatusFilter';
import { mockProjects as initialProjects } from '@/data/mockData';
import { Project, ProjectStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Grid3X3, List, Edit2, Trash2 } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
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

type ViewMode = 'grid' | 'list';

const Projects: React.FC = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const statusOptions = useMemo(() => [
    { value: 'all' as const, label: 'All', count: projects.length },
    { value: 'active' as const, label: 'Active', count: projects.filter(p => p.status === 'active').length },
    { value: 'on-hold' as const, label: 'On Hold', count: projects.filter(p => p.status === 'on-hold').length },
    { value: 'completed' as const, label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
  ], [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesSearch =
        debouncedSearch === '' ||
        project.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        project.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        project.id.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, debouncedSearch]);

  const handleCreateProject = useCallback(() => {
    setEditingProject(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setIsFormModalOpen(true);
  }, []);

  const handleSaveProject = useCallback((projectData: Partial<Project>) => {
    if (editingProject) {
      // Update existing project
      setProjects(prev => prev.map(p => 
        p.id === editingProject.id 
          ? { ...p, ...projectData, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      ));
      toast({
        title: 'Project Updated',
        description: `"${projectData.name}" has been updated successfully.`,
      });
    } else {
      // Create new project
      const newProject: Project = {
        id: `PRJ${String(projects.length + 1).padStart(3, '0')}`,
        name: projectData.name || '',
        description: projectData.description || '',
        status: projectData.status || 'active',
        priority: projectData.priority || 'medium',
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        endDate: projectData.endDate || '',
        progress: 0,
        managerId: '2',
        teamMembers: ['3'],
        budget: projectData.budget || 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setProjects(prev => [newProject, ...prev]);
      toast({
        title: 'Project Created',
        description: `"${newProject.name}" has been created successfully.`,
      });
    }
  }, [editingProject, projects.length, toast]);

  const handleDeleteProject = useCallback(() => {
    if (deleteProject) {
      setProjects(prev => prev.filter(p => p.id !== deleteProject.id));
      toast({
        title: 'Project Deleted',
        description: `"${deleteProject.name}" has been deleted.`,
        variant: 'destructive',
      });
      setDeleteProject(null);
    }
  }, [deleteProject, toast]);

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
            <Button onClick={handleCreateProject}>
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
                className="animate-fade-in relative group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProjectCard
                  project={project}
                  onClick={() => handleEditProject(project)}
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteProject(project);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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

      {/* Form Modal */}
      <ProjectFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        project={editingProject}
        onSave={handleSaveProject}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
