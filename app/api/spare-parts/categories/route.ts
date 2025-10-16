import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { CategoryInfo } from '@/lib/spare-parts/types';
import { SUB_CATEGORIES } from '@/lib/spare-parts/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/spare-parts/categories - Get categories with counts
export async function GET() {
  try {
    // Get all available parts
    const { data: parts, error } = await supabase
      .from('spare_parts')
      .select('category, sub_category')
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      );
    }

    // Count parts by category and subcategory
    const categories: CategoryInfo[] = [
      {
        id: 'ac',
        name: 'AC Parts',
        count: parts?.filter(p => p.category === 'ac').length || 0,
        subcategories: SUB_CATEGORIES.ac.map(sub => ({
          id: sub.id,
          name: sub.name,
          count: parts?.filter(p => p.category === 'ac' && p.sub_category === sub.id).length || 0,
        })),
      },
      {
        id: 'refrigerator',
        name: 'Refrigerator Parts',
        count: parts?.filter(p => p.category === 'refrigerator').length || 0,
        subcategories: SUB_CATEGORIES.refrigerator.map(sub => ({
          id: sub.id,
          name: sub.name,
          count: parts?.filter(p => p.category === 'refrigerator' && p.sub_category === sub.id).length || 0,
        })),
      },
    ];

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error in GET /api/spare-parts/categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error.message },
      { status: 500 }
    );
  }
}
