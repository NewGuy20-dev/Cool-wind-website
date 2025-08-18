import TestimonialCarousel from '@/components/TestimonialCarousel';

const testimonials = [
  { 
    text: "Cool Wind Services fixed my AC fast and professionally! Outstanding service quality that exceeded all my expectations.", 
    name: "Hari", 
    role: "Homeowner",
    rating: 5
  },
  { 
    text: "Affordable and reliable refrigerator repair. Highly recommend their expertise and professional approach.", 
    name: "Priya", 
    role: "Restaurant Owner",
    rating: 5
  },
  { 
    text: "Got a great second-hand fridge, works like new! Amazing value for money and excellent customer service.", 
    name: "Anoop", 
    role: "Small Business Owner",
    rating: 5
  },
  {
    text: "Their washing machine repair service was quick and efficient. The technician was knowledgeable and friendly.",
    name: "Meera",
    role: "Apartment Owner",
    rating: 4
  },
  {
    text: "Excellent AC installation service. Clean work, fair pricing, and great after-sales support. Will definitely use again!",
    name: "Rajesh",
    role: "Office Manager",
    rating: 5
  }
];

export default function TestimonialDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Testimonial Carousel Demo
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          A production-ready responsive testimonial carousel component with auto-scroll, 
          navigation controls, touch support, and full accessibility features.
        </p>

        {/* Basic carousel */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
            Basic Carousel
          </h2>
          <TestimonialCarousel testimonials={testimonials} />
        </div>

        {/* Carousel with all features */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
            Full-Featured Carousel
          </h2>
          <TestimonialCarousel 
            testimonials={testimonials}
            autoScrollInterval={8000}
            showRating={true}
            showIndicators={true}
            showProgressBar={true}
            showPlayPause={true}
          />
        </div>

        {/* Fast carousel */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
            Fast Carousel (3 seconds)
          </h2>
          <TestimonialCarousel 
            testimonials={testimonials.slice(0, 3)}
            autoScrollInterval={3000}
            showProgressBar={true}
          />
        </div>

        {/* Features list */}
        <div className="max-w-4xl mx-auto mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Features Included</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Core Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✅ Responsive design (mobile-first)</li>
                <li>✅ Auto-scroll with configurable timing</li>
                <li>✅ Pause on hover</li>
                <li>✅ Smooth animations</li>
                <li>✅ Navigation arrows</li>
                <li>✅ Dot indicators</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Advanced Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✅ Touch/swipe support</li>
                <li>✅ Keyboard navigation</li>
                <li>✅ Progress bar</li>
                <li>✅ Play/pause controls</li>
                <li>✅ Star ratings</li>
                <li>✅ Full accessibility (ARIA)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}