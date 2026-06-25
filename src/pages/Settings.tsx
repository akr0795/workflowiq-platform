import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, updateUser, changePassword } = useAuth();
  const { preferences, updatePreferences } = useData();

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', department: user?.department || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notifPrefs, setNotifPrefs] = useState(preferences.notifications);
  const [appearance, setAppearance] = useState(preferences.appearance);

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleSaveProfile = () => {
    updateUser(profile);
    toast.success('Profile updated successfully');
  };

  const handleSaveNotifications = () => {
    updatePreferences({ notifications: notifPrefs });
    toast.success('Notification preferences saved');
  };

  const handleSaveAppearance = () => {
    updatePreferences({ appearance });
    toast.success('Appearance preferences saved');
  };

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await changePassword(passwords.current, passwords.newPass);
      toast.success('Password updated successfully');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-6 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" />Alerts</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" />Security</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2"><Palette className="w-4 h-4" />Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Photo upload is not available in demo mode')}>Upload Photo</Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Email Address</Label><Input type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Department</Label><Input value={profile.department} onChange={(e) => setProfile(p => ({ ...p, department: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Role</Label><Input value={user?.role} disabled className="capitalize" /></div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { id: 'email_tasks' as const, label: 'Task Assignments', description: 'Receive email when tasks are assigned to you' },
                  { id: 'email_approvals' as const, label: 'Approval Requests', description: 'Get notified for pending approvals' },
                  { id: 'email_deadlines' as const, label: 'Deadline Reminders', description: 'Receive reminders before task deadlines' },
                  { id: 'email_mentions' as const, label: 'Mentions & Comments', description: 'Get notified when someone mentions you' },
                  { id: 'email_digest' as const, label: 'Daily Digest', description: 'Receive a daily summary of activities' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch checked={notifPrefs[item.id]} onCheckedChange={(checked) => setNotifPrefs(p => ({ ...p, [item.id]: checked }))} />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}><Save className="w-4 h-4 mr-2" />Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={passwords.current} onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>New Password</Label><Input type="password" value={passwords.newPass} onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))} /></div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info('2FA setup is not available in demo mode')}>Enable 2FA</Button>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword}><Save className="w-4 h-4 mr-2" />Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'compactMode' as const, label: 'Compact Mode', description: 'Use a more compact layout' },
                  { key: 'reduceAnimations' as const, label: 'Reduce Animations', description: 'Minimize motion for accessibility' },
                  { key: 'highContrast' as const, label: 'High Contrast Mode', description: 'Increase contrast for visibility' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch checked={appearance[item.key]} onCheckedChange={(checked) => setAppearance(p => ({ ...p, [item.key]: checked }))} />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleSaveAppearance}><Save className="w-4 h-4 mr-2" />Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
