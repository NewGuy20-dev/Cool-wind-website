'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export interface Testimonial {
  text: string;
  name: string;
  role?: string;
  rating?: number;
}

interface SimpleTestimonialCarouselProps {
  testimonials: Testimonial[];
  autoScrollInterval?: number;
  showRating?: boolean;
  showIndicators?: boolean;
}

const SimpleTestimonialCarousel: React.FC<SimpleTestimonialCarouselProps> = ({
  testimonials,
  autoScrollInterval = 8000,
  showRating = true,
  showIndicators = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Debug logging
  console.log('SimpleTestimonialCarousel:', {
    testimonials: testimonials.length,
    currentIndex,
    currentTestimonial: testimonials[currentIndex]
  });

  // Handle empty testimonials
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">No testimonials available.</p>
      </div>
    );
  }

  // Navigation functions
  const goToNext = () => {
    console.log('Going to next testimonial');
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    console.log('Going to previous testimonial');
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    console.log('Going to slide', index);
    setCurrentIndex(index);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isHovered && testimonials.length > 1) {
      const interval = setInterval(goToNext, autoScrollInterval);
      return () => clearInterval(interval);
    }
  }, [isHovered, autoScrollInterval, testimonials.length]);

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Debug info */}
      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-30">
        {currentIndex + 1}/{testimonials.length}
      </div>

      {/* Main testimonial card */}
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden min-h-[300px]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
        
        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Rating */}
          {showRating && currentTestimonial.rating && (
            <div className="flex justify-center">
              {renderStars(currentTestimonial.rating)}
            </div>
          )}

          {/* Testimonial text */}
          <blockquote className="text-center mb-8">
            <p className="text-xl text-gray-800 leading-relaxed font-medium">
              "[{currentIndex + 1}] {currentTestimonial.text}"
            </p>
          </blockquote>

          {/* Author information */}
          <div className="text-center">
            <p className="font-semibold text-lg text-gray-900">
              {currentTestimonial.name}
            </p>
            {currentTestimonial.role && (
              <p className="text-sm text-gray-600 mt-1">
                {currentTestimonial.role}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={(e) => {
          e.preventDefault();
          console.log('Previous button clicked!');
          goToPrevious();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 cursor-pointer"
        type="button"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          console.log('Next button clicked!');
          goToNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 cursor-pointer"
        type="button"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      {showIndicators && testimonials.length > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                console.log(`Indicator ${index} clicked!`);
                goToSlide(index);
              }}
              type="button"
              className={`w-3 h-3 rounded-full transition-all duration-200 cursor-pointer ${
                index === currentIndex
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleTestimonialCarousel;