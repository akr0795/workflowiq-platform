import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import ProductivityChart from '@/components/dashboard/ProductivityChart';
import TaskTrendChart from '@/components/dashboard/TaskTrendChart';
import ProjectStatusChart from '@/components/dashboard/ProjectStatusChart';
import {
  mockProductivityData,
  mockTaskTrendData,
  mockProjectStatusData,
} from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting report as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Analytics & Reports"
        subtitle="Track performance metrics and generate reports"
      />

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="enterprise-card">
            <CardHeader className="pb-2">
              <CardDescription>Avg. Task Completion Time</CardDescription>
              <CardTitle className="text-2xl">3.2 days</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-success">↓ 15% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardHeader className="pb-2">
              <CardDescription>SLA Compliance Rate</CardDescription>
              <CardTitle className="text-2xl">94.5%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">↓ 1.8% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardHeader className="pb-2">
              <CardDescription>Team Velocity</CardDescription>
              <CardTitle className="text-2xl">42 pts/sprint</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-success">↑ 8% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardHeader className="pb-2">
              <CardDescription>Bug Resolution Rate</CardDescription>
              <CardTitle className="text-2xl">87%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-success">↑ 5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductivityChart data={mockProductivityData} />
          <TaskTrendChart data={mockTaskTrendData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProjectStatusChart data={mockProjectStatusData} />
          </div>
          
          {/* SLA Breach Analysis */}
          <Card className="enterprise-card lg:col-span-2">
            <CardHeader>
              <CardTitle>SLA Breach Analysis</CardTitle>
              <CardDescription>Breakdown of SLA breaches by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Response Time', breaches: 12, total: 250, percentage: 4.8 },
                  { category: 'Resolution Time', breaches: 8, total: 180, percentage: 4.4 },
                  { category: 'First Contact', breaches: 5, total: 300, percentage: 1.7 },
                  { category: 'Escalation', breaches: 3, total: 50, percentage: 6.0 },
                ].map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.breaches}/{item.total} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-destructive rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
