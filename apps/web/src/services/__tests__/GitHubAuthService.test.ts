/**
 * GitHubAuthService Tests
 * Phase 2 - Developer Mode + GitHub OAuth
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GitHubAuthService, type GitHubUser } from '../GitHubAuthService';
import { GITHUB_CONFIG } from '../../config/github';

describe('GitHubAuthService', () => {
  let service: GitHubAuthService;
  const mockUser: GitHubUser = {
    login: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    avatarUrl: 'https://avatars.githubusercontent.com/u/123',
  };
  const mockToken = 'ghp_testtoken123456789';

  beforeEach(() => {
    service = new GitHubAuthService();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('PAT Authentication', () => {
    it('should successfully login with valid token', async () => {
      // Mock GitHub API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            login: mockUser.login,
            name: mockUser.name,
            email: mockUser.email,
            avatar_url: mockUser.avatarUrl,
          }),
      });

      const result = await service.login(mockToken);

      expect(result).toEqual(mockUser);
      expect(localStorage.getItem('bigmind-github-token')).toBe(mockToken);
      expect(localStorage.getItem('bigmind-github-user')).toBe(JSON.stringify(mockUser));

      // Verify API call
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should handle missing name by using login', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            login: 'testuser',
            name: null, // Name is missing
            email: 'test@example.com',
            avatar_url: 'https://example.com/avatar.jpg',
          }),
      });

      const result = await service.login(mockToken);

      expect(result.name).toBe('testuser'); // Should use login as name
    });

    it('should handle missing email', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            login: 'testuser',
            name: 'Test User',
            email: null, // Email is missing
            avatar_url: 'https://example.com/avatar.jpg',
          }),
      });

      const result = await service.login(mockToken);

      expect(result.email).toBe(''); // Should default to empty string
    });

    it('should fail with invalid token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(service.login('invalid_token')).rejects.toThrow('Token invalide ou expiré');
    });

    it('should fail on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(service.login(mockToken)).rejects.toThrow('Échec de la connexion GitHub');
    });

    it('should clear storage on logout', () => {
      localStorage.setItem('bigmind-github-token', mockToken);
      localStorage.setItem('bigmind-github-user', JSON.stringify(mockUser));

      service.logout();

      expect(localStorage.getItem('bigmind-github-token')).toBeNull();
      expect(localStorage.getItem('bigmind-github-user')).toBeNull();
    });
  });

  describe('User State Management', () => {
    it('should return user when authenticated', () => {
      localStorage.setItem('bigmind-github-user', JSON.stringify(mockUser));

      const user = service.getUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null when not authenticated', () => {
      const user = service.getUser();

      expect(user).toBeNull();
    });

    it('should return null for corrupted user data', () => {
      localStorage.setItem('bigmind-github-user', 'invalid json {');

      const user = service.getUser();

      expect(user).toBeNull();
    });

    it('should return token when stored', () => {
      localStorage.setItem('bigmind-github-token', mockToken);

      const token = service.getToken();

      expect(token).toBe(mockToken);
    });

    it('should return null when no token', () => {
      const token = service.getToken();

      expect(token).toBeNull();
    });

    it('should return true for isAuthenticated when both token and user exist', () => {
      localStorage.setItem('bigmind-github-token', mockToken);
      localStorage.setItem('bigmind-github-user', JSON.stringify(mockUser));

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false for isAuthenticated when token missing', () => {
      localStorage.setItem('bigmind-github-user', JSON.stringify(mockUser));

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false for isAuthenticated when user missing', () => {
      localStorage.setItem('bigmind-github-token', mockToken);

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Token Validation', () => {
    it('should return true for valid token', async () => {
      localStorage.setItem('bigmind-github-token', mockToken);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const isValid = await service.validateToken();

      expect(isValid).toBe(true);
    });

    it('should return false for invalid token', async () => {
      localStorage.setItem('bigmind-github-token', 'invalid_token');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      const isValid = await service.validateToken();

      expect(isValid).toBe(false);
    });

    it('should return false when no token stored', async () => {
      const isValid = await service.validateToken();

      expect(isValid).toBe(false);
    });

    it('should return false on network error', async () => {
      localStorage.setItem('bigmind-github-token', mockToken);

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const isValid = await service.validateToken();

      expect(isValid).toBe(false);
    });
  });

  describe('OAuth Flow', () => {
    it('should start OAuth flow with correct parameters', () => {
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      // Mock GITHUB_CONFIG
      const originalClientId = GITHUB_CONFIG.clientId;
      Object.defineProperty(GITHUB_CONFIG, 'clientId', {
        value: 'test_client_id',
        writable: true,
      });

      service.startOAuthFlow();

      // Verify state was stored
      const state = localStorage.getItem('bigmind-oauth-state');
      expect(state).toBeTruthy();
      expect(state?.length).toBeGreaterThan(0);

      // Verify redirect URL
      expect(mockLocation.href).toContain('https://github.com/login/oauth/authorize');
      expect(mockLocation.href).toContain('client_id=test_client_id');
      expect(mockLocation.href).toContain(`state=${state}`);
      expect(mockLocation.href).toContain('scope=read%3Auser');

      // Restore original value
      Object.defineProperty(GITHUB_CONFIG, 'clientId', {
        value: originalClientId,
        writable: true,
      });
    });

    it('should throw error if OAuth not configured', () => {
      const originalClientId = GITHUB_CONFIG.clientId;
      Object.defineProperty(GITHUB_CONFIG, 'clientId', {
        value: '',
        writable: true,
      });

      expect(() => service.startOAuthFlow()).toThrow('GitHub OAuth not configured');

      Object.defineProperty(GITHUB_CONFIG, 'clientId', {
        value: originalClientId,
        writable: true,
      });
    });
  });

  describe('OAuth Callback Handling', () => {
    const mockCode = 'oauth_code_123';
    const mockState = 'random_state_456';

    it('should successfully handle OAuth callback', async () => {
      localStorage.setItem('bigmind-oauth-state', mockState);

      // Mock Edge Function response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            token: mockToken,
            user: {
              login: mockUser.login,
              name: mockUser.name,
              email: mockUser.email,
              avatar_url: mockUser.avatarUrl,
            },
          }),
      });

      const result = await service.handleOAuthCallback(mockCode, mockState);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();

      // Verify token and user were stored
      expect(localStorage.getItem('bigmind-github-token')).toBe(mockToken);
      expect(localStorage.getItem('bigmind-github-user')).toBe(JSON.stringify(mockUser));

      // Verify state was cleared
      expect(localStorage.getItem('bigmind-oauth-state')).toBeNull();

      // Verify Edge Function was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('github-oauth'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ code: mockCode }),
        })
      );
    });

    it('should reject callback with invalid state (CSRF protection)', async () => {
      localStorage.setItem('bigmind-oauth-state', 'different_state');

      const result = await service.handleOAuthCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state parameter');
      expect(result.error).toContain('CSRF');
    });

    it('should reject callback with missing state', async () => {
      // No state in localStorage

      const result = await service.handleOAuthCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state parameter');
    });

    it('should handle Edge Function errors', async () => {
      localStorage.setItem('bigmind-oauth-state', mockState);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const result = await service.handleOAuthCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Edge Function error');
    });

    it('should handle Edge Function response without token', async () => {
      localStorage.setItem('bigmind-oauth-state', mockState);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Failed to exchange code',
          }),
      });

      const result = await service.handleOAuthCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to exchange code');
    });

    it('should handle network errors during callback', async () => {
      localStorage.setItem('bigmind-oauth-state', mockState);

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.handleOAuthCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle user data with missing name (use login)', async () => {
      localStorage.setItem('bigmind-oauth-state', mockState);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            token: mockToken,
            user: {
              login: 'testuser',
              name: null,
              email: 'test@example.com',
              avatar_url: 'https://example.com/avatar.jpg',
            },
          }),
      });

      const result = await service.handleOAuthCallback(mockCode, mockState);

      expect(result.success).toBe(true);
      expect(result.user?.name).toBe('testuser');
    });
  });

  describe('OAuth Callback Detection', () => {
    it('should detect OAuth callback from URL params', () => {
      const mockCode = 'oauth_code_123';
      const mockState = 'state_456';

      // Mock window.location.search
      Object.defineProperty(window, 'location', {
        value: {
          search: `?code=${mockCode}&state=${mockState}`,
        },
        writable: true,
      });

      const callback = service.checkOAuthCallback();

      expect(callback).not.toBeNull();
      expect(callback?.code).toBe(mockCode);
      expect(callback?.state).toBe(mockState);
    });

    it('should return null when no OAuth params in URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
        },
        writable: true,
      });

      const callback = service.checkOAuthCallback();

      expect(callback).toBeNull();
    });

    it('should return null when only code present', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?code=oauth_code_123',
        },
        writable: true,
      });

      const callback = service.checkOAuthCallback();

      expect(callback).toBeNull();
    });

    it('should return null when only state present', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?state=state_456',
        },
        writable: true,
      });

      const callback = service.checkOAuthCallback();

      expect(callback).toBeNull();
    });
  });

  describe('OAuth URL Cleanup', () => {
    it('should remove code and state from URL', () => {
      const mockUrl = new URL('http://localhost:5173?code=oauth_code&state=state_123&other=param');
      const mockReplaceState = vi.fn();

      Object.defineProperty(window, 'location', {
        value: {
          href: mockUrl.toString(),
        },
        writable: true,
      });

      Object.defineProperty(window, 'history', {
        value: {
          replaceState: mockReplaceState,
        },
        writable: true,
      });

      service.cleanOAuthParams();

      expect(mockReplaceState).toHaveBeenCalled();
      const cleanedUrl = mockReplaceState.mock.calls[0][2];
      expect(cleanedUrl).not.toContain('code=');
      expect(cleanedUrl).not.toContain('state=');
      expect(cleanedUrl).toContain('other=param'); // Other params preserved
    });
  });
});
