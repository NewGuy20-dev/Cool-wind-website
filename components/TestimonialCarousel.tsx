'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, Play, Pause } from 'lucide-react';

// TypeScript interfaces
export interface Testimonial {
  text: string;
  name: string;
  role?: string;
  photo?: string;
  rating?: number;
}

export interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoScrollInterval?: number;
  showRating?: boolean;
  showIndicators?: boolean;
  showProgressBar?: boolean;
  showPlayPause?: boolean;
  className?: string;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  autoScrollInterval = 10000,
  showRating = true,
  showIndicators = true,
  showProgressBar = false,
  showPlayPause = false,
  className = ''
}) => {
  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [testimonials.length, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [testimonials.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning]);

  // Auto-scroll functionality
  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    setProgress(0);
    
    if (isPlaying && !isHovered) {
      intervalRef.current = setInterval(goToNext, autoScrollInterval);
      
      if (showProgressBar) {
        const progressStep = 100 / (autoScrollInterval / 100);
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              return 0;
            }
            return prev + progressStep;
          });
        }, 100);
      }
    }
  }, [goToNext, autoScrollInterval, isPlaying, isHovered, showProgressBar]);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, []);

  // Effects
  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll, stopAutoScroll]);

  useEffect(() => {
    if (isHovered || !isPlaying) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  }, [isHovered, isPlaying, startAutoScroll, stopAutoScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    const currentCarouselRef = carouselRef.current;
    if (currentCarouselRef) {
      currentCarouselRef.addEventListener('keydown', handleKeyDown);
      return () => {
        currentCarouselRef.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [goToNext, goToPrevious]);

  // Touch/swipe support
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Render star rating
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

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle empty testimonials array
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">No testimonials available.</p>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div 
      className={`relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      ref={carouselRef}
      tabIndex={0}
      role="region"
      aria-label="Customer testimonials carousel"
      aria-live="polite"
    >
      {/* Progress bar */}
      {showProgressBar && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Main testimonial card */}
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden min-h-[300px] sm:min-h-[250px]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
        
        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-12">
          {/* Quote icon */}
          <div className="flex justify-center mb-6">
            <Quote className="w-12 h-12 text-blue-500 opacity-20" />
          </div>

          {/* Testimonial content with smooth transition */}
          <div 
            className="transition-all duration-300 ease-in-out"
            style={{
              opacity: isTransitioning ? 0.7 : 1,
              transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)'
            }}
          >
            {/* Rating */}
            {showRating && currentTestimonial.rating && (
              <div className="flex justify-center">
                {renderStars(currentTestimonial.rating)}
              </div>
            )}

            {/* Testimonial text */}
            <blockquote className="text-center mb-8">
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-800 leading-relaxed font-medium">
                "{currentTestimonial.text}"
              </p>
            </blockquote>

            {/* Author information */}
            <div className="flex flex-col items-center text-center">
              {currentTestimonial.photo && (
                <img
                  src={currentTestimonial.photo}
                  alt={`${currentTestimonial.name}'s photo`}
                  className="w-16 h-16 rounded-full object-cover mb-4 border-4 border-white shadow-md"
                />
              )}
              <cite className="not-italic">
                <p className="font-semibold text-lg text-gray-900">
                  {currentTestimonial.name}
                </p>
                {currentTestimonial.role && (
                  <p className="text-sm text-gray-600 mt-1">
                    {currentTestimonial.role}
                  </p>
                )}
              </cite>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        disabled={isTransitioning}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        disabled={isTransitioning}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Play/Pause button */}
      {showPlayPause && (
        <button
          onClick={togglePlayPause}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isPlaying ? "Pause auto-scroll" : "Resume auto-scroll"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      )}

      {/* Indicators */}
      {showIndicators && testimonials.length > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                index === currentIndex
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Testimonial {currentIndex + 1} of {testimonials.length}: {currentTestimonial.text} by {currentTestimonial.name}
      </div>
    </div>
  );
};

export default TestimonialCarousel;