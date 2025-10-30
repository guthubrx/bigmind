/**
 * GitHub Authentication Service
 * Gère l'authentification GitHub via Personal Access Token (PAT)
 * Pour MVP: approche simple sans OAuth serveur
 */

const GITHUB_TOKEN_KEY = 'bigmind-github-token';
const GITHUB_USER_KEY = 'bigmind-github-user';

export interface GitHubUser {
  login: string; // GitHub username
  name: string;
  email: string;
  avatarUrl: string;
}

export class GitHubAuthService {
  /**
   * Login avec un GitHub Personal Access Token
   * Le token est stocké dans localStorage
   */
  // eslint-disable-next-line class-methods-use-this
  async login(token: string): Promise<GitHubUser> {
    // Valider le token en récupérant les infos user
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Token invalide ou expiré');
      }

      const userData = await response.json();

      const user: GitHubUser = {
        login: userData.login,
        name: userData.name || userData.login,
        email: userData.email || '',
        avatarUrl: userData.avatar_url,
      };

      // Stocker le token et user info
      localStorage.setItem(GITHUB_TOKEN_KEY, token);
      localStorage.setItem(GITHUB_USER_KEY, JSON.stringify(user));
      // eslint-disable-next-line no-console
      console.log('[GitHubAuth] Login successful:', user.login);
      return user;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[GitHubAuth] Login failed:', error);
      throw new Error(
        `Échec de la connexion GitHub: ${
          error instanceof Error ? error.message : 'Erreur inconnue'
        }`
      );
    }
  }

  /**
   * Logout - supprime le token et user info
   */
  // eslint-disable-next-line class-methods-use-this
  logout(): void {
    localStorage.removeItem(GITHUB_TOKEN_KEY);
    localStorage.removeItem(GITHUB_USER_KEY);
    // eslint-disable-next-line no-console
    console.log('[GitHubAuth] Logout successful');
  }

  /**
   * Récupère l'utilisateur GitHub actuellement connecté
   */
  // eslint-disable-next-line class-methods-use-this
  getUser(): GitHubUser | null {
    const userJson = localStorage.getItem(GITHUB_USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as GitHubUser;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[GitHubAuth] Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Récupère le token GitHub
   */
  // eslint-disable-next-line class-methods-use-this
  getToken(): string | null {
    return localStorage.getItem(GITHUB_TOKEN_KEY);
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }

  /**
   * Vérifie que le token est toujours valide
   */
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      return response.ok;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[GitHubAuth] Token validation failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const gitHubAuthService = new GitHubAuthService();
