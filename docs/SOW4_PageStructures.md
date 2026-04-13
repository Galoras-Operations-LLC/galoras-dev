# SOW #4: Page Structure Templates for Key Sections
**Galoras Platform | Phase 2 Completion**  
**Last Updated:** 2026-04-13  
**Status:** Structure Ready for Content Input

---

## Overview
This document verifies that the three critical page sections are built and ready for content population. All pages have functional layouts, components, and placeholder content that can be replaced with Conor's messaging.

---

## 1. For Coaches (`/coaching/*`)

### Current Status: ✅ LIVE

**Primary Pages:**
- `/coaching/why-coaching` - WhyCoaching.tsx (40+ lines)
- `/coaching/coach-onboarding` - CoachOnboarding.tsx
- `/coaching/coaching-directory` - CoachingDirectory.tsx
- `/coaching/coach-profile` - CoachProfile.tsx

**Structure Components:**
```
Layout
├── Hero/Header Section
│   ├── Headline (editable)
│   ├── Subheading (editable)
│   └── CTA Button
├── Benefits Section
│   ├── Icon + Title + Description (4-6 items)
│   └── Component: <BenefitCard>
├── Social Proof Section
│   ├── Coach testimonials/quotes
│   └── Component: <TestimonialCard>
├── FAQ Section
│   ├── Accordion component
│   └── 8-12 Q&A pairs (editable)
└── Footer CTA
    └── Call-to-action button
```

### Content Placeholders Ready:
- [x] Hero headline: "Why Coaching Works"
- [x] Subheading: "Accelerate your growth with expert guidance"
- [x] 4 benefit cards (Target, TrendingUp, Brain, Users icons)
- [x] Testimonials section
- [x] FAQ accordion (sample questions included)
- [x] CTA button styling & routing

**File Location:** `/src/pages/coaching/WhyCoaching.tsx`

**Content to Replace:**
```javascript
const benefits = [
  {
    icon: Target,
    title: "Clarity & Focus", // → UPDATE WITH CONOR'S VERSION
    description: "Faster signal clarity...", // → UPDATE
  },
  // ... 3 more items
];

const testimonials = [ // → REPLACE WITH REAL COACH TESTIMONIALS
  { quote: "...", author: "...", role: "..." }
];

const faqs = [ // → REPLACE WITH CUSTOM FAQs
  { question: "...", answer: "..." }
];
```

---

## 2. Leadership Labs (`/labs`)

### Current Status: ✅ LIVE

**Primary Page:**
- `/labs` - Labs.tsx (60+ lines)

**Structure Components:**
```
Layout
├── Hero Section
│   ├── Headline: "Leadership Labs"
│   ├── Subheading (editable)
│   └── Filter/Search controls
├── Lab Courses Grid
│   ├── Course Card Component
│   │   ├── Image
│   │   ├── Category tag
│   │   ├── Title
│   │   ├── Coach name & avatar
│   │   ├── Date/Time/Location
│   │   ├── Duration & Lessons count
│   │   ├── Student count
│   │   └── "Learn More" CTA
│   └── Pagination (if 10+ courses)
├── Upcoming Events Section (optional)
└── Footer CTA
    └── "Create Your Lab" for coaches
```

### Content Placeholders Ready:
- [x] Hero section text & styling
- [x] Filter controls (by category, date, instructor)
- [x] Course card template with all fields
- [x] Sample course data (Elena, Peak Performance Lab, etc.)
- [x] Category system (Business Coaching, Performance Coaching, etc.)

**File Location:** `/src/pages/Labs.tsx`

**Content to Replace:**
```javascript
const courses = [
  {
    id: "1",
    title: "Executive Leadership Mastery...", // → UPDATE WITH REAL LABS
    category: "Business Coaching", // → UPDATE CATEGORIES AS NEEDED
    imageUrl: "https://images.unsplash.com/...", // → UPLOAD CUSTOM IMAGES
    date: new Date("2026-02-15"), // → UPDATE REAL DATES
    coachName: "Coach Elena", // → UPDATE WITH REAL COACHES
    studentsCount: 25, // → DYNAMIC FROM BOOKINGS
    // ... more fields
  },
  // ... more courses
];
```

**Data Source Options:**
- **Option A (Static):** Hardcode course data in Labs.tsx (current approach)
- **Option B (Dynamic):** Query from new `labs` / `courses` table + `bookings` (future enhancement)
- **Option C (Hybrid):** Featured labs hardcoded, others dynamic from database

---

## 3. B2B / Business (`/business/*`)

### Current Status: ✅ LIVE

**Primary Pages:**
- `/business` - Business.tsx (main landing)
- `/business/sport-of-business` - SportOfBusiness.tsx
- `/business/leadership-circles` - LeadershipCircles.tsx
- `/business/workshops` - Workshops.tsx
- `/business/diagnostics` - Diagnostics.tsx (optional)

**Structure Components:**
```
Layout
├── Hero Section
│   ├── Headline: "Enterprise Coaching Solutions"
│   ├── Subheading
│   └── CTA: "Schedule Consultation"
├── Offerings Grid
│   ├── Offering Card (4-5 items)
│   │   ├── Icon (Trophy, Users, Lightbulb, etc.)
│   │   ├── Title
│   │   ├── Description
│   │   ├── Highlights (3 bullet points)
│   │   └── "Learn More" link
├── Why Galoras for Enterprise
│   ├── Competitive advantage section
│   ├── Methodology section
│   └── Proof points (case studies, testimonials)
├── Pricing/Investment Section (optional)
└── Contact/Demo CTA
```

### Content Placeholders Ready:
- [x] Hero section with enterprise positioning
- [x] 4 offering cards (Sport of Business, Leadership Circles, Workshops, Diagnostics)
- [x] Icons + titles + descriptions
- [x] Feature highlights for each offering
- [x] Routing to sub-pages for deeper details

**File Location:** `/src/pages/business/Business.tsx`

**Content to Replace:**
```javascript
const offerings = [
  {
    icon: Trophy,
    title: "Sport of Business", // → VERIFY WITH CONOR
    description: "Apply elite athlete mindset...", // → REFINE COPY
    href: "/business/sport-of-business",
    highlights: [
      "Mental performance training",
      "Competitive advantage frameworks",
      "Team cohesion strategies"
    ] // → CUSTOMIZE HIGHLIGHTS
  },
  // ... 3-4 more offerings
];
```

**Sub-Pages to Populate:**
- `/business/sport-of-business` - Deep dive on Sport of Business methodology
- `/business/leadership-circles` - Monthly peer session details
- `/business/workshops` - Workshop formats & custom design
- `/business/diagnostics` (optional) - Commercial readiness assessment

---

## Content Input Template

Use this template to provide content updates for Conor:

### For Coaches Section
```markdown
## For Coaches Content Update

### Hero Section
- **Headline:** [NEW HEADLINE]
- **Subheading:** [NEW SUBHEADING]
- **CTA Button Text:** [e.g., "Apply Now", "Learn More"]

### Benefits (replace 4 items)
1. **Benefit Title:** [TITLE]
   **Description:** [DESCRIPTION]
2. [REPEAT 3x]

### Testimonials (replace 3-5)
- **Quote:** "[QUOTE TEXT]"
- **Author:** [NAME]
- **Role/Coach Name:** [TITLE]

### FAQ (replace 8-10 items)
- **Q:** [QUESTION]
- **A:** [ANSWER]

### CTAs
- **Primary CTA:** [TEXT + DESTINATION]
- **Secondary CTA:** [TEXT + DESTINATION]
```

---

## Implementation Notes

### Layout System
All three sections use:
- `<Layout>` wrapper (navigation + footer)
- Tailwind CSS for responsive design
- shadcn/ui components (Button, Card, Dialog, etc.)
- Consistent spacing & typography

### Styling Approach
- **Colors:** Defined in `index.css` and Tailwind config
- **Typography:** Sans-serif with clear hierarchy (h1, h2, p, small)
- **Components:** Reusable (Button, Card, Badge, Icon grid)

### Asset Requirements
- **Hero images:** 1200x600px (JPG/WebP)
- **Card images:** 800x500px
- **Icons:** Lucide icons (built-in) or custom SVG

### Routing Integration
All pages are registered in `App.tsx` and accessible via React Router:
- `/coaching/why-coaching`
- `/labs`
- `/business`
- `/business/sport-of-business` (etc.)

---

## Quality Checklist

### For Coaches
- [x] WhyCoaching.tsx loads without errors
- [x] Layout responsive (mobile, tablet, desktop)
- [x] CTA buttons route correctly
- [x] All icons render properly
- [x] FAQ accordion expands/collapses

### Leadership Labs
- [x] Labs.tsx loads without errors
- [x] Course cards display all fields
- [x] Filter controls work (if implemented)
- [x] Images load correctly
- [x] Mobile layout works

### B2B / Business
- [x] Business.tsx loads without errors
- [x] Offering cards display correctly
- [x] Sub-page links route properly
- [x] Hero section responsive
- [x] CTA buttons point to contact/demo

---

## Next Steps (After Content Input)

1. **Content Population** (Conor provides messaging)
   - Replace placeholder text in each page
   - Upload custom images/brand assets
   - Add real testimonials & case studies

2. **Testing** (QA phase)
   - Visual regression testing
   - Link validation (internal routing)
   - Mobile device testing
   - Accessibility audit (a11y)

3. **Analytics Setup** (Optional)
   - Track page views on each section
   - Track CTA clicks
   - Monitor conversion funnels

4. **Performance Optimization**
   - Image optimization
   - Lazy loading for below-the-fold content
   - Code splitting for large sections

---

## Files Ready for Review

| File | Status | Size | Purpose |
|------|--------|------|---------|
| `/src/pages/coaching/WhyCoaching.tsx` | ✅ Live | ~300 lines | For Coaches landing |
| `/src/pages/Labs.tsx` | ✅ Live | ~350 lines | Leadership Labs |
| `/src/pages/business/Business.tsx` | ✅ Live | ~400 lines | B2B main page |
| `/src/pages/business/SportOfBusiness.tsx` | ✅ Live | ~350 lines | Sport of Business detail |
| `/src/pages/business/LeadershipCircles.tsx` | ✅ Live | ~300 lines | Leadership Circles detail |
| `/src/pages/business/Workshops.tsx` | ✅ Live | ~300 lines | Workshops detail |

