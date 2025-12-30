# Google Analytics 4 Setup Guide

## 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (bottom left gear icon)
3. Click **Create Property**
4. Enter property details:
   - Property name: "Cricket Scorecard"
   - Time zone: Your timezone
   - Currency: Your currency
5. Click **Next**
6. Fill in business details (optional)
7. Click **Create**
8. Accept Terms of Service

## 2. Get Your Measurement ID

1. In Admin, under **Property**, click **Data Streams**
2. Click **Add stream** → **Web**
3. Enter your website URL (e.g., `https://your-domain.com`)
4. Stream name: "Cricket Scorecard Web"
5. Click **Create stream**
6. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

## 3. Add Measurement ID to Environment Variables

Create or update `.env.local` in your project root:

```bash
# Add this line with your actual Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important:** Restart your dev server after adding environment variables:

```bash
npm run dev
```

## 4. Verify Installation

### Method 1: Google Analytics Realtime Report

1. Open your site in a browser
2. Go to GA4 → Reports → Realtime
3. You should see 1 active user (yourself)

### Method 2: Browser Console

1. Open your site
2. Open browser DevTools (F12)
3. Go to Network tab
4. Filter by "gtag" or "collect"
5. Navigate pages and see requests being sent

### Method 3: Google Tag Assistant (Chrome Extension)

1. Install [Tag Assistant](https://tagassistant.google.com/)
2. Click the extension
3. Visit your site
4. Should show GA4 tag firing

## 5. Test Events

Navigate through your app and check these work:

- ✅ Page views (automatic)
- ✅ Tournament viewed
- ✅ Match viewed
- ✅ Display opened

Events will appear in GA4 within 24-48 hours in standard reports.
For immediate validation, use **Realtime** → **Events**

## 6. What Gets Tracked Automatically

Once GA4 is configured, these metrics are tracked automatically:

### Traffic Metrics:

- **Users**: Total unique visitors
- **Active Users**: Users in last 28 days
- **New Users**: First-time visitors
- **Sessions**: Total visits
- **Engagement Rate**: % of engaged sessions
- **Engaged Sessions**: Sessions lasting >10s or 2+ pages
- **Average Engagement Time**: Time users spend on site

### Page Analytics:

- **Views**: Total page loads
- **Views per User**: Average pages viewed
- **Average Engagement Time per Page**: Time on each page

### Acquisition:

- **Traffic Source**: Where users come from (Direct, Google, Social, etc.)
- **Medium**: Type of traffic (organic, referral, none)
- **Campaign**: UTM campaign tracking

### Technology:

- **Browser**: Chrome, Safari, Firefox, etc.
- **Device Category**: Desktop, Mobile, Tablet
- **Operating System**: Windows, macOS, iOS, Android
- **Screen Resolution**: Display sizes

### Geography:

- **Country**: User locations
- **City**: City-level data
- **Language**: Browser language

## 7. Key Reports to Monitor

### Real-time (instant data):

- `Reports → Realtime`
- See current active users
- View pages being viewed right now
- See events firing live

### Overview (daily summary):

- `Reports → Reports snapshot`
- Users today vs yesterday
- Traffic sources
- Top pages
- User engagement

### Acquisition (traffic sources):

- `Reports → Acquisition → Traffic acquisition`
- Where users come from
- Which channels drive most traffic

### Engagement (page performance):

- `Reports → Engagement → Pages and screens`
- Most viewed pages
- Time on page
- Bounce rate equivalent

### User Attributes:

- `Reports → User → User attributes`
- Demographics (if enabled)
- Technology (browser, device)
- Locations

## 8. Custom Dashboards

Create a custom dashboard for cricket-specific metrics:

1. Go to **Explore** (left sidebar)
2. Click **Blank** to create new exploration
3. Add these metrics:
   - Event count for "match_created"
   - Event count for "ball_recorded"
   - Event count for "display_opened"
   - Users by page path (to see popular tournaments)

## 9. Daily Active Users (DAU) Tracking

To see Daily Active Users:

1. Go to **Reports → Reports snapshot**
2. Look for "Active users" card
3. Click to see breakdown by:
   - Day (Daily Active Users)
   - Week (Weekly Active Users)
   - Month (Monthly Active Users)

Or create custom report:

1. **Explore → Create exploration**
2. Add dimension: Date
3. Add metric: Active users
4. Visualization: Line chart

## 10. Key Metrics Reference

| Metric              | Location in GA4     | What It Means         |
| ------------------- | ------------------- | --------------------- |
| Daily Active Users  | Reports snapshot    | Unique users per day  |
| Active Users (28d)  | Reports snapshot    | Users in last 28 days |
| New Users           | Reports snapshot    | First-time visitors   |
| Sessions            | Reports snapshot    | Total visits          |
| Engagement Rate     | Reports snapshot    | Quality of traffic    |
| Avg Engagement Time | Reports snapshot    | Time spent on site    |
| Page Views          | Engagement → Pages  | Total page loads      |
| Event Count         | Engagement → Events | Custom events fired   |

## 11. Troubleshooting

### No data showing?

- Wait 24-48 hours for data to appear in reports
- Check Realtime report for immediate feedback
- Verify Measurement ID is correct
- Check browser console for errors
- Ensure dev server was restarted after adding env var

### Events not firing?

- Check browser console for gtag errors
- Verify event names match GA4 requirements (lowercase, underscores)
- Check Network tab for `gtag/js` and `collect` requests

### "gtag is not defined" error?

- Ensure `GA_MEASUREMENT_ID` is set in `.env.local`
- Restart dev server
- Check that Script components are loading

## 12. Privacy & GDPR

Current implementation:

- ✅ Anonymizes IP addresses
- ✅ No user identification
- ✅ No sensitive data sent
- ✅ Secure cookies (SameSite=None;Secure)

For EU/GDPR compliance, you may need:

- Cookie consent banner (optional for analytics-only tracking)
- Privacy policy mentioning Google Analytics
- Data Processing Agreement with Google

## 13. Cost

Google Analytics 4 is **completely free** for standard use with no limits on:

- Traffic volume
- Events tracked
- Users
- Reports
- Data retention (14 months default)

Only Google Analytics 360 (enterprise) has costs (~$150k/year).

## Next Steps

After setup:

1. ✅ Monitor Realtime report for 24 hours
2. ✅ Check data appears in Reports snapshot
3. ✅ Review traffic sources
4. ✅ Create custom dashboard for cricket metrics
5. ✅ Set up alerts for traffic spikes/drops
