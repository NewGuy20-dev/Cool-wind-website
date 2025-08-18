import { Testimonial as CarouselTestimonial } from '@/components/TestimonialCarousel';

// Existing testimonial interface from the pages
export interface ExistingTestimonial {
  id?: string;
  name: string;
  location?: string;
  service?: string;
  rating: number;
  date?: string;
  text: string;
  serviceDetails?: string;
}

// Transform existing testimonial data to carousel format
export function transformTestimonialsForCarousel(
  testimonials: ExistingTestimonial[]
): CarouselTestimonial[] {
  return testimonials.map((testimonial) => ({
    text: testimonial.text,
    name: testimonial.name,
    role: testimonial.location ? `Customer from ${testimonial.location}` : 'Customer',
    rating: testimonial.rating,
    // Could add photo support later if needed
    photo: undefined
  }));
}

// Get top-rated testimonials for home page carousel
export function getTopTestimonialsForHome(
  testimonials: ExistingTestimonial[],
  limit: number = 5
): CarouselTestimonial[] {
  console.log('getTopTestimonialsForHome called with:', testimonials.length, 'testimonials');
  
  // First try rating >= 5, then fall back to rating >= 4, then all
  let topRated = testimonials.filter(t => t.rating >= 5);
  
  if (topRated.length === 0) {
    console.log('No 5-star testimonials, trying 4+ stars');
    topRated = testimonials.filter(t => t.rating >= 4);
  }
  
  if (topRated.length === 0) {
    console.log('No 4+ star testimonials, using all testimonials');
    topRated = testimonials;
  }
  
  const sorted = topRated
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .slice(0, limit);
  
  console.log('Returning', sorted.length, 'testimonials for carousel');
  return transformTestimonialsForCarousel(sorted);
}

// Enhanced testimonials data for better carousel display
export const enhancedTestimonials: ExistingTestimonial[] = [
  {
    id: '1',
    name: 'Priya M.',
    location: 'Thiruvalla',
    service: 'AC Repair',
    rating: 5,
    date: '2024-01-15',
    text: 'Quick response and fixed our AC same day! Very professional service. The technician was knowledgeable and explained everything clearly. Our AC is working better than ever.',
    serviceDetails: '1.5 ton split AC gas charging'
  },
  {
    id: '2',
    name: 'Ravi K.',
    location: 'Pathanamthitta',
    service: 'Refrigerator Service',
    rating: 5,
    date: '2024-01-12',
    text: 'Honest pricing and quality work on our fridge. Highly recommend! They diagnosed the compressor issue quickly and provided genuine Samsung parts.',
    serviceDetails: 'Samsung double door compressor replacement'
  },
  {
    id: '3',
    name: 'Sarah J.',
    location: 'Thiruvalla',
    service: 'Spare Parts',
    rating: 5,
    date: '2024-01-10',
    text: 'Best service in Thiruvalla, got genuine parts delivered same day. The door seal was exactly what we needed and installation guidance was very helpful.',
    serviceDetails: 'LG refrigerator door seal delivery'
  },
  {
    id: '4',
    name: 'Anil R.',
    location: 'Kozhencherry',
    service: 'AC Repair',
    rating: 5,
    date: '2024-01-08',
    text: 'Excellent service! Our office AC was making noise for weeks. They fixed it in 2 hours and gave 6-month warranty. Very satisfied with their work.',
    serviceDetails: '2 ton split AC fan motor replacement'
  },
  {
    id: '5',
    name: 'Meera S.',
    location: 'Mallappally',
    service: 'Electronics',
    rating: 5,
    date: '2024-01-05',
    text: 'Bought a refurbished Samsung fridge from them. Quality is excellent and comes with warranty. Great value for money and professional delivery.',
    serviceDetails: 'Samsung 192L refurbished refrigerator'
  },
  {
    id: '6',
    name: 'Thomas V.',
    location: 'Chengannur',
    service: 'Installation',
    rating: 5,
    date: '2024-01-03',
    text: 'Professional AC installation service. They handled everything from electrical work to copper piping. Clean work and reasonable pricing.',
    serviceDetails: 'Voltas 1.5 ton split AC installation'
  },
  {
    id: '7',
    name: 'Lakshmi P.',
    location: 'Thiruvalla',
    service: 'Refrigerator Service',
    rating: 5,
    date: '2023-12-28',
    text: 'Our Whirlpool fridge stopped cooling suddenly. They came within 3 hours and fixed the thermostat issue. Very reliable service.',
    serviceDetails: 'Whirlpool double door thermostat repair'
  },
  {
    id: '8',
    name: 'Rajesh M.',
    location: 'Adoor',
    service: 'AC Repair',
    rating: 4,
    date: '2023-12-25',
    text: 'Good service for our window AC. Took a bit longer than expected but the repair quality is good. Fair pricing and genuine parts used.',
    serviceDetails: 'Window AC gas leak repair'
  }
];