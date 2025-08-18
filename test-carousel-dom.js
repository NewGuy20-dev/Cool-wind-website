const puppeteer = require('puppeteer');

async function testCarouselDOM() {
  console.log('🚀 Starting DOM-based Carousel Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log('🌐 PAGE:', msg.text());
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for React to load
    await page.waitForTimeout(2000);
    
    console.log('🔍 Analyzing carousel DOM structure...');
    
    // Inject test script into page
    const testResults = await page.evaluate(() => {
      const results = {
        carouselFound: false,
        debugCounter: null,
        testimonialText: null,
        nextButton: null,
        prevButton: null,
        indicators: [],
        clickTest: null,
        stateTest: null
      };
      
      // Find carousel container
      const carousel = document.querySelector('[class*="testimonial"], [class*="carousel"]') || 
                      document.querySelector('div:has(div[class*="bg-red"])') ||
                      Array.from(document.querySelectorAll('div')).find(div => 
                        div.textContent.includes('TESTIMONIAL') && div.textContent.includes('of')
                      );
      
      if (carousel) {
        results.carouselFound = true;
        console.log('✅ Carousel container found');
        
        // Find debug counter
        const debugEl = carousel.querySelector('[class*="bg-red"], [class*="absolute"][class*="top"]') ||
                       Array.from(carousel.querySelectorAll('div')).find(div => 
                         div.textContent.match(/TESTIMONIAL\s+\d+\s+of\s+\d+/i)
                       );
        
        if (debugEl) {
          results.debugCounter = debugEl.textContent;
          console.log('✅ Debug counter found:', results.debugCounter);
        }
        
        // Find testimonial text
        const testimonialEl = Array.from(carousel.querySelectorAll('p, div')).find(el => 
          el.textContent.includes('TESTIMONIAL #')
        );
        
        if (testimonialEl) {
          results.testimonialText = testimonialEl.textContent.substring(0, 100);
          console.log('✅ Testimonial text found:', results.testimonialText);
        }
        
        // Find navigation buttons
        const buttons = carousel.querySelectorAll('button');
        console.log(`🔍 Found ${buttons.length} buttons in carousel`);
        
        buttons.forEach((btn, i) => {
          const rect = btn.getBoundingClientRect();
          const isRight = rect.left > window.innerWidth / 2;
          const isLeft = rect.left < window.innerWidth / 2;
          const hasChevron = btn.innerHTML.includes('ChevronRight') || btn.innerHTML.includes('ChevronLeft');
          
          console.log(`Button ${i}: x=${rect.left.toFixed(0)}, y=${rect.top.toFixed(0)}, right=${isRight}, chevron=${hasChevron}`);
          
          if (isRight && (hasChevron || btn.getAttribute('aria-label')?.includes('Next'))) {
            results.nextButton = {
              index: i,
              position: { x: rect.left, y: rect.top },
              ariaLabel: btn.getAttribute('aria-label'),
              className: btn.className,
              innerHTML: btn.innerHTML.substring(0, 100)
            };
          }
          
          if (isLeft && (hasChevron || btn.getAttribute('aria-label')?.includes('Previous'))) {
            results.prevButton = {
              index: i,
              position: { x: rect.left, y: rect.top },
              ariaLabel: btn.getAttribute('aria-label'),
              className: btn.className
            };
          }
        });
        
        // Find indicators
        const indicatorBtns = carousel.querySelectorAll('button[class*="rounded-full"]');
        results.indicators = Array.from(indicatorBtns).map((btn, i) => ({
          index: i,
          className: btn.className,
          textContent: btn.textContent
        }));
        
        // Test click functionality
        if (results.nextButton) {
          console.log('🧪 Testing next button click...');
          const nextBtn = buttons[results.nextButton.index];
          
          // Store initial state
          const initialDebug = debugEl?.textContent || 'not found';
          const initialTestimonial = testimonialEl?.textContent || 'not found';
          
          // Add click event listener to monitor
          let clickDetected = false;
          nextBtn.addEventListener('click', () => {
            clickDetected = true;
            console.log('🎯 Click event detected on next button!');
          });
          
          // Simulate click
          nextBtn.click();
          
          // Wait a moment for React to update
          setTimeout(() => {
            const newDebug = debugEl?.textContent || 'not found';
            const newTestimonial = testimonialEl?.textContent || 'not found';
            
            results.clickTest = {
              clickDetected,
              initialDebug,
              newDebug,
              initialTestimonial: initialTestimonial.substring(0, 50),
              newTestimonial: newTestimonial.substring(0, 50),
              stateChanged: initialDebug !== newDebug || initialTestimonial !== newTestimonial
            };
            
            console.log('📊 Click test results:', results.clickTest);
          }, 500);
        }
      } else {
        console.log('❌ Carousel container not found');
      }
      
      return results;
    });
    
    // Wait for click test to complete
    await page.waitForTimeout(1000);
    
    console.log('\n📋 TEST RESULTS SUMMARY:');
    console.log('=========================');
    console.log('Carousel Found:', testResults.carouselFound);
    console.log('Debug Counter:', testResults.debugCounter);
    console.log('Testimonial Text:', testResults.testimonialText?.substring(0, 50) + '...');
    console.log('Next Button Found:', !!testResults.nextButton);
    console.log('Previous Button Found:', !!testResults.prevButton);
    console.log('Indicators Found:', testResults.indicators.length);
    
    if (testResults.nextButton) {
      console.log('\n🎯 NEXT BUTTON DETAILS:');
      console.log('Position:', testResults.nextButton.position);
      console.log('ARIA Label:', testResults.nextButton.ariaLabel);
      console.log('Class:', testResults.nextButton.className);
    }
    
    // Take a screenshot with button locations marked
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, i) => {
        const rect = btn.getBoundingClientRect();
        if (rect.left > window.innerWidth / 2) {
          btn.style.outline = '3px solid red';
          btn.style.outlineOffset = '2px';
          
          // Add label
          const label = document.createElement('div');
          label.textContent = `NEXT-${i}`;
          label.style.position = 'absolute';
          label.style.top = rect.top - 20 + 'px';
          label.style.left = rect.left + 'px';
          label.style.background = 'red';
          label.style.color = 'white';
          label.style.padding = '2px 4px';
          label.style.fontSize = '10px';
          label.style.zIndex = '9999';
          document.body.appendChild(label);
        }
      });
    });
    
    await page.screenshot({ path: 'carousel-dom-analysis.png', fullPage: true });
    
    // Manual click test
    console.log('\n👆 Performing manual click test...');
    if (testResults.nextButton) {
      const nextButtonSelector = `button:nth-of-type(${testResults.nextButton.index + 1})`;
      await page.click(nextButtonSelector);
      console.log('✅ Manual click executed');
      
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'carousel-after-manual-click.png' });
    }
    
  } catch (error) {
    console.error('❌ DOM Test failed:', error);
    await page.screenshot({ path: 'carousel-dom-error.png', fullPage: true });
  } finally {
    console.log('\n🏁 DOM test completed. Browser staying open for inspection...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

testCarouselDOM().catch(console.error);