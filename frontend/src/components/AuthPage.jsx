import { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, title: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      onLogin(response.data.access_token, response.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Authentication failed';
      
      if (isLogin && (errorMessage.includes('Invalid') || errorMessage.includes('not found'))) {
        setErrorDialog({
          open: true,
          title: 'Login Failed',
          message: 'Invalid email or password. Please check your credentials and try again, or sign up for a new account.'
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fff5e6 0%, #ffe8d1 100%)' }}>
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Hero */}
        <div className="text-left space-y-6 hidden md:block">
          <h1 className="text-5xl lg:text-6xl font-bold" style={{ color: '#2c1810' }}>
            Task Manager
            <span className="block text-orange-600 mt-2">Dashboard</span>
          </h1>
          <p className="text-lg" style={{ color: '#5d4037' }}>
            Collaborate in real-time with your team. Manage clients, track tasks, and achieve your goals together.
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-orange-600" />
              <span style={{ color: '#2c1810' }}>Real-time collaboration</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-orange-600" />
              <span style={{ color: '#2c1810' }}>Track progress with ease</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-orange-600" />
              <span style={{ color: '#2c1810' }}>Manage multiple clients</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <Card className="border-2" style={{ borderColor: '#ff6b35', background: '#ffffff' }} data-testid="auth-card">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: '#2c1810' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription style={{ color: '#5d4037' }}>
              {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" style={{ color: '#2c1810' }}>Username</Label>
                  <Input
                    id="username"
                    data-testid="username-input"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required={!isLogin}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: '#2c1810' }}>Email</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#2c1810' }}>Password</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>
              <Button
                type="submit"
                data-testid="auth-submit-button"
                className="w-full text-white font-semibold"
                style={{ background: '#ff6b35' }}
                disabled={loading}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                data-testid="toggle-auth-mode"
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-600 hover:underline font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent style={{ background: '#ffffff' }}>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <AlertDialogTitle style={{ color: '#2c1810' }}>{errorDialog.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription style={{ color: '#5d4037' }} className="text-base">
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              data-testid="close-error-dialog"
              onClick={() => setErrorDialog({ open: false, title: '', message: '' })}
              style={{ background: '#ff6b35', color: '#ffffff' }}
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}