# Changelog

## 1.1.0 - 2026-04-27

### Added
- **Drag-to-reorder activities**: Long-press (hold) an activity to pick it up, then drag to reorder. Includes haptic feedback and smooth animations.
- **Reset counter**: Reset button (counter-clockwise arrow icon) on the activity detail screen when the counter is above zero. Resets to the lower bound and logs a history entry.
- **Reset entry badges**: History entries from resets display an amber "Reset" badge instead of +1/-1.

### Changed
- Activities no longer jump to the top of the list when their counter changes. They stay in their current position.
- Activities are now sorted by a stable sort order instead of last-updated time.

### Fixed
- Entry badges now show the actual delta (e.g. +1, -1, Reset) instead of always assuming +1/-1.

### Notes
- Deploying new versions to Netlify does not affect local app data. All activity and history data is stored in the browser's IndexedDB, which is independent of deployed assets.

## 1.0.0 - 2026-04-27

### Added
- Initial release of Activity Counter PWA.
- Create, edit, and delete activities with optional upper bounds.
- Increment and decrement counters with optional notes.
- Progress bar visualization toward goals.
- Entry history log with editing and deletion.
- About screen with app version and URL.
- Bottom navigation bar for mobile.
- Offline support via service worker (PWA).
- Installable on Android without the Play Store.
