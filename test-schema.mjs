// Test schema generation
import { generateProductSchema } from './lib/schema-generator.ts';

const testSchema = generateProductSchema({
  name: 'AC Spare Parts Thiruvalla',
  description: 'Test description',
  url: 'https://www.coolwind.co.in/services/spare-parts/ac',
  brand: 'Cool Wind Services',
  category: 'Air Conditioner Parts',
  price: 2500,
  priceCurrency: 'INR',
  availability: 'InStock',
  condition: 'NewCondition',
  aggregateRating: {
    ratingValue: 4.8,
    reviewCount: 200
  },
  reviews: [
    {
      rating: 5,
      reviewBody: 'Great product',
      author: 'Test User',
      datePublished: '2024-01-01'
    }
  ]
});

console.log('Generated Schema:');
console.log(JSON.stringify(testSchema, null, 2));

// Check for image field
if ('image' in testSchema) {
  console.log('\n✅ Image field EXISTS');
  console.log('Image value:', testSchema.image);
} else {
  console.log('\n❌ Image field MISSING');
}
