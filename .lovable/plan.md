

## Final Polish: Proportional Titles + Accent Words + Centered Featured Grid

### Overview
Three visual tweaks to the `/coaching` page. No logic, data, or routing changes.

### Changes

**1. `src/components/FeaturedCoaches.tsx` — Title + Accent + Centered Grid**

**Title update** (lines 104-105 and loading skeleton title at line 53):
- Change from `text-3xl md:text-4xl` to `text-3xl md:text-[42px]`
- Wrap "Featured" in `<span className="text-gradient">Featured</span>` to match the "Execution-Ready" accent style (gradient from primary to accent)

**Centered grid** (line 125):
- Import `cn` from `@/lib/utils`
- Wrap the grid in a `flex justify-center` container
- Set grid columns dynamically based on `visibleCoaches.length`:
  - 1 coach: `grid-cols-1 max-w-xs`
  - 2 coaches: `grid-cols-2 max-w-2xl`
  - 3 coaches: `grid-cols-3 max-w-4xl`
  - 4+ coaches: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (current full-width behavior)

Everything else (paging logic, tile styling, divider, modal) stays the same.

**2. `src/pages/coaching/CoachingDirectory.tsx` — Title + Accent (lines 220-221)**

- Change from `text-3xl md:text-4xl` to `text-3xl md:text-[40px]`
- Wrap "Coaching" in `<span className="text-gradient">Coaching</span>`

### Accent Style Reference
The site uses `.text-gradient` (defined in `index.css`) which applies `bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent`. This is exactly what "Execution-Ready" uses in the hero. Both "Featured" and "Coaching" will use this same class.

### Files Summary

| File | Change |
|---|---|
| `src/components/FeaturedCoaches.tsx` | Title size to `md:text-[42px]`, accent on "Featured", dynamic centered grid |
| `src/pages/coaching/CoachingDirectory.tsx` | Title size to `md:text-[40px]`, accent on "Coaching" |

