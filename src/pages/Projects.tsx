import React, { useState, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFormModal from '@/components/projects/ProjectFormModal';
import StatusFilter from '@/components/common/StatusFilter';
import { Project, ProjectStatus } from '@/types';
import { useData } from '@/contexts/DataContext';
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
  const { projects, addProject, updateProject, deleteProject } = useData();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const statusOptions = useMemo(() => [
    { value: 'all' as const, label: 'All', count: projects.length },
    { value: 'active' as const, label: 'Active', count: projects.filter(p => p.status === 'active').length },
    { value: 'on-hold' as const, label: 'On Hold', count: projects.filter(p => p.status === 'on-hold').length },
    { value: 'completed' as const, label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
    { value: 'cancelled' as const, label: 'Cancelled', count: projects.filter(p => p.status === 'cancelled').length },
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

  const handleSaveProject = useCallback((projectData: Partial<Project>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      toast({ title: 'Project Updated', description: `"${projectData.name}" has been updated successfully.` });
    } else {
      addProject(projectData);
      toast({ title: 'Project Created', description: `"${projectData.name}" has been created successfully.` });
    }
  }, [editingProject, addProject, updateProject, toast]);

  const handleDeleteProject = useCallback(() => {
    if (deleteTarget) {
      deleteProject(deleteTarget.id);
      toast({ title: 'Project Deleted', description: `"${deleteTarget.name}" and its tasks have been removed.`, variant: 'destructive' });
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteProject, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Projects" subtitle={`${filteredProjects.length} projects found`} />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <StatusFilter options={statusOptions} value={statusFilter} onChange={(v) => setStatusFilter(v as ProjectStatus | 'all')} />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="search" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 pl-10" />
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-background shadow-sm' : ''}><Grid3X3 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-background shadow-sm' : ''}><List className="w-4 h-4" /></Button>
            </div>
            <Button onClick={() => { setEditingProject(null); setIsFormModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Project
            </Button>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project, index) => (
              <div key={project.id} className="animate-fade-in relative group" style={{ animationDelay: `${index * 50}ms` }}>
                <ProjectCard project={project} onClick={() => { setEditingProject(project); setIsFormModalOpen(true); }} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingProject(project); setIsFormModalOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Search className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground max-w-md">No projects match your current filters.</p>
          </div>
        )}
      </div>

      <ProjectFormModal open={isFormModalOpen} onOpenChange={setIsFormModalOpen} project={editingProject} onSave={handleSaveProject} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{deleteTarget?.name}"? All related tasks will also be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
