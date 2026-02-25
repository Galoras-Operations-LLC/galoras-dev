

## Featured Gallery: Smaller Rectangles + Auto-Rotate

### Overview
Update the Featured Coaches gallery to use smaller 16:9 tiles in a denser grid and auto-rotate the visible set every 4 seconds. Only `src/components/FeaturedCoaches.tsx` changes. No DB, routing, or logic changes.

### Changes to `src/components/FeaturedCoaches.tsx`

**New state and effects:**
- Add `startIndex` state (number, default 0)
- Add `visibleCount` state derived from `window.matchMedia`:
  - >= 1024px: 4 columns
  - >= 768px: 3 columns
  - otherwise: 2 columns
- Add `useEffect` with `setInterval(4000ms)` that advances `startIndex` by `visibleCount`, wrapping via modulo. Interval pauses (does not tick) when `selectedCoach !== null`.

**Visible coaches slice (with wrap-around):**
```text
visibleCoaches = []
for i in 0..visibleCount:
  visibleCoaches.push(featuredCoaches[(startIndex + i) % featuredCoaches.length])
```
This handles lists shorter than `visibleCount` and seamless looping.

**Grid layout update:**
- Change grid classes from `grid md:grid-cols-2 lg:grid-cols-3` to `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Change tile aspect ratio from `aspect-[4/3]` to `aspect-[16/9]`

**Loading skeleton update:**
- Grid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`
- Each skeleton: `aspect-[16/9] rounded-2xl bg-muted animate-pulse`

**Everything else stays the same:**
- Query logic unchanged
- Modal popup unchanged (CoachCard static variant + "View Full Profile" button)
- Empty state (return null) unchanged
- No nested links

### Technical Detail: Rotation Timer

```text
useEffect:
  if no coaches or coaches.length === 0: return
  if selectedCoach is not null: return (pause)
  
  interval = setInterval(() => {
    setStartIndex(prev => (prev + visibleCount) % coaches.length)
  }, 4000)
  
  return () => clearInterval(interval)
  
  deps: [selectedCoach, visibleCount, coaches.length]
```

### Acceptance Criteria
- Tiles are 16:9 rectangles in a 2/3/4 column responsive grid
- Tiles are image-only (no text/badges)
- Visible set swaps every 4 seconds with seamless looping
- Rotation pauses when modal is open, resumes on close
- Click-to-modal behavior unchanged
- Bottom directory list unchanged
- No DB/logic/routing changes
