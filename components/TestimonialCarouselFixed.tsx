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

  // Debug logging
  console.log('🎠 Carousel rendered:', { 
    totalTestimonials: testimonials?.length, 
    currentIndex, 
    currentTestimonial: testimonials?.[currentIndex]?.name 
  });

  // Track currentIndex changes
  useEffect(() => {
    console.log('🔄 currentIndex CHANGED to:', currentIndex);
  }, [currentIndex]);

  // Simple navigation functions
  const goToNext = () => {
    console.log('🔴 NEXT BUTTON FUNCTION CALLED!');
    console.log('➡️ Current state:', { currentIndex, testimonialsLength: testimonials.length });
    const newIndex = (currentIndex + 1) % testimonials.length;
    console.log(`🔴 CHANGING INDEX FROM ${currentIndex} TO ${newIndex}`);
    setCurrentIndex(newIndex);
    console.log('🔴 setCurrentIndex called with:', newIndex);
  };

  const goToPrevious = () => {
    console.log('🔴 PREVIOUS BUTTON FUNCTION CALLED!');
    console.log('⬅️ Current state:', { currentIndex, testimonialsLength: testimonials.length });
    const newIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    console.log(`🔴 CHANGING INDEX FROM ${currentIndex} TO ${newIndex}`);
    setCurrentIndex(newIndex);
    console.log('🔴 setCurrentIndex called with:', newIndex);
  };

  const goToSlide = (index: number) => {
    console.log(`🔴 DOT INDICATOR FUNCTION CALLED for slide ${index}!`);
    console.log('🎯 Current state:', { currentIndex, targetIndex: index });
    setCurrentIndex(index);
    console.log('🔴 setCurrentIndex called with:', index);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isHovered && testimonials && testimonials.length > 1) {
      console.log('⏰ Setting up auto-scroll interval for', testimonials.length, 'testimonials');
      const interval = setInterval(() => {
        console.log('⏰ Auto-scroll triggered - moving from index', currentIndex);
        setCurrentIndex(prev => {
          const nextIndex = (prev + 1) % testimonials.length;
          console.log('⏰ Moving to index', nextIndex);
          return nextIndex;
        });
      }, autoScrollInterval);
      
      return () => {
        console.log('🛑 Clearing auto-scroll interval');
        clearInterval(interval);
      };
    } else {
      console.log('⏸️ Auto-scroll disabled:', { isHovered, testimonialsLength: testimonials?.length });
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
        console.log('🐭 Mouse entered - pausing auto-scroll');
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log('🐭 Mouse left - resuming auto-scroll');
        setIsHovered(false);
      }}
    >
      {/* VERY OBVIOUS Debug info */}
      <div className="absolute top-2 left-2 bg-red-600 text-white text-lg font-bold px-4 py-2 rounded-lg z-50 shadow-lg border-2 border-white">
        TESTIMONIAL {currentIndex + 1} of {testimonials.length}
      </div>

      {/* Main testimonial card with animation */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`testimonial-${currentIndex}`}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white rounded-xl shadow-xl overflow-hidden min-h-[350px] border-4 border-blue-500"
          style={{ 
            backgroundColor: currentIndex % 2 === 0 ? '#f8fafc' : '#f1f5f9'
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
        </motion.div>
      </AnimatePresence>

      {/* VERY OBVIOUS Navigation arrows */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔴 PREVIOUS BUTTON CLICKED!');
          goToPrevious();
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-white transition-all duration-200 cursor-pointer transform"
        type="button"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-8 h-8" />
      </motion.button>

      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔴 NEXT BUTTON CLICKED!');
          goToNext();
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-white transition-all duration-200 cursor-pointer transform"
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
                console.log(`🔴 INDICATOR ${index + 1} CLICKED!`);
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
            </motion.button>
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