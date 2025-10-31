/**
 * Plugin Rating Service
 * Handles submitting plugin ratings to GitHub for global tracking
 */

interface RatingSubmission {
  pluginId: string;
  pluginName: string;
  rating: number;
  timestamp: string;
  userAgent: string;
}

// IMPORTANT: Replace with your actual GitHub repository
const GITHUB_REPO_OWNER = 'YOUR_USERNAME';
const GITHUB_REPO_NAME = 'bigmind-plugins';

// Note: GitHub API ne nécessite pas de token pour créer des issues publiques
// mais vous pouvez en ajouter un si vous voulez limiter les abus
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`;

export class PluginRatingService {
  /**
   * Submit a rating for a plugin
   */
  static async submitRating(submission: RatingSubmission): Promise<void> {
    const { pluginId, pluginName, rating, timestamp, userAgent } = submission;

    try {
      const response = await fetch(GITHUB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
          // Si vous avez un token GitHub, décommentez cette ligne:
          // 'Authorization': `token ${GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          title: `[Rating] ${pluginName} - ${rating}/5 ⭐`,
          body: this.formatIssueBody(submission),
          labels: ['plugin-rating', `rating-${rating}`, `plugin:${pluginId}`],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to submit rating: ${response.status} ${response.statusText}`
        );
      }

      console.log('[PluginRatingService] Rating submitted successfully');
    } catch (error) {
      console.error('[PluginRatingService] Error submitting rating:', error);
      throw error;
    }
  }

  /**
   * Format the GitHub issue body
   */
  private static formatIssueBody(submission: RatingSubmission): string {
    const { pluginId, pluginName, rating, timestamp, userAgent } = submission;

    return `## Plugin Rating Submission

**Plugin:** ${pluginName}
**Plugin ID:** \`${pluginId}\`
**Rating:** ${rating}/5 ${'⭐'.repeat(rating)}
**Timestamp:** ${timestamp}
**User Agent:** ${userAgent}

---

> 🤖 This rating was submitted automatically by a BigMind user.
> Ratings help the community discover the best plugins.

### Processing Notes

- This issue will be processed automatically to update the plugin registry
- Multiple ratings for the same plugin will be aggregated
- Spam or invalid ratings will be closed automatically
`;
  }

  /**
   * Check if rating submission is available
   * (Can be disabled if GitHub repo is not configured)
   */
  static isAvailable(): boolean {
    return GITHUB_REPO_OWNER !== 'YOUR_USERNAME' && GITHUB_REPO_NAME !== 'bigmind-plugins';
  }
}

export default PluginRatingService;
