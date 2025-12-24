import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import { mockApprovals } from '@/data/mockData';
import { ApprovalRequest, ApprovalStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Users,
  FolderKanban,
  MessageSquare,
} from 'lucide-react';

const typeIcons: Record<ApprovalRequest['type'], React.ReactNode> = {
  leave: <Clock className="w-5 h-5" />,
  expense: <DollarSign className="w-5 h-5" />,
  resource: <Users className="w-5 h-5" />,
  project: <FolderKanban className="w-5 h-5" />,
};

const statusColors: Record<ApprovalStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const Approvals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ApprovalStatus | 'all'>('pending');

  const filteredApprovals = useMemo(() => {
    if (activeTab === 'all') return mockApprovals;
    return mockApprovals.filter((approval) => approval.status === activeTab);
  }, [activeTab]);

  const counts = useMemo(() => ({
    all: mockApprovals.length,
    pending: mockApprovals.filter((a) => a.status === 'pending').length,
    approved: mockApprovals.filter((a) => a.status === 'approved').length,
    rejected: mockApprovals.filter((a) => a.status === 'rejected').length,
  }), []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Approvals"
        subtitle="Review and manage approval requests"
      />

      <div className="p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ApprovalStatus | 'all')}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredApprovals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredApprovals.map((approval, index) => (
                  <Card
                    key={approval.id}
                    className="enterprise-card animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {typeIcons[approval.type]}
                          </div>
                          <div>
                            <CardTitle className="text-base">{approval.title}</CardTitle>
                            <CardDescription className="capitalize">
                              {approval.type} Request
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(statusColors[approval.status])}
                        >
                          {approval.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {approval.description}
                      </p>
                      
                      {/* Approval Progress */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-muted-foreground">Approval Level:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: approval.maxLevel }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                'w-6 h-2 rounded-full',
                                i < approval.level
                                  ? 'bg-primary'
                                  : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {approval.level}/{approval.maxLevel}
                        </span>
                      </div>

                      {/* Comments */}
                      {approval.comments.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          {approval.comments.length} comment(s)
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-3">
                        Submitted on {formatDate(approval.createdAt)}
                      </div>
                    </CardContent>

                    {approval.status === 'pending' && (
                      <CardFooter className="gap-2">
                        <Button className="flex-1" size="sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="outline" className="flex-1" size="sm">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="enterprise-card flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No approvals found</h3>
                <p className="text-muted-foreground max-w-md">
                  No {activeTab !== 'all' ? activeTab : ''} approval requests at the moment.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Approvals;
