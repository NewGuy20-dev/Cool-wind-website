# TestimonialCarousel Component

A production-ready, fully responsive testimonial carousel component for Next.js applications with TypeScript support.

## Features

### Core Features
- ✅ **Responsive Design**: Mobile-first approach with perfect scaling across all devices
- ✅ **Auto-scroll**: Configurable automatic advancement with pause on hover
- ✅ **Smooth Animations**: CSS transform-based transitions with easing
- ✅ **Navigation Controls**: Previous/next arrow buttons with hover effects
- ✅ **Infinite Loop**: Seamless looping from last to first testimonial

### Advanced Features
- ✅ **Touch/Swipe Support**: Native swipe gestures for mobile devices
- ✅ **Keyboard Navigation**: Arrow key support for accessibility
- ✅ **Dot Indicators**: Visual indicators showing current position
- ✅ **Progress Bar**: Optional progress indicator for auto-scroll
- ✅ **Play/Pause Controls**: Manual control over auto-scroll
- ✅ **Star Ratings**: Optional rating display with customizable stars

### Accessibility Features
- ✅ **ARIA Labels**: Proper screen reader support
- ✅ **Keyboard Navigation**: Full keyboard accessibility
- ✅ **Focus Management**: Visible focus indicators
- ✅ **Screen Reader Announcements**: Live updates for current testimonial
- ✅ **Reduced Motion Support**: Respects user motion preferences

### Performance Optimizations
- ✅ **React.memo**: Optimized re-rendering
- ✅ **useCallback**: Memoized event handlers
- ✅ **Cleanup**: Proper cleanup of intervals and event listeners
- ✅ **Smooth Performance**: No layout thrashing during transitions

## Installation

The component uses the following dependencies (already included in most Next.js projects):
- React 18+
- Next.js 14+
- Tailwind CSS 3+
- Lucide React (for icons)
- TypeScript

```bash
npm install lucide-react
```

## Usage

### Basic Usage

```tsx
import TestimonialCarousel from '@/components/TestimonialCarousel';

const testimonials = [
  { 
    text: "Amazing service! Highly recommend.", 
    name: "John Doe", 
    role: "Customer",
    rating: 5
  },
  { 
    text: "Professional and reliable work.", 
    name: "Jane Smith", 
    role: "Business Owner" 
  }
];

export default function MyPage() {
  return (
    <TestimonialCarousel testimonials={testimonials} />
  );
}
```

### Advanced Usage

```tsx
<TestimonialCarousel 
  testimonials={testimonials}
  autoScrollInterval={8000}        // 8 seconds between slides
  showRating={true}               // Display star ratings
  showIndicators={true}           // Show dot indicators
  showProgressBar={true}          // Show progress bar
  showPlayPause={true}            // Show play/pause button
  className="my-custom-class"     // Additional CSS classes
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `testimonials` | `Testimonial[]` | **Required** | Array of testimonial objects |
| `autoScrollInterval` | `number` | `10000` | Auto-scroll interval in milliseconds |
| `showRating` | `boolean` | `true` | Whether to display star ratings |
| `showIndicators` | `boolean` | `true` | Whether to show dot indicators |
| `showProgressBar` | `boolean` | `false` | Whether to show progress bar |
| `showPlayPause` | `boolean` | `false` | Whether to show play/pause button |
| `className` | `string` | `''` | Additional CSS classes |

## Testimonial Interface

```typescript
interface Testimonial {
  text: string;        // The testimonial content (required)
  name: string;        // Customer name (required)
  role?: string;       // Customer role/title (optional)
  photo?: string;      // Customer photo URL (optional)
  rating?: number;     // Rating from 1-5 (optional)
}
```

## Responsive Breakpoints

The component uses Tailwind's responsive prefixes:

- **Mobile (< 640px)**: Full width with compact padding
- **Tablet (640px - 1024px)**: Moderate spacing and sizing  
- **Desktop (> 1024px)**: Max width container with generous spacing

## Keyboard Controls

- **Left Arrow**: Previous testimonial
- **Right Arrow**: Next testimonial
- **Tab**: Focus navigation buttons and indicators
- **Enter/Space**: Activate focused buttons

## Touch/Swipe Gestures

- **Swipe Left**: Next testimonial
- **Swipe Right**: Previous testimonial
- **Minimum swipe distance**: 50px

## Customization

### Styling

The component uses Tailwind CSS classes and can be customized by:

1. **Adding custom classes** via the `className` prop
2. **Overriding Tailwind classes** in your CSS
3. **Modifying the component** directly for extensive changes

### Animation Timing

All transitions use a 300ms duration with ease-in-out timing. You can modify this in the component or override with CSS:

```css
.testimonial-carousel .transition-all {
  transition-duration: 500ms;
}
```

### Colors and Themes

The component uses a blue color scheme by default. Customize by modifying the Tailwind color classes:

- Primary: `blue-500`, `blue-600`
- Backgrounds: `blue-50`, `indigo-50`
- Text: `gray-800`, `gray-600`

## Error Handling

The component gracefully handles:
- Empty testimonials array (shows "No testimonials available")
- Missing optional properties (role, photo, rating)
- Invalid ratings (ignored if not 1-5)
- Rapid navigation clicks (prevented during transitions)

## Browser Support

- Modern browsers with ES6+ support
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 8+)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Performance Notes

- Component uses `React.memo` for optimized rendering
- Event listeners are properly cleaned up
- Auto-scroll intervals are cleared on unmount
- Smooth CSS transforms prevent layout thrashing

## Examples

See `TestimonialCarousel.example.tsx` for complete usage examples including:
- Basic implementation
- Advanced configuration
- Minimal setup
- Fast carousel for short content

## Demo

Visit `/testimonial-demo` in your Next.js application to see the component in action with various configurations.