import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, CheckCircle2, Star, Calendar, FileText } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    recentActivity: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const clientsResponse = await axios.get(`${API}/clients`);
      const clients = clientsResponse.data;

      let totalTasks = 0;
      let completedTasks = 0;
      const recentActivity = [];

      for (const client of clients) {
        const tasksResponse = await axios.get(`${API}/tasks/${client.id}`);
        const tasks = tasksResponse.data;
        totalTasks += tasks.length;
        completedTasks += tasks.filter(t => t.status === 'completed').length;
        
        // Add recent tasks to activity
        tasks.slice(0, 5).forEach(task => {
          recentActivity.push({
            client: client.name,
            task: task.title,
            status: task.status,
            date: new Date(task.created_at)
          });
        });
      }

      const pendingTasks = totalTasks - completedTasks;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setStats({
        totalClients: clients.length,
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        recentActivity: recentActivity.sort((a, b) => b.date - a.date).slice(0, 10)
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Mock data for charts
  const weeklyData = [
    { name: 'Mon', completed: 12 },
    { name: 'Tue', completed: 19 },
    { name: 'Wed', completed: 15 },
    { name: 'Thu', completed: 25 },
    { name: 'Fri', completed: 22 },
    { name: 'Sat', completed: 18 },
    { name: 'Sun', completed: 10 }
  ];

  const statusData = [
    { name: 'Completed', value: stats.completedTasks, color: '#66bb6a' },
    { name: 'Pending', value: stats.pendingTasks, color: '#ff6b35' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between" style={{ color: '#5d4037' }}>
              <span>Total Clients</span>
              <Users className="w-4 h-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#2c1810' }}>{stats.totalClients}</div>
            <p className="text-xs mt-1" style={{ color: '#8d6e63' }}>Active clients in system</p>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between" style={{ color: '#5d4037' }}>
              <span>Total Tasks</span>
              <FileText className="w-4 h-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#2c1810' }}>{stats.totalTasks}</div>
            <p className="text-xs mt-1" style={{ color: '#8d6e63' }}>Tasks created overall</p>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between" style={{ color: '#5d4037' }}>
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs mt-1" style={{ color: '#8d6e63' }}>Tasks finished</p>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between" style={{ color: '#5d4037' }}>
              <span>Completion Rate</span>
              <Star className="w-4 h-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#ff6b35' }}>{stats.completionRate}%</div>
            <p className="text-xs mt-1" style={{ color: '#8d6e63' }}>Overall progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion Chart */}
        <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#2c1810' }}>
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Weekly Task Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="name" stroke="#8d6e63" />
                <YAxis stroke="#8d6e63" />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '2px solid #ffe8d1', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="completed" stroke="#ff6b35" strokeWidth={3} dot={{ fill: '#ff6b35', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2c1810' }}>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ background: item.color }}></div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#2c1810' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: '#8d6e63' }}>{item.value} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#2c1810' }}>
            <Calendar className="w-5 h-5 text-orange-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8d6e63' }}>No recent activity</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#fffbf7', border: '1px solid #ffe8d1' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#2c1810' }}>{activity.task}</p>
                      <p className="text-xs" style={{ color: '#8d6e63' }}>{activity.client}</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ 
                    background: activity.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                    color: activity.status === 'completed' ? '#2e7d32' : '#d84315'
                  }}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}