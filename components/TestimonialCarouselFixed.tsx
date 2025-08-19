'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

export interface Testimonial {
  text: string;
  name: string;
  role?: string;
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoScrollInterval?: number;
  showRating?: boolean;
  showIndicators?: boolean;
  showProgressBar?: boolean;
  showPlayPause?: boolean;
  className?: string;
}

const TestimonialCarouselFixed: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  autoScrollInterval = 8000,
  showRating = true,
  showIndicators = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Debug logging removed

  // Simple navigation functions
  const goToNext = () => {
    const newIndex = (currentIndex + 1) % testimonials.length;
    setCurrentIndex(newIndex);
  };

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isHovered && testimonials && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % testimonials.length);
      }, autoScrollInterval);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isHovered, autoScrollInterval, testimonials.length]); // Fixed: only depend on length, not the whole array

  // Handle empty testimonials
  if (!testimonials || testimonials.length === 0) {
    console.log('❌ No testimonials provided');
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-500 text-lg font-bold">No testimonials available. (Debug: {testimonials?.length || 0} testimonials)</p>
      </div>
    );
  }

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center justify-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
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
      className={`relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* VERY OBVIOUS Debug info */}
      <div className="absolute top-2 left-2 bg-red-600 text-white text-lg font-bold px-4 py-2 rounded-lg z-50 shadow-lg border-2 border-white">
        TESTIMONIAL {currentIndex + 1} of {testimonials.length}
      </div>

      {/* Main testimonial card with bright border to show changes */}
      <div 
        key={`testimonial-${currentIndex}`}
        className="relative bg-white rounded-xl shadow-xl overflow-hidden min-h-[350px] border-4 border-blue-500"
        style={{ 
          backgroundColor: currentIndex % 2 === 0 ? '#f8fafc' : '#f1f5f9' // Alternate background colors
        }}
      >
        {/* Background gradient that changes per slide */}
        <div 
          className="absolute inset-0"
          style={{
            background: currentIndex % 3 === 0 
              ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
              : currentIndex % 3 === 1
              ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-12">
          {/* Quote icon */}
          <div className="flex justify-center mb-6">
            <Quote className="w-16 h-16 text-blue-600 opacity-30" />
          </div>

          {/* Rating */}
          {showRating && currentTestimonial.rating && (
            <div className="flex justify-center">
              {renderStars(currentTestimonial.rating)}
            </div>
          )}

          {/* Testimonial text with VERY OBVIOUS numbering */}
          <blockquote className="text-center mb-8">
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-900 leading-relaxed font-bold">
              "TESTIMONIAL #{currentIndex + 1}: {currentTestimonial.text}"
            </p>
          </blockquote>

          {/* Author information */}
          <div className="text-center">
            <p className="font-bold text-xl text-gray-900 mb-2">
              — {currentTestimonial.name}
            </p>
            {currentTestimonial.role && (
              <p className="text-lg text-gray-700 font-medium">
                {currentTestimonial.role}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* VERY OBVIOUS Navigation arrows */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToPrevious();
        }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-white transition-all duration-200 cursor-pointer transform hover:scale-110"
        type="button"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToNext();
        }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-white transition-all duration-200 cursor-pointer transform hover:scale-110"
        type="button"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* VERY OBVIOUS Indicators */}
      {showIndicators && testimonials.length > 1 && (
        <div className="flex justify-center mt-8 gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
              }}
              type="button"
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 cursor-pointer font-bold text-xs flex items-center justify-center ${
                index === currentIndex
                  ? 'bg-blue-600 text-white border-blue-800 scale-125 shadow-lg'
                  : 'bg-gray-300 text-gray-700 border-gray-400 hover:bg-gray-400 hover:scale-110'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Status indicator */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {isHovered ? '⏸️ Paused (hover to pause)' : '▶️ Auto-scrolling'}
        </p>
      </div>
    </div>
  );
};

export default TestimonialCarouselFixed;