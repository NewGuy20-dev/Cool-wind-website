/**
 * Schema Validation Script
 * Validates that all product/service pages have proper structured data
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = {
  Product: ['@context', '@type', 'name', 'description', 'brand', 'offers', 'aggregateRating', 'review'],
  Service: ['@context', '@type', 'name', 'description', 'provider', 'offers', 'aggregateRating', 'review']
};

function validateSchema(schema, type) {
  const errors = [];
  const requiredFields = REQUIRED_FIELDS[type];

  if (!requiredFields) {
    errors.push(`Unknown schema type: ${type}`);
    return errors;
  }

  // Check required fields
  requiredFields.forEach(field => {
    if (!schema[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate offers
  if (schema.offers) {
    if (!schema.offers['@type']) {
      errors.push('Offers missing @type');
    }
    if (!schema.offers.priceCurrency) {
      errors.push('Offers missing priceCurrency');
    }
    if (!schema.offers.availability) {
      errors.push('Offers missing availability');
    }
  }

  // Validate aggregateRating
  if (schema.aggregateRating) {
    if (!schema.aggregateRating.ratingValue) {
      errors.push('AggregateRating missing ratingValue');
    }
    if (!schema.aggregateRating.reviewCount) {
      errors.push('AggregateRating missing reviewCount');
    }
  }

  // Validate reviews
  if (schema.review) {
    if (!Array.isArray(schema.review) || schema.review.length === 0) {
      errors.push('Review must be a non-empty array');
    } else {
      schema.review.forEach((review, index) => {
        if (!review.reviewRating || !review.reviewRating.ratingValue) {
          errors.push(`Review ${index + 1} missing rating`);
        }
        if (!review.reviewBody) {
          errors.push(`Review ${index + 1} missing reviewBody`);
        }
        if (!review.author || !review.author.name) {
          errors.push(`Review ${index + 1} missing author name`);
        }
      });
    }
  }

  return errors;
}

function extractSchemaFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for generateServiceSchema or generateProductSchema calls
    const serviceMatch = content.match(/generateServiceSchema\({[\s\S]*?}\)/);
    const productMatch = content.match(/generateProductSchema\({[\s\S]*?}\)/);
    
    if (serviceMatch || productMatch) {
      return {
        found: true,
        type: serviceMatch ? 'Service' : 'Product',
        file: filePath
      };
    }
    
    return { found: false, file: filePath };
  } catch (error) {
    return { found: false, error: error.message, file: filePath };
  }
}

function main() {
  console.log('🔍 Validating Product/Service Schema Implementation\n');
  console.log('=' .repeat(60));
  
  const filesToCheck = [
    'app/services/page.tsx',
    'app/services/ac-repair/page.tsx',
    'app/services/refrigerator-repair/page.tsx',
    'app/services/spare-parts/page.tsx'
  ];

  let totalFiles = 0;
  let filesWithSchema = 0;
  let errors = [];

  filesToCheck.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${file}`);
      errors.push(`File not found: ${file}`);
      return;
    }

    totalFiles++;
    const result = extractSchemaFromFile(fullPath);
    
    if (result.found) {
      filesWithSchema++;
      console.log(`✅ ${file}`);
      console.log(`   Type: ${result.type} schema detected`);
    } else if (result.error) {
      console.log(`❌ ${file}`);
      console.log(`   Error: ${result.error}`);
      errors.push(`${file}: ${result.error}`);
    } else {
      console.log(`⚠️  ${file}`);
      console.log(`   Warning: No schema detected`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   Total files checked: ${totalFiles}`);
  console.log(`   Files with schema: ${filesWithSchema}`);
  console.log(`   Files missing schema: ${totalFiles - filesWithSchema}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors found: ${errors.length}`);
    errors.forEach(error => console.log(`   - ${error}`));
    process.exit(1);
  } else {
    console.log(`\n✅ All files have proper schema implementation!`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Build the project: npm run build`);
    console.log(`   2. Deploy to production`);
    console.log(`   3. Test with Google Rich Results Test:`);
    console.log(`      https://search.google.com/test/rich-results`);
    console.log(`   4. Request re-indexing in Google Search Console`);
    console.log(`   5. Monitor for errors after 7 days\n`);
  }
}

main();
