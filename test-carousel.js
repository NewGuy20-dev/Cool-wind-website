const puppeteer = require('puppeteer');
const { createWorker } = require('tesseract.js');

async function testCarousel() {
  console.log('🚀 Starting Carousel Test with OCR...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to false to see the browser
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => {
    console.log('🌐 PAGE LOG:', msg.text());
  });
  
  try {
    console.log('📍 Navigating to localhost...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for the carousel to load
    console.log('⏳ Waiting for carousel to load...');
    await page.waitForSelector('[data-testid="testimonial-carousel"], .testimonial-carousel, div:has(> div:contains("TESTIMONIAL"))', { timeout: 10000 });
    
    // Take initial screenshot
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: 'carousel-initial.png', fullPage: false });
    
    // Initialize OCR worker
    console.log('👁️ Initializing OCR...');
    const worker = await createWorker('eng');
    
    // Function to extract text from a screenshot
    async function extractTextFromScreen() {
      const screenshot = await page.screenshot({ encoding: 'base64' });
      const { data: { text } } = await worker.recognize(Buffer.from(screenshot, 'base64'));
      return text;
    }
    
    // Get initial text
    console.log('🔍 Reading initial testimonial text...');
    const initialText = await extractTextFromScreen();
    console.log('📝 Initial OCR Text:', initialText.substring(0, 200) + '...');
    
    // Look for the debug counter
    const debugCounterMatch = initialText.match(/TESTIMONIAL\s+(\d+)\s+of\s+(\d+)/i);
    if (debugCounterMatch) {
      console.log('✅ Found debug counter:', debugCounterMatch[0]);
      console.log('📊 Initial slide:', debugCounterMatch[1], 'of', debugCounterMatch[2]);
    } else {
      console.log('❌ Debug counter not found in OCR text');
    }
    
    // Look for testimonial numbering in content
    const testimonialMatch = initialText.match(/TESTIMONIAL\s+#(\d+):/i);
    if (testimonialMatch) {
      console.log('✅ Found testimonial numbering:', testimonialMatch[0]);
    } else {
      console.log('❌ Testimonial numbering not found in OCR text');
    }
    
    // Find navigation buttons
    console.log('🔍 Looking for navigation buttons...');
    
    // Try multiple selectors for the next button
    const nextButtonSelectors = [
      'button[aria-label="Next testimonial"]',
      'button:has(svg):last-of-type',
      '.absolute.right-2',
      '.absolute.right-4',
      'button:contains("❯")',
      'button[class*="right"]'
    ];
    
    let nextButton = null;
    for (const selector of nextButtonSelectors) {
      try {
        nextButton = await page.$(selector);
        if (nextButton) {
          console.log('✅ Found next button with selector:', selector);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!nextButton) {
      // Try to find any button on the right side of the page
      const buttons = await page.$$('button');
      console.log(`🔍 Found ${buttons.length} buttons on page`);
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const box = await button.boundingBox();
        if (box && box.x > 600) { // Assuming buttons on the right side
          console.log(`✅ Found potential next button at position x:${box.x}, y:${box.y}`);
          nextButton = button;
          break;
        }
      }
    }
    
    if (nextButton) {
      console.log('🎯 Next button found! Testing click...');
      
      // Highlight the button for visual confirmation
      await page.evaluate((btn) => {
        btn.style.border = '5px solid red';
        btn.style.backgroundColor = 'yellow';
      }, nextButton);
      
      await page.screenshot({ path: 'carousel-button-highlighted.png' });
      
      // Click the button
      console.log('👆 Clicking next button...');
      await nextButton.click();
      
      // Wait for potential animation/transition
      await page.waitForTimeout(1000);
      
      // Take screenshot after click
      await page.screenshot({ path: 'carousel-after-click.png' });
      
      // Extract text again to see if it changed
      console.log('🔍 Reading testimonial text after click...');
      const afterClickText = await extractTextFromScreen();
      
      // Compare texts
      const afterDebugMatch = afterClickText.match(/TESTIMONIAL\s+(\d+)\s+of\s+(\d+)/i);
      const afterTestimonialMatch = afterClickText.match(/TESTIMONIAL\s+#(\d+):/i);
      
      if (afterDebugMatch) {
        console.log('📊 After click slide:', afterDebugMatch[1], 'of', afterDebugMatch[2]);
        
        if (debugCounterMatch && afterDebugMatch[1] !== debugCounterMatch[1]) {
          console.log('🎉 SUCCESS: Carousel moved! Slide changed from', debugCounterMatch[1], 'to', afterDebugMatch[1]);
        } else {
          console.log('❌ FAILED: Carousel did not move. Still on slide', afterDebugMatch[1]);
        }
      }
      
      if (afterTestimonialMatch && testimonialMatch) {
        if (afterTestimonialMatch[1] !== testimonialMatch[1]) {
          console.log('🎉 SUCCESS: Testimonial content changed from #', testimonialMatch[1], 'to #', afterTestimonialMatch[1]);
        } else {
          console.log('❌ FAILED: Testimonial content did not change. Still showing #', afterTestimonialMatch[1]);
        }
      }
      
      // Test auto-scroll by waiting
      console.log('⏰ Testing auto-scroll (waiting 10 seconds)...');
      await page.waitForTimeout(10000);
      
      await page.screenshot({ path: 'carousel-after-autoscroll.png' });
      const autoScrollText = await extractTextFromScreen();
      const autoScrollMatch = autoScrollText.match(/TESTIMONIAL\s+(\d+)\s+of\s+(\d+)/i);
      
      if (autoScrollMatch && afterDebugMatch && autoScrollMatch[1] !== afterDebugMatch[1]) {
        console.log('🎉 SUCCESS: Auto-scroll working! Moved from slide', afterDebugMatch[1], 'to', autoScrollMatch[1]);
      } else {
        console.log('❌ Auto-scroll may not be working or paused');
      }
      
    } else {
      console.log('❌ CRITICAL: No next button found!');
      
      // Take a screenshot of the entire page to debug
      await page.screenshot({ path: 'carousel-debug-no-button.png', fullPage: true });
      
      // Get page HTML around carousel area
      const carouselHTML = await page.evaluate(() => {
        const carousel = document.querySelector('div[class*="testimonial"], div[class*="carousel"], div:has([class*="testimonial"])');
        return carousel ? carousel.outerHTML.substring(0, 1000) + '...' : 'Carousel not found';
      });
      console.log('🔍 Carousel HTML:', carouselHTML);
    }
    
    // Clean up OCR worker
    await worker.terminate();
    
    // Test dot indicators if they exist
    console.log('🔍 Testing dot indicators...');
    const indicators = await page.$$('button[class*="rounded-full"]');
    console.log(`Found ${indicators.length} potential dot indicators`);
    
    if (indicators.length > 1) {
      console.log('👆 Clicking second dot indicator...');
      await indicators[1].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'carousel-dot-click.png' });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'carousel-error.png', fullPage: true });
  } finally {
    console.log('🏁 Test completed. Check the screenshots for visual verification.');
    console.log('📸 Screenshots saved:');
    console.log('  - carousel-initial.png');
    console.log('  - carousel-button-highlighted.png');
    console.log('  - carousel-after-click.png');
    console.log('  - carousel-after-autoscroll.png');
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
    await browser.close();
  }
}

// Run the test
testCarousel().catch(console.error);