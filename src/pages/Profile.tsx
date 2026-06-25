import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Building2, Calendar, Shield, Edit2, Save, X, Briefcase, Clock, CheckCircle2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { getUserStats } = useData();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', department: '' });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, department: user.department });
    }
  }, [user]);

  const stats = user ? getUserStats(user.id) : { tasksCompleted: 0, projectsActive: 0, hoursLogged: 0, approvalsPending: 0 };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({ title: 'Validation Error', description: 'Name and email are required.', variant: 'destructive' });
      return;
    }
    updateUser(formData);
    toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) setFormData({ name: user.name, email: user.email, department: user.department });
    setIsEditing(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'destructive';
    if (role === 'manager') return 'default';
    return 'secondary';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header title="My Profile" subtitle="Manage your account settings" />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                    <Shield className="w-3 h-3 mr-1" />{user.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" />{user.email}</p>
                <p className="text-muted-foreground flex items-center gap-2"><Building2 className="w-4 h-4" />{user.department}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Button variant={isEditing ? 'outline' : 'default'} onClick={() => isEditing ? handleCancel() : setIsEditing(true)}>
                {isEditing ? <><X className="w-4 h-4 mr-2" />Cancel</> : <><Edit2 className="w-4 h-4 mr-2" />Edit Profile</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-success" /></div><div><p className="text-2xl font-bold">{stats.tasksCompleted}</p><p className="text-xs text-muted-foreground">Tasks Completed</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Briefcase className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.projectsActive}</p><p className="text-xs text-muted-foreground">Active Projects</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><Clock className="w-5 h-5 text-accent-foreground" /></div><div><p className="text-2xl font-bold">{stats.hoursLogged}</p><p className="text-xs text-muted-foreground">Hours Logged</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Shield className="w-5 h-5 text-warning" /></div><div><p className="text-2xl font-bold">{stats.approvalsPending}</p><p className="text-xs text-muted-foreground">Pending Approvals</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Personal Information</CardTitle>
            <CardDescription>{isEditing ? 'Update your personal details below' : 'Your personal information and account details'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} disabled={!isEditing} className={!isEditing ? 'bg-muted' : ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} disabled={!isEditing} className={!isEditing ? 'bg-muted' : ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={formData.department} onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))} disabled={!isEditing} className={!isEditing ? 'bg-muted' : ''} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled className="bg-muted capitalize" />
                <p className="text-xs text-muted-foreground">Contact admin to change role</p>
              </div>
            </div>
            {isEditing && (
              <>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
