# Giscus Configuration Guide

## Overview

Giscus is integrated into Cartae marketplace for plugin reviews and community discussions. It uses GitHub Discussions as the backend for storing comments and reviews.

## Setup Instructions

### 1. Install Giscus App

1. Go to https://github.com/apps/giscus
2. Click "Install"
3. Select the `guthubrx/cartae-plugins` repository
4. Grant necessary permissions

### 2. Enable Discussions on cartae-plugins Repository

1. Go to https://github.com/guthubrx/cartae-plugins
2. Navigate to **Settings**
3. Scroll down to **Features**
4. Enable **Discussions** checkbox
5. Create a new category called **"Plugin Reviews"** with description "Reviews and feedback for plugins"

### 3. Get Repository Configuration

1. Visit https://giscus.app
2. Enter repository info: `guthubrx/cartae-plugins`
3. Select discussion category: **Plugin Reviews**
4. Choose mapping: **Specific term** (for per-plugin discussions)
5. Copy the generated configuration

### 4. Update PluginReviews Component

Edit `apps/web/src/components/plugins/PluginReviews.tsx`:

```tsx
<Giscus
  id={`plugin-${pluginId}`}
  repo="guthubrx/cartae-plugins"
  repoId="R_kgDON7lJBA"           // ← Update with actual ID from giscus.app
  category="Plugin Reviews"
  categoryId="DIC_kwDON7lJBM4Cy_gP" // ← Update with actual ID from giscus.app
  mapping="specific"
  term={`Plugin: ${pluginName} (${pluginId})`}
  // ... rest of config
/>
```

### 5. Test

1. Open any plugin detail modal
2. Scroll to "Avis et commentaires" section
3. Comments should load from GitHub Discussions
4. Users can add comments if logged into GitHub

## How It Works

- **One discussion per plugin** (mapping by plugin ID and name)
- **GitHub Discussions backend** - comments stored in GitHub, not in database
- **Automatic markdown support** - reviews can include formatted text
- **Reactions** - users can react with emoji to comments
- **Authentication** - users must be logged into GitHub to comment

## Environment Variables

No additional environment variables needed. Giscus uses GitHub OAuth automatically.

## Privacy & GDPR

- Comments are stored in GitHub Discussions (public)
- User data handled by GitHub per their privacy policy
- Consider using only approved GitHub accounts for corporate use

## Troubleshooting

### Comments not loading
- Check if Discussions are enabled on the repository
- Verify repo ID and category ID are correct
- Check browser console for errors

### Auth issues
- User must be logged into GitHub
- Verify Giscus app is installed on the repository
- Check GitHub permissions

### Wrong discussion is loading
- Verify `term` mapping is unique per plugin
- Current format: `Plugin: {name} ({id})`

## Future Enhancements

- [ ] Custom styling to match Cartae theme
- [ ] Aggregate rating calculation from discussions
- [ ] Moderation tools for reviews
- [ ] Auto-archive discussions for deprecated plugins
- [ ] Review analytics dashboard
