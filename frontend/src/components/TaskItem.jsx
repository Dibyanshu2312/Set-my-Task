import { useState } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Trash2, MessageSquare } from 'lucide-react';
import EditTaskDialog from './EditTaskDialog';
import CommentSection from './CommentSection';

export default function TaskItem({ task, onUpdate, currentUser }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await axios.put(`${API}/tasks/${task.id}`, { status: newStatus });
      toast.success(`Task marked as ${newStatus}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`${API}/tasks/${task.id}`);
      toast.success('Task deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div
      className="border-2 rounded-lg mb-2"
      style={{ borderColor: task.status === 'completed' ? '#a5d6a7' : '#ffe8d1', background: task.status === 'completed' ? '#f1f8f4' : '#fffbf7' }}
      data-testid={`task-item-${task.id}`}
    >
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={task.id} className="border-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={handleToggleStatus}
              disabled={isUpdating}
              data-testid={`task-checkbox-${task.id}`}
              className="border-orange-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <div className="flex-1">
              <p
                className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}
                style={{ color: task.status === 'completed' ? '#5d4037' : '#2c1810' }}
                data-testid={`task-title-${task.id}`}
              >
                {task.title}
              </p>
            </div>
            <Badge
              variant="outline"
              style={{
                borderColor: task.status === 'completed' ? '#66bb6a' : '#ff6b35',
                color: task.status === 'completed' ? '#2e7d32' : '#d84315',
                background: task.status === 'completed' ? '#e8f5e9' : '#fff3e0'
              }}
            >
              {task.status === 'completed' ? 'Completed' : 'Pending'}
            </Badge>
            <AccordionTrigger className="hover:no-underline p-0 ml-2" data-testid={`expand-task-${task.id}`}>
            </AccordionTrigger>
          </div>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            {task.description && (
              <div className="pl-8">
                <p className="text-sm" style={{ color: '#5d4037' }} data-testid={`task-description-${task.id}`}>
                  {task.description}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2 pl-8">
              <EditTaskDialog task={task} onUpdate={onUpdate} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`delete-task-${task.id}`}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent style={{ background: '#ffffff' }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle style={{ color: '#2c1810' }}>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription style={{ color: '#5d4037' }}>
                      Are you sure you want to delete this task? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-orange-300">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      data-testid={`confirm-delete-task-${task.id}`}
                      onClick={handleDeleteTask}
                      style={{ background: '#d84315', color: '#ffffff' }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Comments Section */}
            <div className="pl-8 border-t pt-4" style={{ borderColor: '#ffe8d1' }}>
              <CommentSection taskId={task.id} currentUser={currentUser} />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}