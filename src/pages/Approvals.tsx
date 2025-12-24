import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import { ApprovalRequest, ApprovalStatus, ApprovalComment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Users,
  FolderKanban,
  MessageSquare,
  Plus,
  Send,
  History,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const initialApprovals: ApprovalRequest[] = [
  {
    id: 'APR001',
    type: 'leave',
    title: 'Annual Leave Request - 5 Days',
    description: 'Requesting annual leave from Dec 25 to Dec 31 for family vacation',
    requesterId: '3',
    currentApproverId: '2',
    status: 'pending',
    level: 1,
    maxLevel: 2,
    comments: [],
    createdAt: '2024-11-15',
    updatedAt: '2024-11-15',
  },
  {
    id: 'APR002',
    type: 'expense',
    title: 'Training Expense Reimbursement',
    description: 'AWS Certification exam fee reimbursement - $300',
    requesterId: '3',
    currentApproverId: '2',
    status: 'pending',
    level: 1,
    maxLevel: 2,
    comments: [],
    createdAt: '2024-11-18',
    updatedAt: '2024-11-18',
  },
  {
    id: 'APR003',
    type: 'resource',
    title: 'Additional Resource Request',
    description: 'Request for 2 additional developers for Cloud Migration project',
    requesterId: '2',
    currentApproverId: '1',
    status: 'pending',
    level: 2,
    maxLevel: 2,
    comments: [
      {
        id: 'CMT001',
        userId: '2',
        comment: 'Critical for meeting Q4 deadlines',
        action: 'comment',
        createdAt: '2024-11-17',
      },
    ],
    createdAt: '2024-11-16',
    updatedAt: '2024-11-17',
  },
];

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
  const { hasRole, user } = useAuth();
  const canApprove = hasRole(['admin', 'manager']);
  
  const [activeTab, setActiveTab] = useState<ApprovalStatus | 'all'>('pending');
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(initialApprovals);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  
  // Create form state
  const [newRequest, setNewRequest] = useState({
    type: 'leave' as ApprovalRequest['type'],
    title: '',
    description: '',
  });

  const filteredApprovals = useMemo(() => {
    if (activeTab === 'all') return approvals;
    return approvals.filter((approval) => approval.status === activeTab);
  }, [activeTab, approvals]);

  const counts = useMemo(() => ({
    all: approvals.length,
    pending: approvals.filter((a) => a.status === 'pending').length,
    approved: approvals.filter((a) => a.status === 'approved').length,
    rejected: approvals.filter((a) => a.status === 'rejected').length,
  }), [approvals]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleApprove = (approval: ApprovalRequest) => {
    const newComment: ApprovalComment = {
      id: `CMT${Date.now()}`,
      userId: user?.id || '1',
      comment: comment || 'Approved',
      action: 'approved',
      createdAt: new Date().toISOString(),
    };

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approval.id
          ? {
              ...a,
              status: 'approved' as ApprovalStatus,
              level: a.maxLevel,
              comments: [...a.comments, newComment],
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    toast.success(`${approval.title} has been approved`);
    setComment('');
    setIsDetailsModalOpen(false);
  };

  const handleReject = (approval: ApprovalRequest) => {
    if (!comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const newComment: ApprovalComment = {
      id: `CMT${Date.now()}`,
      userId: user?.id || '1',
      comment: comment,
      action: 'rejected',
      createdAt: new Date().toISOString(),
    };

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approval.id
          ? {
              ...a,
              status: 'rejected' as ApprovalStatus,
              comments: [...a.comments, newComment],
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    toast.success(`${approval.title} has been rejected`);
    setComment('');
    setIsDetailsModalOpen(false);
  };

  const handleAddComment = (approval: ApprovalRequest) => {
    if (!comment.trim()) return;

    const newComment: ApprovalComment = {
      id: `CMT${Date.now()}`,
      userId: user?.id || '1',
      comment: comment,
      action: 'comment',
      createdAt: new Date().toISOString(),
    };

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approval.id
          ? {
              ...a,
              comments: [...a.comments, newComment],
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    toast.success('Comment added');
    setComment('');
  };

  const handleCreateRequest = () => {
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newApproval: ApprovalRequest = {
      id: `APR${Date.now()}`,
      type: newRequest.type,
      title: newRequest.title,
      description: newRequest.description,
      requesterId: user?.id || '3',
      currentApproverId: '2',
      status: 'pending',
      level: 1,
      maxLevel: 2,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApprovals((prev) => [newApproval, ...prev]);
    toast.success('Approval request submitted');
    setIsCreateModalOpen(false);
    setNewRequest({ type: 'leave', title: '', description: '' });
  };

  const openDetails = (approval: ApprovalRequest) => {
    setSelectedApproval(approval);
    setIsDetailsModalOpen(true);
    setComment('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Approvals"
        subtitle="Review and manage approval requests"
      />

      <div className="p-6 space-y-6">
        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

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
                    className="enterprise-card animate-fade-in cursor-pointer hover:shadow-md transition-shadow"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => openDetails(approval)}
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
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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

                    {approval.status === 'pending' && canApprove && (
                      <CardFooter className="gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => openDetails(approval)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review
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

      {/* Create Request Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Approval Request</DialogTitle>
            <DialogDescription>
              Submit a new request for approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select
                value={newRequest.type}
                onValueChange={(v) => setNewRequest({ ...newRequest, type: v as ApprovalRequest['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leave">Leave Request</SelectItem>
                  <SelectItem value="expense">Expense Reimbursement</SelectItem>
                  <SelectItem value="resource">Resource Request</SelectItem>
                  <SelectItem value="project">Project Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Brief title for your request"
                value={newRequest.title}
                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Provide details about your request..."
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedApproval && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {typeIcons[selectedApproval.type]}
                  </div>
                  <div>
                    <DialogTitle>{selectedApproval.title}</DialogTitle>
                    <DialogDescription className="capitalize">
                      {selectedApproval.type} Request • {formatDate(selectedApproval.createdAt)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={cn(statusColors[selectedApproval.status])}>
                    {selectedApproval.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedApproval.description}</p>
                </div>

                {/* Approval Progress */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Approval Progress</h4>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: selectedApproval.maxLevel }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 h-2 rounded-full',
                          i < selectedApproval.level ? 'bg-primary' : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Level {selectedApproval.level} of {selectedApproval.maxLevel}
                  </p>
                </div>

                {/* Comments/History */}
                {selectedApproval.comments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Activity History
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedApproval.comments.map((c) => (
                        <div key={c.id} className="flex gap-3 text-sm">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full mt-1.5',
                              c.action === 'approved'
                                ? 'bg-success'
                                : c.action === 'rejected'
                                ? 'bg-destructive'
                                : 'bg-muted-foreground'
                            )}
                          />
                          <div>
                            <p className="text-foreground">{c.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(c.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Comment */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Add Comment</h4>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleAddComment(selectedApproval)}
                      disabled={!comment.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {selectedApproval.status === 'pending' && canApprove && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() => handleReject(selectedApproval)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedApproval)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
