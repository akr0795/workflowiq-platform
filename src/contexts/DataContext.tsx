import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import {
  Project,
  Task,
  ApprovalRequest,
  ApprovalComment,
  ApprovalStatus,
  TeamMember,
  ActivityItem,
  AppNotification,
  UserPreferences,
  KPIMetric,
  ChartDataPoint,
  defaultUserPreferences,
} from '@/types';
import { defaultAppData } from '@/data/initialData';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

const APP_DATA_KEY = 'workflowiq_app_data';
const PREFERENCES_KEY = 'workflowiq_preferences';

interface AppData {
  projects: Project[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  teamMembers: TeamMember[];
  activities: ActivityItem[];
  notifications: AppNotification[];
}

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  teamMembers: TeamMember[];
  activities: ActivityItem[];
  notifications: AppNotification[];
  preferences: UserPreferences;
  kpis: KPIMetric[];
  projectStatusData: ChartDataPoint[];
  taskTrendData: ChartDataPoint[];
  unreadNotificationCount: number;
  addProject: (data: Partial<Project>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (data: Partial<Task>) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addApproval: (data: Omit<ApprovalRequest, 'id' | 'comments' | 'createdAt' | 'updatedAt'>) => ApprovalRequest;
  approveRequest: (id: string, userId: string, comment?: string) => void;
  rejectRequest: (id: string, userId: string, comment: string) => void;
  addApprovalComment: (id: string, userId: string, comment: string) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, data: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  getMemberById: (id: string) => TeamMember | undefined;
  getProjectById: (id: string) => Project | undefined;
  getUserStats: (userId: string) => {
    tasksCompleted: number;
    projectsActive: number;
    hoursLogged: number;
    approvalsPending: number;
  };
  searchAll: (query: string) => { type: string; id: string; title: string; path: string }[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const today = () => new Date().toISOString().split('T')[0];

const syncTeamTaskCounts = (members: TeamMember[], tasks: Task[]): TeamMember[] =>
  members.map((member) => ({
    ...member,
    activeTasks: tasks.filter((t) => t.assigneeId === member.id && t.status !== 'done').length,
    completedTasks: tasks.filter((t) => t.assigneeId === member.id && t.status === 'done').length,
  }));

const buildInitialActivities = (): ActivityItem[] => [
  {
    id: 'act-1',
    type: 'task_completed',
    title: 'Task Completed',
    description: 'User authentication module marked as done',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    link: '/tasks',
  },
  {
    id: 'act-2',
    type: 'approval_pending',
    title: 'Approval Required',
    description: 'Leave request from Amit Patel awaiting review',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: '/approvals',
  },
];

const buildInitialNotifications = (approvals: ApprovalRequest[]): AppNotification[] =>
  approvals
    .filter((a) => a.status === 'pending')
    .slice(0, 3)
    .map((a) => ({
      id: `notif-${a.id}`,
      title: 'New approval request',
      description: `${a.title} requires your review`,
      type: 'approval' as const,
      link: '/approvals',
      read: false,
      createdAt: a.createdAt,
    }));

const computeKPIs = (projects: Project[], tasks: Task[], teamMembers: TeamMember[]): KPIMetric[] => {
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const slaRate = totalTasks > 0
    ? Math.round((tasks.filter((t) => t.status === 'done' || new Date(t.dueDate) >= new Date()).length / totalTasks) * 1000) / 10
    : 100;
  const avgUtilization = teamMembers.length > 0
    ? Math.round(teamMembers.reduce((sum, m) => sum + m.utilization, 0) / teamMembers.length)
    : 0;

  return [
    { id: 'kpi1', label: 'Active Projects', value: activeProjects, previousValue: Math.max(0, activeProjects - 1), change: 10, changeType: 'positive' },
    { id: 'kpi2', label: 'Tasks Completed', value: completedTasks, previousValue: Math.max(0, completedTasks - 2), change: 12, changeType: 'positive' },
    { id: 'kpi3', label: 'SLA Compliance', value: slaRate, previousValue: slaRate + 1, change: -1, changeType: 'negative', unit: '%' },
    { id: 'kpi4', label: 'Team Utilization', value: avgUtilization, previousValue: avgUtilization - 2, change: 2, changeType: 'positive', unit: '%' },
  ];
};

const computeProjectStatusData = (projects: Project[]): ChartDataPoint[] => {
  const statuses = ['active', 'on-hold', 'completed', 'cancelled'] as const;
  return statuses.map((status) => ({
    name: status === 'on-hold' ? 'On Hold' : status.charAt(0).toUpperCase() + status.slice(1),
    value: projects.filter((p) => p.status === status).length,
  }));
};

const computeTaskTrendData = (tasks: Task[]): ChartDataPoint[] => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  return weeks.map((name, i) => ({
    name,
    completed: tasks.filter((t) => t.status === 'done').length > 0
      ? Math.max(1, Math.round(tasks.filter((t) => t.status === 'done').length / (6 - i + 1)))
      : i + 1,
    created: tasks.length > 0
      ? Math.max(1, Math.round(tasks.length / (6 - i + 1)))
      : i + 2,
  }));
};

const loadAppData = (): AppData => {
  const stored = loadFromStorage<Partial<AppData> | null>(APP_DATA_KEY, null);
  const base = stored ?? {};
  const projects = base.projects ?? defaultAppData.projects;
  const tasks = base.tasks ?? defaultAppData.tasks;
  const approvals = base.approvals ?? defaultAppData.approvals;
  const teamMembers = syncTeamTaskCounts(
    base.teamMembers ?? defaultAppData.teamMembers,
    tasks
  );

  return {
    projects,
    tasks,
    approvals,
    teamMembers,
    activities: base.activities ?? buildInitialActivities(),
    notifications: base.notifications ?? buildInitialNotifications(approvals),
  };
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(loadAppData);
  const [preferences, setPreferences] = useState<UserPreferences>(
    () => loadFromStorage(PREFERENCES_KEY, defaultUserPreferences)
  );

  useEffect(() => {
    saveToStorage(APP_DATA_KEY, data);
  }, [data]);

  useEffect(() => {
    saveToStorage(PREFERENCES_KEY, preferences);
  }, [preferences]);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'createdAt'>) => {
    const item: ActivityItem = {
      ...activity,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, activities: [item, ...prev.activities].slice(0, 50) }));
  }, []);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    const item: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, notifications: [item, ...prev.notifications].slice(0, 20) }));
  }, []);

  const addProject = useCallback((projectData: Partial<Project>): Project => {
    const newProject: Project = {
      id: `PRJ${String(Date.now()).slice(-6)}`,
      name: projectData.name || '',
      description: projectData.description || '',
      status: projectData.status || 'active',
      priority: projectData.priority || 'medium',
      startDate: projectData.startDate || today(),
      endDate: projectData.endDate || '',
      progress: projectData.progress ?? 0,
      managerId: projectData.managerId || '2',
      teamMembers: projectData.teamMembers || ['3'],
      budget: projectData.budget || 0,
      createdAt: today(),
      updatedAt: today(),
    };
    setData((prev) => ({ ...prev, projects: [newProject, ...prev.projects] }));
    addActivity({ type: 'project_created', title: 'Project Created', description: newProject.name, link: '/projects' });
    return newProject;
  }, [addActivity]);

  const updateProject = useCallback((id: string, projectData: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...projectData, updatedAt: today() } : p
      ),
    }));
    addActivity({ type: 'project_updated', title: 'Project Updated', description: projectData.name || id, link: '/projects' });
  }, [addActivity]);

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      tasks: prev.tasks.filter((t) => t.projectId !== id),
    }));
  }, []);

  const addTask = useCallback((taskData: Partial<Task>): Task => {
    const newTask: Task = {
      id: `TSK${String(Date.now()).slice(-6)}`,
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'created',
      priority: taskData.priority || 'medium',
      projectId: taskData.projectId || '',
      assigneeId: taskData.assigneeId || '3',
      reporterId: taskData.reporterId || '2',
      dueDate: taskData.dueDate || today(),
      estimatedHours: taskData.estimatedHours || 0,
      loggedHours: taskData.loggedHours || 0,
      tags: taskData.tags || [],
      createdAt: today(),
      updatedAt: today(),
    };
    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      teamMembers: syncTeamTaskCounts(prev.teamMembers, [newTask, ...prev.tasks]),
    }));
    addActivity({ type: 'task_created', title: 'Task Created', description: newTask.title, link: '/tasks' });
    addNotification({ title: 'New task created', description: newTask.title, type: 'task', link: '/tasks' });
    return newTask;
  }, [addActivity, addNotification]);

  const updateTask = useCallback((id: string, taskData: Partial<Task>) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.map((t) =>
        t.id === id ? { ...t, ...taskData, updatedAt: today() } : t
      );
      const updated = updatedTasks.find((t) => t.id === id);
      if (updated?.status === 'done') {
        addActivity({ type: 'task_completed', title: 'Task Completed', description: updated.title, link: '/tasks' });
      }
      return {
        ...prev,
        tasks: updatedTasks,
        teamMembers: syncTeamTaskCounts(prev.teamMembers, updatedTasks),
      };
    });
  }, [addActivity]);

  const deleteTask = useCallback((id: string) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.filter((t) => t.id !== id);
      return {
        ...prev,
        tasks: updatedTasks,
        teamMembers: syncTeamTaskCounts(prev.teamMembers, updatedTasks),
      };
    });
  }, []);

  const addApproval = useCallback((
    approvalData: Omit<ApprovalRequest, 'id' | 'comments' | 'createdAt' | 'updatedAt'>
  ): ApprovalRequest => {
    const newApproval: ApprovalRequest = {
      ...approvalData,
      id: `APR${String(Date.now()).slice(-6)}`,
      comments: [],
      createdAt: today(),
      updatedAt: today(),
    };
    setData((prev) => ({ ...prev, approvals: [newApproval, ...prev.approvals] }));
    addActivity({ type: 'approval_pending', title: 'Approval Submitted', description: newApproval.title, link: '/approvals' });
    addNotification({ title: 'New approval request', description: newApproval.title, type: 'approval', link: '/approvals' });
    return newApproval;
  }, [addActivity, addNotification]);

  const approveRequest = useCallback((id: string, userId: string, comment?: string) => {
    setData((prev) => ({
      ...prev,
      approvals: prev.approvals.map((a) => {
        if (a.id !== id) return a;
        const newComment: ApprovalComment = {
          id: `CMT${Date.now()}`,
          userId,
          comment: comment || 'Approved',
          action: 'approved',
          createdAt: new Date().toISOString(),
        };
        const nextLevel = a.level + 1;
        const isFinal = nextLevel >= a.maxLevel;
        return {
          ...a,
          level: isFinal ? a.maxLevel : nextLevel,
          status: (isFinal ? 'approved' : 'pending') as ApprovalStatus,
          comments: [...a.comments, newComment],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    addActivity({ type: 'approval_approved', title: 'Request Approved', description: id, link: '/approvals' });
  }, [addActivity]);

  const rejectRequest = useCallback((id: string, userId: string, comment: string) => {
    setData((prev) => ({
      ...prev,
      approvals: prev.approvals.map((a) => {
        if (a.id !== id) return a;
        const newComment: ApprovalComment = {
          id: `CMT${Date.now()}`,
          userId,
          comment,
          action: 'rejected',
          createdAt: new Date().toISOString(),
        };
        return {
          ...a,
          status: 'rejected' as ApprovalStatus,
          comments: [...a.comments, newComment],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    addActivity({ type: 'approval_rejected', title: 'Request Rejected', description: id, link: '/approvals' });
  }, [addActivity]);

  const addApprovalComment = useCallback((id: string, userId: string, comment: string) => {
    setData((prev) => ({
      ...prev,
      approvals: prev.approvals.map((a) => {
        if (a.id !== id) return a;
        const newComment: ApprovalComment = {
          id: `CMT${Date.now()}`,
          userId,
          comment,
          action: 'comment',
          createdAt: new Date().toISOString(),
        };
        return { ...a, comments: [...a.comments, newComment], updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const addTeamMember = useCallback((member: TeamMember) => {
    setData((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, member] }));
    addActivity({ type: 'team_update', title: 'Team Member Added', description: member.name, link: '/team' });
  }, [addActivity]);

  const updateTeamMember = useCallback((id: string, memberData: Partial<TeamMember>) => {
    setData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((m) => (m.id === id ? { ...m, ...memberData } : m)),
    }));
    addActivity({ type: 'team_update', title: 'Team Member Updated', description: memberData.name || id, link: '/team' });
  }, [addActivity]);

  const deleteTeamMember = useCallback((id: string) => {
    setData((prev) => ({ ...prev, teamMembers: prev.teamMembers.filter((m) => m.id !== id) }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({
      notifications: { ...prev.notifications, ...prefs.notifications },
      appearance: { ...prev.appearance, ...prefs.appearance },
    }));
  }, []);

  const getMemberById = useCallback(
    (id: string) => data.teamMembers.find((m) => m.id === id),
    [data.teamMembers]
  );

  const getProjectById = useCallback(
    (id: string) => data.projects.find((p) => p.id === id),
    [data.projects]
  );

  const getUserStats = useCallback((userId: string) => {
    const userTasks = data.tasks.filter((t) => t.assigneeId === userId);
    const userProjects = data.projects.filter(
      (p) => p.teamMembers.includes(userId) && p.status === 'active'
    );
    return {
      tasksCompleted: userTasks.filter((t) => t.status === 'done').length,
      projectsActive: userProjects.length,
      hoursLogged: userTasks.reduce((sum, t) => sum + t.loggedHours, 0),
      approvalsPending: data.approvals.filter((a) => a.requesterId === userId && a.status === 'pending').length,
    };
  }, [data.tasks, data.projects, data.approvals]);

  const searchAll = useCallback((query: string) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: { type: string; id: string; title: string; path: string }[] = [];

    data.projects.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        results.push({ type: 'Project', id: p.id, title: p.name, path: '/projects' });
      }
    });
    data.tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
        results.push({ type: 'Task', id: t.id, title: t.title, path: '/tasks' });
      }
    });
    data.teamMembers.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) {
        results.push({ type: 'Team', id: m.id, title: m.name, path: '/team' });
      }
    });

    return results.slice(0, 8);
  }, [data.projects, data.tasks, data.teamMembers]);

  const kpis = useMemo(
    () => computeKPIs(data.projects, data.tasks, data.teamMembers),
    [data.projects, data.tasks, data.teamMembers]
  );

  const projectStatusData = useMemo(
    () => computeProjectStatusData(data.projects),
    [data.projects]
  );

  const taskTrendData = useMemo(
    () => computeTaskTrendData(data.tasks),
    [data.tasks]
  );

  const unreadNotificationCount = useMemo(
    () => data.notifications.filter((n) => !n.read).length,
    [data.notifications]
  );

  const value = useMemo(
    () => ({
      projects: data.projects,
      tasks: data.tasks,
      approvals: data.approvals,
      teamMembers: data.teamMembers,
      activities: data.activities,
      notifications: data.notifications,
      preferences,
      kpis,
      projectStatusData,
      taskTrendData,
      unreadNotificationCount,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      addApproval,
      approveRequest,
      rejectRequest,
      addApprovalComment,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      markNotificationRead,
      markAllNotificationsRead,
      updatePreferences,
      getMemberById,
      getProjectById,
      getUserStats,
      searchAll,
    }),
    [
      data, preferences, kpis, projectStatusData, taskTrendData, unreadNotificationCount,
      addProject, updateProject, deleteProject, addTask, updateTask, deleteTask,
      addApproval, approveRequest, rejectRequest, addApprovalComment,
      addTeamMember, updateTeamMember, deleteTeamMember,
      markNotificationRead, markAllNotificationsRead, updatePreferences,
      getMemberById, getProjectById, getUserStats, searchAll,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
