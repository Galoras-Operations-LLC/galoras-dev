

## Replace Logo in Navbar with SVG

The project doesn't have a `Header.tsx` -- the logo lives in `src/components/layout/Navbar.tsx` (line 100).

**Current code (line 100):**
```tsx
<img src={galorasLogo} alt="Galoras" className="h-10 md:h-12 w-auto" />
```
Where `galorasLogo` is imported from `@/assets/galoras-logo.png`.

**Change:**
1. Remove the PNG import (`import galorasLogo from "@/assets/galoras-logo.png"`) from line 23
2. Replace the `<img>` tag with:
   ```tsx
   <img src="/galoras-logo.svg" alt="Galoras" className="h-8 w-auto" />
   ```

This switches from the bundled PNG asset to the public SVG for crisper rendering at all sizes.
