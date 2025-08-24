'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
  }, [isHovered, autoScrollInterval, testimonials]);

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
                ? 'fill-secondary-400 text-secondary-400'
                : 'text-neutral-300'
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
      {/* Debug overlay removed */}

      {/* Main testimonial card with animation */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`testimonial-${currentIndex}`}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-neutral-50 rounded-xl shadow-xl overflow-hidden min-h-[350px] border-4 border-primary-500"
          style={{ 
            backgroundColor: currentIndex % 2 === 0 ? '#F3F5F3' : '#B1D6E4'
          }}
        >
          {/* Background gradient that changes per slide */}
          <div 
            className="absolute inset-0"
            style={{
              background: currentIndex % 3 === 0 
                ? 'linear-gradient(135deg, #e9f3f8 0%, #b1d6e4 100%)'
                : currentIndex % 3 === 1
                ? 'linear-gradient(135deg, #fbfcea 0%, #eaebac 100%)'
                : 'linear-gradient(135deg, #f3f5f3 0%, #b1d6e4 100%)'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8 lg:p-12">
            {/* Quote icon */}
            <div className="flex justify-center mb-6">
              <Quote className="w-16 h-16 text-primary-600 opacity-30" />
            </div>

            {/* Rating */}
            {showRating && currentTestimonial.rating && (
              <div className="flex justify-center">
                {renderStars(currentTestimonial.rating)}
              </div>
            )}

            {/* Testimonial text with VERY OBVIOUS numbering */}
            <blockquote className="text-center mb-8">
              <p className="text-xl sm:text-2xl lg:text-3xl text-neutral-900 leading-relaxed font-bold">
                "TESTIMONIAL #{currentIndex + 1}: {currentTestimonial.text}"
              </p>
            </blockquote>

            {/* Author information */}
            <div className="text-center">
              <p className="font-bold text-xl text-neutral-900 mb-2">
                — {currentTestimonial.name}
              </p>
              {currentTestimonial.role && (
                <p className="text-lg text-neutral-700 font-medium">
                  {currentTestimonial.role}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* VERY OBVIOUS Navigation arrows */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToPrevious();
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-16 h-16 bg-secondary-600 hover:bg-secondary-700 rounded-full shadow-xl border-4 border-neutral-50 flex items-center justify-center text-neutral-900 transition-all duration-200 cursor-pointer transform"
        type="button"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-8 h-8" />
      </motion.button>

      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToNext();
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-16 h-16 bg-primary-600 hover:bg-primary-700 rounded-full shadow-xl border-4 border-neutral-50 flex items-center justify-center text-white transition-all duration-200 cursor-pointer transform"
        type="button"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-8 h-8" />
      </motion.button>

      {/* VERY OBVIOUS Indicators */}
      {showIndicators && testimonials.length > 1 && (
        <div className="flex justify-center mt-8 gap-3">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
              }}
              type="button"
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 cursor-pointer font-bold text-xs flex items-center justify-center ${
                index === currentIndex
                  ? 'bg-primary-600 text-white border-primary-800 scale-125 shadow-lg'
                  : 'bg-neutral-300 text-neutral-700 border-neutral-400 hover:bg-neutral-400 hover:scale-110'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>
      )}

      {/* Status indicator */}
      <div className="text-center mt-4">
        <p className="text-sm text-neutral-600">
          {isHovered ? '⏸️ Paused (hover to pause)' : '▶️ Auto-scrolling'}
        </p>
      </div>
    </div>
  );
};

export default TestimonialCarouselFixed;