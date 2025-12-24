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
import { toast } from 'sonner';
import { Download, Calendar, TrendingUp, TrendingDown, Users, Target, Bug, Clock, BarChart3, PieChart, Activity } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const developerPerformance = [
  { name: 'Amit Patel', tasksCompleted: 45, hoursLogged: 168, efficiency: 92 },
  { name: 'Sneha Reddy', tasksCompleted: 38, hoursLogged: 152, efficiency: 88 },
  { name: 'Vikram Singh', tasksCompleted: 52, hoursLogged: 175, efficiency: 95 },
  { name: 'Ananya Gupta', tasksCompleted: 35, hoursLogged: 145, efficiency: 85 },
  { name: 'Rahul Verma', tasksCompleted: 42, hoursLogged: 160, efficiency: 90 },
];

const teamSkillsData = [
  { skill: 'React', value: 90 },
  { skill: 'TypeScript', value: 85 },
  { skill: 'Node.js', value: 75 },
  { skill: 'AWS', value: 70 },
  { skill: 'DevOps', value: 65 },
  { skill: 'Testing', value: 80 },
];

const sprintVelocityData = [
  { sprint: 'Sprint 1', planned: 40, completed: 38 },
  { sprint: 'Sprint 2', planned: 42, completed: 45 },
  { sprint: 'Sprint 3', planned: 45, completed: 42 },
  { sprint: 'Sprint 4', planned: 48, completed: 50 },
  { sprint: 'Sprint 5', planned: 50, completed: 48 },
  { sprint: 'Sprint 6', planned: 52, completed: 55 },
];

const slaBreachData = [
  { category: 'Response Time', breaches: 12, total: 250, percentage: 4.8 },
  { category: 'Resolution Time', breaches: 8, total: 180, percentage: 4.4 },
  { category: 'First Contact', breaches: 5, total: 300, percentage: 1.7 },
  { category: 'Escalation', breaches: 3, total: 50, percentage: 6.0 },
];

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const handleExport = (format: 'csv' | 'pdf') => {
    // Simulate export
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const generateCSVData = () => {
    const headers = ['Metric', 'Value', 'Change'];
    const data = [
      ['Avg. Task Completion Time', '3.2 days', '-15%'],
      ['SLA Compliance Rate', '94.5%', '-1.8%'],
      ['Team Velocity', '42 pts/sprint', '+8%'],
      ['Bug Resolution Rate', '87%', '+5%'],
    ];
    
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV report downloaded');
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
            <Button variant="outline" onClick={generateCSVData}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger value="sla" className="gap-2">
              <Target className="w-4 h-4" />
              SLA Analysis
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription>Avg. Task Completion Time</CardDescription>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">3.2 days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-sm text-success">
                    <TrendingDown className="w-4 h-4" />
                    15% from last month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription>SLA Compliance Rate</CardDescription>
                    <Target className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">94.5%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <TrendingDown className="w-4 h-4" />
                    1.8% from last month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription>Team Velocity</CardDescription>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">42 pts/sprint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-sm text-success">
                    <TrendingUp className="w-4 h-4" />
                    8% from last month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription>Bug Resolution Rate</CardDescription>
                    <Bug className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">87%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-sm text-success">
                    <TrendingUp className="w-4 h-4" />
                    5% from last month
                  </div>
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
              
              {/* Sprint Velocity */}
              <Card className="enterprise-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sprint Velocity</CardTitle>
                  <CardDescription>Planned vs Completed story points per sprint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sprintVelocityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="sprint" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="planned" fill="hsl(var(--muted-foreground))" name="Planned" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Developer Performance Table */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Developer Performance</CardTitle>
                  <CardDescription>Individual productivity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {developerPerformance.map((dev) => (
                      <div key={dev.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{dev.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {dev.tasksCompleted} tasks • {dev.hoursLogged}h
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={dev.efficiency} className="flex-1 h-2" />
                          <span className="text-sm font-medium w-12">{dev.efficiency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Skills Radar */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Team Skills Distribution</CardTitle>
                  <CardDescription>Average skill proficiency across the team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={teamSkillsData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis
                          dataKey="skill"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Radar
                          name="Proficiency"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Workload */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Team Workload Distribution</CardTitle>
                <CardDescription>Hours logged by each team member this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={developerPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="hoursLogged" fill="hsl(var(--primary))" name="Hours Logged" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SLA Analysis Tab */}
          <TabsContent value="sla" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {slaBreachData.map((item) => (
                <Card key={item.category} className="enterprise-card">
                  <CardHeader className="pb-2">
                    <CardDescription>{item.category}</CardDescription>
                    <CardTitle className="text-2xl">{item.percentage}%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {item.breaches} breaches / {item.total} total
                    </p>
                    <Progress value={100 - item.percentage} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* SLA Breach Analysis */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>SLA Breach Analysis</CardTitle>
                <CardDescription>Detailed breakdown of SLA breaches by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {slaBreachData.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{item.category}</span>
                          <p className="text-sm text-muted-foreground">
                            {item.breaches} breaches out of {item.total} requests
                          </p>
                        </div>
                        <span className={`text-lg font-semibold ${item.percentage > 5 ? 'text-destructive' : 'text-success'}`}>
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${item.percentage > 5 ? 'bg-destructive' : 'bg-success'}`}
                          style={{ width: `${Math.min(item.percentage * 10, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SLA Compliance Trend */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>SLA Compliance Trend</CardTitle>
                <CardDescription>Monthly SLA compliance rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { month: 'Jun', compliance: 96 },
                        { month: 'Jul', compliance: 94 },
                        { month: 'Aug', compliance: 97 },
                        { month: 'Sep', compliance: 95 },
                        { month: 'Oct', compliance: 93 },
                        { month: 'Nov', compliance: 94.5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis domain={[85, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Compliance']}
                      />
                      <Bar dataKey="compliance" fill="hsl(var(--primary))" name="Compliance Rate" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
