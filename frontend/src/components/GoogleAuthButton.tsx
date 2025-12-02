import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { GoogleAuthResponse } from '@/types';
import { toast } from 'sonner';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // Don't render if Google Client ID is not configured
  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const data = await api.post<GoogleAuthResponse>('/api/auth/google', {
        credential: credentialResponse.credential,
      });
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Logged in with Google');
      navigate('/rooms');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google login failed');
    }
  };

  const handleError = () => {
    toast.error('Google login failed');
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
      />
    </div>
  );
};
