import { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { toast } from 'sonner';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import TaskItem from './TaskItem';
import AddTaskDialog from './AddTaskDialog';

export default function ClientCard({ client, tasks, onDelete, onUpdate, currentUser }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card
      className="border-2 hover:shadow-lg transition-shadow duration-300"
      style={{ borderColor: '#ffe8d1', background: '#ffffff' }}
      data-testid={`client-card-${client.id}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl" style={{ color: '#2c1810' }}>
              {client.name}
            </CardTitle>
            {client.description && (
              <CardDescription style={{ color: '#5d4037' }} className="mt-1">
                {client.description}
              </CardDescription>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                data-testid={`delete-client-${client.id}`}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent style={{ background: '#ffffff' }}>
              <AlertDialogHeader>
                <AlertDialogTitle style={{ color: '#2c1810' }}>Delete Client</AlertDialogTitle>
                <AlertDialogDescription style={{ color: '#5d4037' }}>
                  Are you sure? This will delete the client and all their tasks permanently.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-orange-300">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  data-testid={`confirm-delete-client-${client.id}`}
                  onClick={() => onDelete(client.id)}
                  style={{ background: '#d84315', color: '#ffffff' }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#5d4037' }}>Progress</span>
            <span className="font-semibold" style={{ color: '#ff6b35' }}>
              {completedTasks} / {totalTasks} tasks completed
            </span>
          </div>
          <Progress value={progress} className="h-3" style={{ background: '#ffe8d1' }} data-testid={`progress-bar-${client.id}`} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid={`toggle-tasks-${client.id}`}
              className="text-orange-600 hover:bg-orange-50 font-semibold"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Tasks
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Tasks ({totalTasks})
                </>
              )}
            </Button>
            <AddTaskDialog clientId={client.id} onUpdate={onUpdate} />
          </div>

          {isExpanded && (
            <div className="space-y-2 pt-2" data-testid={`tasks-list-${client.id}`}>
              {tasks.length === 0 ? (
                <p className="text-center py-4" style={{ color: '#5d4037' }}>
                  No tasks yet. Add your first task!
                </p>
              ) : (
                tasks.map((task) => (
                  <TaskItem key={task.id} task={task} onUpdate={onUpdate} currentUser={currentUser} />
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}