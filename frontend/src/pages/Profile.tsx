import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Lock, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    setNewPassword: '',
    setConfirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {};
      
      if (formData.username !== user?.username) {
        updateData.username = formData.username;
      }
      
      if (formData.email !== user?.email) {
        updateData.email = formData.email;
      }

      if (formData.avatar !== user?.avatar) {
        updateData.avatar = formData.avatar;
      }

      if (Object.keys(updateData).length > 0) {
        const response = await api.put<{ user: any }>('/api/auth/profile', updateData);
        setUser(response.user);
        toast.success('Profile updated successfully');
      } else {
        toast.info('No changes to save');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.put('/api/auth/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      toast.success('Password changed successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.setNewPassword) {
      toast.error('Please enter a password');
      return;
    }

    if (formData.setNewPassword !== formData.setConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.setNewPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/set-password', {
        newPassword: formData.setNewPassword,
      });
      
      toast.success('Password set successfully! You can now login with email and password.');
      setFormData({
        ...formData,
        setNewPassword: '',
        setConfirmPassword: '',
      });
    } catch {
      toast.error('Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#161b22] px-6 py-4 shrink-0">
        <h1 className="text-xl font-semibold text-white">Profile Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Google User Notice */}
          {user?.isGoogleUser && (
            <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#58a6ff] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Google Account</p>
                <p className="text-xs text-gray-400 mt-1">
                  You signed in with Google. You can set a password below to also login with email and password.
                </p>
              </div>
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Profile Picture
            </h2>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarImage src={user?.avatar || formData.avatar} />
                <AvatarFallback className="bg-[#238636] text-white text-2xl">
                  {user?.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar" className="text-gray-300">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="mt-1.5 bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]"
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter an image URL for your avatar
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Account Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1.5 bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1.5 bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]"
                  placeholder="Enter email"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-[#238636] hover:bg-[#2ea043] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </div>

          {/* Password Section - Different for Google vs Regular users */}
          {user?.isGoogleUser ? (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Set Password
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Set a password to enable login with email and password in addition to Google.
              </p>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="setNewPassword" className="text-gray-300">New Password</Label>
                  <Input
                    id="setNewPassword"
                    type="password"
                    value={formData.setNewPassword}
                    onChange={(e) => setFormData({ ...formData, setNewPassword: e.target.value })}
                    className="mt-1.5 bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <Label htmlFor="setConfirmPassword" className="text-gray-300">Confirm Password</Label>
                  <Input
                    id="setConfirmPassword"
                    type="password"
                    value={formData.setConfirmPassword}
                    onChange={(e) => setFormData({ ...formData, setConfirmPassword: e.target.value })}
                    className="mt-1.5 bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]"
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Set Password
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="mt-1.5 bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="mt-1.5 bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="mt-1.5 bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]"
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </form>
            </div>
          )}

          {/* Account Stats */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">User ID</span>
                <span className="text-gray-300 font-mono">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Created</span>
                <span className="text-gray-300">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role</span>
                <span className="text-gray-300 capitalize">{user?.role || 'user'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Login Method</span>
                <span className="text-gray-300">{user?.isGoogleUser ? 'Google OAuth' : 'Email & Password'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
