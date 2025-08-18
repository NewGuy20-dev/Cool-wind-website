// Example usage of TestimonialCarousel component

import TestimonialCarousel, { Testimonial } from './TestimonialCarousel';

// Sample testimonial data
const testimonials: Testimonial[] = [
  { 
    text: "Cool Wind Services fixed my AC fast and professionally! Outstanding service quality.", 
    name: "Hari", 
    role: "Homeowner",
    rating: 5
  },
  { 
    text: "Affordable and reliable refrigerator repair. Highly recommend their expertise.", 
    name: "Priya", 
    role: "Restaurant Owner",
    rating: 5
  },
  { 
    text: "Got a great second-hand fridge, works like new! Amazing value for money.", 
    name: "Anoop", 
    role: "Small Business Owner",
    rating: 5
  }
];

// Basic usage
export function BasicTestimonialExample() {
  return (
    <TestimonialCarousel testimonials={testimonials} />
  );
}

// Advanced usage with all features
export function AdvancedTestimonialExample() {
  return (
    <TestimonialCarousel 
      testimonials={testimonials}
      autoScrollInterval={8000}        // 8 seconds auto-scroll
      showRating={true}               // Show star ratings
      showIndicators={true}           // Show dot indicators
      showProgressBar={true}          // Show progress bar
      showPlayPause={true}            // Show play/pause button
      className="my-custom-class"     // Additional CSS classes
    />
  );
}

// Minimal configuration
export function MinimalTestimonialExample() {
  return (
    <TestimonialCarousel 
      testimonials={testimonials}
      showRating={false}
      showIndicators={false}
      autoScrollInterval={5000}
    />
  );
}

// Fast carousel for short content
export function FastTestimonialExample() {
  const shortTestimonials = [
    { text: "Great service!", name: "John", rating: 5 },
    { text: "Highly recommended!", name: "Jane", rating: 5 },
    { text: "Professional work!", name: "Mike", rating: 4 }
  ];

  return (
    <TestimonialCarousel 
      testimonials={shortTestimonials}
      autoScrollInterval={3000}
      showProgressBar={true}
    />
  );
}