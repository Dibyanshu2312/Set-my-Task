import { useState } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function AddTaskDialog({ clientId, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/tasks`, {
        client_id: clientId,
        title: formData.title,
        description: formData.description,
        status: 'pending'
      });
      toast.success('Task added successfully!');
      setIsOpen(false);
      setFormData({ title: '', description: '' });
      onUpdate();
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          data-testid={`add-task-${clientId}`}
          className="text-white font-semibold"
          style={{ background: '#ff6b35' }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" style={{ background: '#ffffff' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#2c1810' }}>Add New Task</DialogTitle>
          <DialogDescription style={{ color: '#5d4037' }}>
            Create a new task for this client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-task-title" style={{ color: '#2c1810' }}>Task Title</Label>
            <Input
              id="new-task-title"
              data-testid={`new-task-title-${clientId}`}
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="border-orange-200 focus:border-orange-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-task-description" style={{ color: '#2c1810' }}>Description (Optional)</Label>
            <Textarea
              id="new-task-description"
              data-testid={`new-task-description-${clientId}`}
              placeholder="Enter detailed description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-orange-200 focus:border-orange-500"
              rows={4}
            />
          </div>
          <Button
            type="submit"
            data-testid={`submit-new-task-${clientId}`}
            className="w-full text-white font-semibold"
            style={{ background: '#ff6b35' }}
          >
            Add Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}