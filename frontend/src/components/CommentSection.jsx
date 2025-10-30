import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommentSection({ taskId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API}/comments/${taskId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API}/comments`, {
        task_id: taskId,
        text: newComment
      });
      toast.success('Comment added!');
      setNewComment('');
      fetchComments();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API}/comments/${commentId}`);
      toast.success('Comment deleted');
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete comment');
    }
  };

  return (
    <div className="space-y-3" data-testid={`comment-section-${taskId}`}>
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-orange-600" />
        <h4 className="font-semibold text-sm" style={{ color: '#2c1810' }}>
          Comments ({comments.length})
        </h4>
      </div>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-lg border"
              style={{ borderColor: '#ffe8d1', background: '#fffbf7' }}
              data-testid={`comment-${comment.id}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="font-semibold text-sm" style={{ color: '#ff6b35' }}>
                    {comment.username}
                  </span>
                  <span className="text-xs ml-2" style={{ color: '#8d6e63' }}>
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {comment.user_id === currentUser.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    data-testid={`delete-comment-${comment.id}`}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm" style={{ color: '#2c1810' }} data-testid={`comment-text-${comment.id}`}>
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          data-testid={`new-comment-${taskId}`}
          className="border-orange-200 focus:border-orange-500 min-h-[60px]"
          rows={2}
        />
        <Button
          type="submit"
          size="sm"
          disabled={loading || !newComment.trim()}
          data-testid={`submit-comment-${taskId}`}
          className="text-white font-semibold"
          style={{ background: '#ff6b35' }}
        >
          <Send className="w-3 h-3 mr-1" />
          Post Comment
        </Button>
      </form>
    </div>
  );
}