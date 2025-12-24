import React, { useMemo } from 'react';
import Header from '@/components/layout/Header';
import KPICard from '@/components/dashboard/KPICard';
import ProjectStatusChart from '@/components/dashboard/ProjectStatusChart';
import TaskTrendChart from '@/components/dashboard/TaskTrendChart';
import ProductivityChart from '@/components/dashboard/ProductivityChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockKPIs,
  mockProjectStatusData,
  mockTaskTrendData,
  mockProductivityData,
} from '@/data/mockData';
import { FolderKanban, CheckSquare, Target, Users } from 'lucide-react';

const kpiIcons = [
  <FolderKanban className="w-5 h-5" />,
  <CheckSquare className="w-5 h-5" />,
  <Target className="w-5 h-5" />,
  <Users className="w-5 h-5" />,
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'User'}`}
        subtitle="Here's what's happening with your projects today"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockKPIs.map((kpi, index) => (
            <KPICard
              key={kpi.id}
              metric={kpi}
              icon={kpiIcons[index]}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            />
          ))}
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskTrendChart data={mockTaskTrendData} />
          <ProjectStatusChart data={mockProjectStatusData} />
        </section>

        {/* Bottom Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductivityChart data={mockProductivityData} />
          </div>
          <RecentActivity />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
