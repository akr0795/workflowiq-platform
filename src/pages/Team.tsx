import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Mail,
  Phone,
  MoreVertical,
  Users,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import TeamMemberFormModal, { TeamMember } from '@/components/team/TeamMemberFormModal';

const initialTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@tcs.com',
    role: 'admin',
    department: 'IT Operations',
    phone: '+91 98765 43210',
    utilization: 78,
    activeTasks: 8,
    completedTasks: 145,
    status: 'active',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@tcs.com',
    role: 'manager',
    department: 'Software Development',
    phone: '+91 98765 43211',
    utilization: 92,
    activeTasks: 12,
    completedTasks: 234,
    status: 'active',
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit.patel@tcs.com',
    role: 'developer',
    department: 'Software Development',
    phone: '+91 98765 43212',
    utilization: 85,
    activeTasks: 5,
    completedTasks: 178,
    status: 'active',
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@tcs.com',
    role: 'developer',
    department: 'Cloud Engineering',
    phone: '+91 98765 43213',
    utilization: 72,
    activeTasks: 4,
    completedTasks: 156,
    status: 'away',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.singh@tcs.com',
    role: 'developer',
    department: 'DevOps',
    phone: '+91 98765 43214',
    utilization: 88,
    activeTasks: 6,
    completedTasks: 192,
    status: 'active',
  },
  {
    id: '6',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@tcs.com',
    role: 'developer',
    department: 'Quality Assurance',
    phone: '+91 98765 43215',
    utilization: 65,
    activeTasks: 3,
    completedTasks: 134,
    status: 'offline',
  },
];

const roleColors: Record<TeamMember['role'], string> = {
  admin: 'bg-destructive/10 text-destructive',
  manager: 'bg-warning/10 text-warning',
  developer: 'bg-primary/10 text-primary',
};

const statusColors: Record<TeamMember['status'], string> = {
  active: 'bg-success',
  away: 'bg-warning',
  offline: 'bg-muted-foreground',
};

const Team: React.FC = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['admin']);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return teamMembers;
    const query = searchQuery.toLowerCase();
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query)
    );
  }, [searchQuery, teamMembers]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      toast.success(`${memberToDelete.name} has been removed from the team`);
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleSubmit = (memberData: TeamMember) => {
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === memberData.id ? memberData : m))
      );
      toast.success(`${memberData.name}'s details updated successfully`);
    } else {
      setTeamMembers((prev) => [...prev, memberData]);
      toast.success(`${memberData.name} added to the team`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Team"
        subtitle={`${teamMembers.length} team members`}
      />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
            />
          </div>

          {isAdmin && (
            <Button onClick={handleAddMember}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>

        {/* Team Grid */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <div
                key={member.id}
                className="enterprise-card p-5 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card',
                          statusColors[member.status]
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditMember(member)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(member)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Tasks</p>
                    <p className="text-lg font-semibold">{member.activeTasks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Completed</p>
                    <p className="text-lg font-semibold">{member.completedTasks}</p>
                  </div>
                </div>

                {/* Utilization */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">Utilization</span>
                    <span className="text-sm font-medium">{member.utilization}%</span>
                  </div>
                  <Progress value={member.utilization} className="h-2" />
                </div>

                {/* Role Badge */}
                <Badge className={cn('capitalize', roleColors[member.role])}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="enterprise-card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
            <p className="text-muted-foreground max-w-md">
              No team members match your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <TeamMemberFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        member={editingMember}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToDelete?.name} from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
