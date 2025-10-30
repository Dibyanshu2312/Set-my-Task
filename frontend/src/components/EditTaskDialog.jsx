import { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Edit2 } from 'lucide-react';

export default function EditTaskDialog({ task, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/tasks/${task.id}`, formData);
      toast.success('Task updated successfully!');
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-testid={`edit-task-${task.id}`}
          className="text-orange-600 hover:bg-orange-50"
        >
          <Edit2 className="w-3 h-3 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" style={{ background: '#ffffff' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#2c1810' }}>Edit Task</DialogTitle>
          <DialogDescription style={{ color: '#5d4037' }}>
            Update the task details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-task-title" style={{ color: '#2c1810' }}>Task Title</Label>
            <Input
              id="edit-task-title"
              data-testid={`edit-task-title-${task.id}`}
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="border-orange-200 focus:border-orange-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-description" style={{ color: '#2c1810' }}>Description</Label>
            <Textarea
              id="edit-task-description"
              data-testid={`edit-task-description-${task.id}`}
              placeholder="Enter detailed description for the task"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-orange-200 focus:border-orange-500"
              rows={4}
            />
          </div>
          <Button
            type="submit"
            data-testid={`submit-edit-task-${task.id}`}
            className="w-full text-white font-semibold"
            style={{ background: '#ff6b35' }}
          >
            Update Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}