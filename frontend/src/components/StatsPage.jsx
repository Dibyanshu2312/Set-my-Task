import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, CheckCircle2, Star, Activity } from 'lucide-react';

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    clientsData: []
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
      const clientsData = [];

      for (const client of clients) {
        const tasksResponse = await axios.get(`${API}/tasks/${client.id}`);
        const tasks = tasksResponse.data;
        const clientCompleted = tasks.filter(t => t.status === 'completed').length;
        
        totalTasks += tasks.length;
        completedTasks += clientCompleted;
        
        clientsData.push({
          name: client.name,
          total: tasks.length,
          completed: clientCompleted,
          percentage: tasks.length > 0 ? Math.round((clientCompleted / tasks.length) * 100) : 0
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
        clientsData: clientsData.sort((a, b) => b.percentage - a.percentage)
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards - Inspired by reference but customized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 relative overflow-hidden" style={{ borderColor: '#ffe8d1', background: 'linear-gradient(135deg, #fff5e6 0%, #ffffff 100%)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#8d6e63' }}>Total Clients</span>
              <Users className="w-5 h-5 text-orange-600 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-1" style={{ color: '#2c1810' }}>{stats.totalClients}</div>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#ff6b35' }}>
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 relative overflow-hidden" style={{ borderColor: '#ffe8d1', background: 'linear-gradient(135deg, #fff0e6 0%, #ffffff 100%)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#8d6e63' }}>Total Tasks</span>
              <Activity className="w-5 h-5 text-orange-600 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-1" style={{ color: '#2c1810' }}>{stats.totalTasks}</div>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#ff6b35' }}>
              <TrendingUp className="w-3 h-3" />
              <span>All time</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 relative overflow-hidden" style={{ borderColor: '#e8f5e9', background: 'linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#8d6e63' }}>Completed</span>
              <CheckCircle2 className="w-5 h-5 text-green-600 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-1 text-green-600">{stats.completedTasks}</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>Finished</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 relative overflow-hidden" style={{ borderColor: '#ffe8d1', background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#8d6e63' }}>Success Rate</span>
              <Star className="w-5 h-5 text-orange-600 opacity-60" />
            </div>
            <div className="text-4xl font-bold mb-1" style={{ color: '#ff6b35' }}>{stats.completionRate}%</div>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#ff6b35' }}>
              <TrendingUp className="w-3 h-3" />
              <span>Overall</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Performance Overview */}
      <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
        <CardHeader>
          <CardTitle className="text-xl" style={{ color: '#2c1810' }}>Client Performance Overview</CardTitle>
          <p className="text-sm" style={{ color: '#8d6e63' }}>Task completion rate by client</p>
        </CardHeader>
        <CardContent>
          {stats.clientsData.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: '#8d6e63' }}>No client data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.clientsData.map((client, index) => (
                <div key={index} className="p-4 rounded-lg" style={{ background: '#fffbf7', border: '1px solid #ffe8d1' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold" style={{ color: '#2c1810' }}>{client.name}</h3>
                      <p className="text-sm" style={{ color: '#8d6e63' }}>
                        {client.completed} of {client.total} tasks completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: client.percentage >= 70 ? '#66bb6a' : client.percentage >= 40 ? '#ff6b35' : '#ef5350' }}>
                        {client.percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#ffe8d1' }}>
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${client.percentage}%`,
                        background: client.percentage >= 70 ? 'linear-gradient(90deg, #66bb6a, #81c784)' : 
                                   client.percentage >= 40 ? 'linear-gradient(90deg, #ff6b35, #ff8a50)' : 
                                   'linear-gradient(90deg, #ef5350, #e57373)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2c1810' }}>Task Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: '#e8f5e9' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#2e7d32' }}>Completed Tasks</p>
                    <p className="text-2xl font-bold" style={{ color: '#2c1810' }}>{stats.completedTasks}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: '#fff3e0' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#d84315' }}>Pending Tasks</p>
                    <p className="text-2xl font-bold" style={{ color: '#2c1810' }}>{stats.pendingTasks}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#ffe8d1', background: '#ffffff' }}>
          <CardHeader>
            <CardTitle style={{ color: '#2c1810' }}>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#8d6e63' }}>Average Completion Rate</span>
                  <span className="text-lg font-bold" style={{ color: '#ff6b35' }}>{stats.completionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#ffe8d1' }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ width: `${stats.completionRate}%`, background: 'linear-gradient(90deg, #ff6b35, #ff8a50)' }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 border-t" style={{ borderColor: '#ffe8d1' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: '#8d6e63' }}>Tasks per Client</span>
                  <span className="font-bold" style={{ color: '#2c1810' }}>
                    {stats.totalClients > 0 ? Math.round(stats.totalTasks / stats.totalClients) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#8d6e63' }}>Active Clients</span>
                  <span className="font-bold" style={{ color: '#2c1810' }}>{stats.totalClients}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}