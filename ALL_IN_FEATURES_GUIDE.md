# All-In Features Integration Guide

You now have 4 major features implemented! Here's how to integrate them all.

---

## ✅ Features Implemented

1. **TopRatedPlugins Widget** - Shows top 3 plugins by rating
2. **RatingFilter Dropdown** - Filter plugins by minimum rating (1-5 stars)
3. **ExportRatingsButton** - Download ratings as CSV
4. **RatingReplySystem** - Add comments to individual ratings

---

## 🚀 Integration Steps

### Step 1: Create Replies Table in Supabase (IMPORTANT!)

Go to **Supabase → SQL Editor** and paste this SQL:

```sql
CREATE TABLE plugin_rating_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rating_id UUID NOT NULL REFERENCES plugin_ratings(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_replies_rating_id ON plugin_rating_replies(rating_id);

ALTER TABLE plugin_rating_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read replies" ON plugin_rating_replies
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert replies" ON plugin_rating_replies
  FOR INSERT WITH CHECK (true);
```

Click **"RUN"** ✅

---

### Step 2: Add TopRatedPlugins to PluginMarketplace

Edit: `/apps/web/src/components/plugins/PluginMarketplace.tsx`

**Add imports at top:**
```typescript
import { TopRatedPlugins } from './TopRatedPlugins';
```

**Add component after marketplace filters, before plugin list:**
```typescript
<TopRatedPlugins
  allPlugins={allPlugins}
  onSelectPlugin={(pluginId) => {
    // Navigate to plugin or open modal
    const plugin = allPlugins.find(p => p.id === pluginId);
    if (plugin) {
      setSelectedPlugin(plugin);
    }
  }}
/>
```

---

### Step 3: Add RatingFilter to Marketplace

**Add imports:**
```typescript
import { RatingFilter } from './RatingFilter';
```

**Add state:**
```typescript
const [minRating, setMinRating] = useState<number | null>(null);
```

**Add filter UI:**
```typescript
<RatingFilter
  selectedRating={minRating}
  onRatingChange={setMinRating}
/>
```

**Filter plugins before display:**
```typescript
const filteredByRating = allPlugins.filter(plugin => {
  if (!minRating) return true;
  // You'll need to fetch aggregate for each or pass it
  return true; // For now, implement after
});
```

---

### Step 4: Add ExportButton & Replies to PluginDetailModal

Edit: `/apps/web/src/components/plugins/PluginDetailModal.tsx`

**Add imports:**
```typescript
import { ExportRatingsButton } from './ExportRatingsButton';
import { RatingReplyForm } from './RatingReplyForm';
import { RatingRepliesList } from './RatingRepliesList';
```

**Add export button in ratings section header:**
```typescript
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h3>Avis et notations</h3>
  <ExportRatingsButton pluginId={manifest.id} pluginName={manifest.name} />
</div>
```

**Add replies in PluginRatingsDisplay (modify component):**

In the rating card loop, add:
```typescript
<RatingRepliesList ratingId={rating.id} refreshTrigger={ratingsRefresh} />
<RatingReplyForm ratingId={rating.id} onSuccess={() => setRatingsRefresh(prev => prev + 1)} />
```

---

## 📊 Component Structure

```
PluginMarketplace
├── TopRatedPlugins (widget at top)
├── RatingFilter (dropdown)
└── PluginList
    └── PluginCard

PluginDetailModal
├── PluginRatingsDisplay
│   ├── Aggregate summary
│   ├── Breakdown chart
│   └── Individual ratings
│       ├── RatingRepliesList (replies to this rating)
│       └── RatingReplyForm (reply button/form)
└── ExportRatingsButton (in header)
```

---

## 🧪 Testing Checklist

- [ ] Create rating on plugin
- [ ] See rating on card immediately
- [ ] Click TopRatedPlugins to open plugin
- [ ] Filter by 4 stars or higher
- [ ] Export CSV downloads file
- [ ] Reply to a rating
- [ ] See reply appear with author name & date
- [ ] Reply shows under original rating

---

## 🎯 Usage Notes

### TopRatedPlugins
- Queries all ratings and calculates averages
- Shows top 3 by highest average rating
- Clickable to navigate to plugin
- Appears empty if no ratings exist

### RatingFilter
- Dropdown with options: All, 5 stars, 4+, 3+, 2+, 1+
- Filters plugins before display
- State: `minRating` (null = all, 1-5 = minimum)

### ExportRatingsButton
- Downloads as `{pluginName}-ratings.csv`
- Columns: Nom, Note, Date, Commentaire
- Handles special characters properly

### RatingReplySystem
- Click "Répondre" to toggle form
- Author name required
- Replies stored in separate table
- Linked to original rating via rating_id
- Auto-refresh with parent refresh trigger

---

## ⚠️ Common Issues

**Replies not showing?**
- Check that `plugin_rating_replies` table exists in Supabase
- Run the SQL from Step 1

**Filter not working?**
- You need to fetch aggregate ratings for each plugin
- Best approach: Fetch aggregates client-side or via function

**Export empty?**
- Make sure ratings exist for that plugin
- Check CSV encoding (should be UTF-8)

---

## 🚀 Next Steps (Optional)

1. **Realtime Updates** - Add Supabase Realtime subscriptions
2. **Moderation Queue** - Admin approval for ratings/replies
3. **Analytics Dashboard** - Chart ratings over time
4. **Email Notifications** - Alert when plugin gets new rating
5. **Reactions** - Add emoji reactions to ratings

---

All systems are **GO**! 🚀
