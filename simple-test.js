const puppeteer = require('puppeteer');

async function quickTest() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  // Check if carousel exists and get current state
  const result = await page.evaluate(() => {
    // Find the debug counter
    const debugEl = document.querySelector('div[class*="bg-red"]');
    const debugText = debugEl ? debugEl.textContent : 'Debug not found';
    
    // Find next button
    const nextBtn = document.querySelector('button[aria-label="Next testimonial"]') ||
                   Array.from(document.querySelectorAll('button')).find(btn => 
                     btn.getBoundingClientRect().left > window.innerWidth / 2
                   );
    
    return {
      debugText,
      nextButtonFound: !!nextBtn,
      nextButtonHTML: nextBtn ? nextBtn.outerHTML.substring(0, 200) : 'Not found'
    };
  });
  
  console.log('Initial state:', result);
  
  // Try clicking next button
  try {
    await page.click('button[aria-label="Next testimonial"]');
    console.log('Clicked next button');
  } catch (e) {
    console.log('Failed to click next button, trying alternative selector');
    try {
      const buttons = await page.$$('button');
      if (buttons.length > 0) {
        await buttons[buttons.length - 1].click(); // Try last button
        console.log('Clicked last button');
      }
    } catch (e2) {
      console.log('All click attempts failed');
    }
  }
  
  await page.waitForTimeout(2000);
  
  // Check state after click
  const afterClick = await page.evaluate(() => {
    const debugEl = document.querySelector('div[class*="bg-red"]');
    return debugEl ? debugEl.textContent : 'Debug not found';
  });
  
  console.log('After click:', afterClick);
  console.log('State changed:', result.debugText !== afterClick);
  
  await page.waitForTimeout(5000);
  await browser.close();
}

quickTest().catch(console.error);