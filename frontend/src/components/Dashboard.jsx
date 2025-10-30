import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LogOut, Plus, RefreshCw } from 'lucide-react';
import ClientCard from './ClientCard';

export default function Dashboard({ user, onLogout }) {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const clientsResponse = await axios.get(`${API}/clients`);
      setClients(clientsResponse.data);

      // Fetch tasks for each client
      const tasksData = {};
      for (const client of clientsResponse.data) {
        const tasksResponse = await axios.get(`${API}/tasks/${client.id}`);
        tasksData[client.id] = tasksResponse.data;
      }
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/clients`, newClient);
      toast.success('Client created successfully!');
      setIsCreateDialogOpen(false);
      setNewClient({ name: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create client');
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await axios.delete(`${API}/clients/${clientId}`);
      toast.success('Client deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fef9f2' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#fef9f2' }}>
      {/* Header */}
      <header className="border-b-2" style={{ background: '#ffffff', borderColor: '#ffe8d1' }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#2c1810' }}>Task Manager Dashboard</h1>
            <p className="text-sm" style={{ color: '#5d4037' }}>Welcome back, {user.username}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchData}
              data-testid="refresh-button"
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={onLogout}
              data-testid="logout-button"
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: '#2c1810' }}>
            Clients ({clients.length})
          </h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-client-button"
                className="text-white font-semibold"
                style={{ background: '#ff6b35' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" style={{ background: '#ffffff' }}>
              <DialogHeader>
                <DialogTitle style={{ color: '#2c1810' }}>Create New Client</DialogTitle>
                <DialogDescription style={{ color: '#5d4037' }}>
                  Add a new client to your dashboard. They will get 11 predefined tasks automatically.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name" style={{ color: '#2c1810' }}>Client Name</Label>
                  <Input
                    id="client-name"
                    data-testid="client-name-input"
                    placeholder="Enter client name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-description" style={{ color: '#2c1810' }}>Description (Optional)</Label>
                  <Textarea
                    id="client-description"
                    data-testid="client-description-input"
                    placeholder="Enter client description"
                    value={newClient.description}
                    onChange={(e) => setNewClient({ ...newClient, description: e.target.value })}
                    className="border-orange-200 focus:border-orange-500"
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="create-client-submit"
                  className="w-full text-white font-semibold"
                  style={{ background: '#ff6b35' }}
                >
                  Create Client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg mb-4" style={{ color: '#5d4037' }}>No clients yet. Create your first client to get started!</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="empty-state-add-client"
              className="text-white font-semibold"
              style={{ background: '#ff6b35' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                tasks={tasks[client.id] || []}
                onDelete={handleDeleteClient}
                onUpdate={fetchData}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}