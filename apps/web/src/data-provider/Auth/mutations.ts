import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MutationKeys, QueryKeys, dataService, request } from 'librechat-data-provider';
import type { UseMutationResult } from '@tanstack/react-query';
import type * as t from 'librechat-data-provider';
import useClearStates from '~/hooks/Config/useClearStates';
import { clearAllConversationStorage } from '~/utils';
import store from '~/store';
import axios from 'axios';

// Custom auth service configuration
const authService = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

// Add request interceptor for better error handling
authService.interceptors.request.use(
  (config) => {
    console.log(`🔄 Making request to: ${config.baseURL}${config.url}`);
    console.log(`🔄 Request data:`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
authService.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from: ${response.config.url}`);
    console.log(`✅ Response status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Response interceptor error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    return Promise.reject(error);
  }
);

// Custom login mutation that works with our auth service
export const useLoginUserMutation = (
  options?: t.MutationOptions<t.TLoginResponse, t.TLoginUser, unknown, unknown>,
): UseMutationResult<t.TLoginResponse, unknown, t.TLoginUser, unknown> => {
  const queryClient = useQueryClient();
  const clearStates = useClearStates();
  const resetDefaultPreset = useResetRecoilState(store.defaultPreset);
  const setQueriesEnabled = useSetRecoilState<boolean>(store.queriesEnabled);
  
  return useMutation([MutationKeys.loginUser], {
    mutationFn: async (payload: t.TLoginUser) => {
      console.log("🚀 Login API Request - Payload:", payload);
      console.log("🚀 Login API Request - Sending to:", 'http://localhost:3080/api/v1/auth/login');
      
      const requestData = {
        username: payload.email, // Our auth service expects username
        password: payload.password,
      };
      
      console.log("🚀 Login API Request - Request data:", requestData);
      
      const response = await authService.post('/api/v1/auth/login', requestData);
      
      console.log("🚀 Login API Response - Status:", response.status);
      console.log("🚀 Login API Response - Data:", response.data);
      
      // Transform response to match expected format
      return {
        user: {
          id: response.data.data.user.id,
          username: response.data.data.user.username,
          email: response.data.data.user.email,
          firstName: response.data.data.user.first_name,
          lastName: response.data.data.user.last_name,
          role: 'USER',
          avatar: null,
          createdAt: response.data.data.user.created_at,
        },
        token: response.data.data.access_token,
        refreshToken: response.data.data.refresh_token,
      };
    },
    ...(options || {}),
    onMutate: (vars) => {
      resetDefaultPreset();
      clearStates();
      queryClient.removeQueries();
      options?.onMutate?.(vars);
    },
    onSuccess: (...args) => {
      setQueriesEnabled(true);
      options?.onSuccess?.(...args);
    },
  });
};

// Custom logout mutation
export const useLogoutUserMutation = (
  options?: t.LogoutOptions,
): UseMutationResult<t.TLogoutResponse, unknown, undefined, unknown> => {
  const queryClient = useQueryClient();
  const clearStates = useClearStates();
  const resetDefaultPreset = useResetRecoilState(store.defaultPreset);
  const setQueriesEnabled = useSetRecoilState<boolean>(store.queriesEnabled);

  return useMutation([MutationKeys.logoutUser], {
    mutationFn: async () => {
      try {
        await authService.post('/api/v1/auth/logout');
      } catch (error) {
        // Logout should succeed even if the server request fails
        console.warn('Logout request failed:', error);
      }
      return { message: 'Logged out successfully' };
    },
    ...(options || {}),
    onSuccess: (...args) => {
      setQueriesEnabled(false);
      resetDefaultPreset();
      clearStates();
      queryClient.removeQueries();
      options?.onSuccess?.(...args);
    },
  });
};

// Custom refresh token mutation
export const useRefreshTokenMutation = (
  options?: t.MutationOptions<t.TRefreshTokenResponse | undefined, undefined, unknown, unknown>,
): UseMutationResult<t.TRefreshTokenResponse | undefined, unknown, undefined, unknown> => {
  const queryClient = useQueryClient();
  
  return useMutation([MutationKeys.refreshToken], {
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Don't throw an error, just return undefined to indicate no refresh token
        return undefined;
      }
      
      try {
        const response = await authService.post('/api/v1/auth/refresh', {
          refresh_token: refreshToken,
        });
        
        return {
          token: response.data.data.access_token,
          refreshToken: response.data.data.refresh_token,
        };
      } catch (error) {
        // If refresh fails, clear the stored token and return undefined
        localStorage.removeItem('refreshToken');
        return undefined;
      }
    },
    ...(options || {}),
    onMutate: (vars) => {
      queryClient.removeQueries();
      options?.onMutate?.(vars);
    },
  });
};

// Custom register user mutation
export const useRegisterUserMutation = (
  options?: t.MutationOptions<t.TRegisterResponse, t.TRegisterUser, unknown, unknown>,
): UseMutationResult<t.TRegisterResponse, unknown, t.TRegisterUser, unknown> => {
  const queryClient = useQueryClient();
  const clearStates = useClearStates();
  const resetDefaultPreset = useResetRecoilState(store.defaultPreset);
  const setQueriesEnabled = useSetRecoilState<boolean>(store.queriesEnabled);
  
  return useMutation([MutationKeys.registerUser], {
    mutationFn: async (payload: t.TRegisterUser) => {
      console.log("📝 Registration API Request - Payload:", payload);
      console.log("📝 Registration API Request - Sending to:", 'http://localhost:3080/api/v1/auth/register');
      
      const requestData = {
        username: payload.email,
        email: payload.email,
        password: payload.password,
      };
      
      console.log("📝 Registration API Request - Request data:", requestData);
      
      try {
        const response = await authService.post('/api/v1/auth/register', requestData);
        
        console.log("📝 Registration API Response - Status:", response.status);
        console.log("📝 Registration API Response - Data:", response.data);
        
        return response.data;
      } catch (error: any) {
        console.error("📝 Registration API Error:", error);
        console.error("📝 Registration API Error Response:", error.response?.data);
        console.error("📝 Registration API Error Status:", error.response?.status);
        console.error("📝 Registration API Error Message:", error.message);
        
        // Re-throw the error with more details
        throw error;
      }
    },
    ...(options || {}),
    onMutate: (vars) => {
      resetDefaultPreset();
      clearStates();
      queryClient.removeQueries();
      options?.onMutate?.(vars);
    },
    onSuccess: (...args) => {
      setQueriesEnabled(true);
      options?.onSuccess?.(...args);
    },
  });
};

/* User */
export const useDeleteUserMutation = (
  options?: t.MutationOptions<unknown, undefined>,
): UseMutationResult<unknown, unknown, undefined, unknown> => {
  const queryClient = useQueryClient();
  const clearStates = useClearStates();
  const resetDefaultPreset = useResetRecoilState(store.defaultPreset);

  return useMutation([MutationKeys.deleteUser], {
    mutationFn: () => dataService.deleteUser(),
    ...(options || {}),
    onSuccess: (...args) => {
      resetDefaultPreset();
      clearStates();
      clearAllConversationStorage();
      queryClient.removeQueries();
      options?.onSuccess?.(...args);
    },
  });
};

// Array.isArray(user?.backupCodes) && user?.backupCodes.length > 0

export const useEnableTwoFactorMutation = (): UseMutationResult<
  t.TEnable2FAResponse,
  unknown,
  void,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.enableTwoFactor(), {
    onSuccess: (data) => {
      queryClient.setQueryData([QueryKeys.user, '2fa'], data);
    },
  });
};

export const useVerifyTwoFactorMutation = (): UseMutationResult<
  t.TVerify2FAResponse,
  unknown,
  t.TVerify2FARequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((payload: t.TVerify2FARequest) => dataService.verifyTwoFactor(payload), {
    onSuccess: (data) => {
      queryClient.setQueryData([QueryKeys.user, '2fa'], data);
    },
  });
};

export const useConfirmTwoFactorMutation = (): UseMutationResult<
  t.TVerify2FAResponse,
  unknown,
  t.TVerify2FARequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((payload: t.TVerify2FARequest) => dataService.confirmTwoFactor(payload), {
    onSuccess: (data) => {
      queryClient.setQueryData([QueryKeys.user, '2fa'], data);
    },
  });
};

export const useDisableTwoFactorMutation = (): UseMutationResult<
  t.TDisable2FAResponse,
  unknown,
  void,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.disableTwoFactor(), {
    onSuccess: (data) => {
      queryClient.setQueryData([QueryKeys.user, '2fa'], null);
    },
  });
};

export const useRegenerateBackupCodesMutation = (): UseMutationResult<
  t.TRegenerateBackupCodesResponse,
  unknown,
  void,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.regenerateBackupCodes(), {
    onSuccess: (data) => {
      queryClient.setQueryData([QueryKeys.user, '2fa', 'backup'], data);
    },
  });
};

export const useVerifyTwoFactorTempMutation = (
  options?: t.MutationOptions<t.TVerify2FATempResponse, t.TVerify2FATempRequest, unknown, unknown>,
): UseMutationResult<t.TVerify2FATempResponse, unknown, t.TVerify2FATempRequest, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TVerify2FATempRequest) => dataService.verifyTwoFactorTemp(payload),
    {
      ...(options || {}),
      onSuccess: (data, ...args) => {
        queryClient.setQueryData([QueryKeys.user, '2fa'], data);
        options?.onSuccess?.(data, ...args);
      },
    },
  );
};
