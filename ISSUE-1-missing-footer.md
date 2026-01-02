# Bug: Footer Links Missing on Game Pages

## Description
Footer with "Report Bug 🐛" and "Feedback ✉️" links only appears on the homepage but is missing from all other pages.

## Current Behavior
- Homepage (`/`) has footer ✅
- Full Auction mode (`/full`) missing footer ❌
- Single Decision mode (`/single`) missing footer ❌
- Bridge 101 page (`/bridge-101`) missing footer ❌
- Tutorial page (`/tutorial`) missing footer ❌

## Expected Behavior
Footer should appear on ALL pages so users can easily:
- Report bugs they encounter while playing
- Send feedback about their experience

## Impact
- **Severity:** Medium
- **User Experience:** Users have no easy way to report bugs when they encounter them during gameplay
- **Workaround:** Users must navigate back to homepage to find contact links

## Proposed Solution
Add footer to all HTML pages with:
```html
<footer style="position: fixed; bottom: 0; left: 0; right: 0; background: #1e293b; padding: 1rem; text-align: center; border-top: 1px solid #334155;">
  <a href="https://github.com/todd427/slam-auction-interactive/issues/new" target="_blank">Report Bug 🐛</a>
  <span style="margin: 0 1rem; color: #64748b;">|</span>
  <a href="mailto:feedback@slambridge.ie">Feedback ✉️</a>
</footer>
```

## Files to Update
- `slam-auction-full.html`
- `slam-auction-single.html`
- `bridge-101.html`
- `tutorial.html`
- `pricing.html` (if applicable)

## Additional Notes
Footer should:
- Not overlap with game content
- Be visible but unobtrusive
- Use consistent styling across all pages
- Be responsive on mobile devices
