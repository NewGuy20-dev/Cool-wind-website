'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Refrigerator, 
  Search, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  TrendingUp,
  Package,
  Zap,
  Filter,
  X
} from 'lucide-react';
import type { SparePart, PartsResponse } from '@/lib/spare-parts/types';
import { SUB_CATEGORIES } from '@/lib/spare-parts/constants';

const WHATSAPP = '918547229991';
const PHONE = '+918547229991';

function RefrigeratorSparePartsContent() {
  const searchParams = useSearchParams();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const search = searchParams.get('search');
  const subCategory = searchParams.get('subcategory');

  useEffect(() => {
    fetchParts();
  }, [search, subCategory, page]);

  async function fetchParts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('category', 'refrigerator');
      if (search) params.set('search', search);
      if (subCategory) params.set('subcategory', subCategory);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/spare-parts?${params}`);
      const data: PartsResponse = await response.json();

      setParts(data.parts);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      const params = new URLSearchParams();
      if (value) params.set('search', value);
      if (selectedSubCategory) params.set('subcategory', selectedSubCategory);
      window.location.href = `/services/refrigerator-spare-parts?${params.toString()}`;
    }
  };

  const handleSubCategoryFilter = (subCat: string | null) => {
    const params = new URLSearchParams();
    if (subCat) params.set('subcategory', subCat);
    if (searchQuery) params.set('search', searchQuery);
    window.location.href = `/services/refrigerator-spare-parts?${params.toString()}`;
  };

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const features = [
    { icon: <CheckCircle className="h-5 w-5" />, text: 'Genuine Parts Only' },
    { icon: <TrendingUp className="h-5 w-5" />, text: 'Bulk Discounts' },
    { icon: <Zap className="h-5 w-5" />, text: 'Fast Delivery' },
    { icon: <Package className="h-5 w-5" />, text: '6 Month Warranty' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 via-white to-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-50 to-primary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-100 mb-6">
              <span className="text-5xl">🧊</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 mb-4">
              Refrigerator Spare Parts
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
              Premium refrigerator spare parts for all major brands. Genuine parts with warranty and bulk discounts available.
            </p>
            
            {/* Features */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-wrap justify-center gap-6 mb-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center gap-2 text-neutral-700 bg-white px-4 py-2 rounded-full shadow-sm"
                >
                  <span className="text-secondary-600">{feature.icon}</span>
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary-100 rounded-full opacity-50 blur-3xl"></div>
      </section>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search refrigerator parts by name, code, or brand..."
              defaultValue={search || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-secondary-200 focus:border-secondary-500 focus:ring-4 focus:ring-secondary-100 transition-all outline-none text-lg"
            />
          </div>
        </motion.div>

        {/* Sub-Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-neutral-600" />
            <h3 className="font-semibold text-neutral-800">Filter by Type</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSubCategoryFilter(null)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                !subCategory
                  ? 'bg-secondary-600 text-white shadow-lg shadow-secondary-200'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
              All Parts
            </button>
            {SUB_CATEGORIES.refrigerator.map((subCat) => (
              <button
                key={subCat.id}
                onClick={() => handleSubCategoryFilter(subCat.id)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  subCategory === subCat.id
                    ? 'bg-secondary-600 text-white shadow-lg shadow-secondary-200'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                }`}
              >
                {subCat.name}
              </button>
            ))}
          </div>
          
          {/* Active Filters */}
          {(search || subCategory) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-neutral-600">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                  Search: {search}
                  <button onClick={() => handleSubCategoryFilter(null)} className="hover:bg-secondary-200 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {subCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                  Type: {SUB_CATEGORIES.refrigerator.find(s => s.id === subCategory)?.name}
                  <button onClick={() => handleSubCategoryFilter(null)} className="hover:bg-secondary-200 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-secondary-200 border-t-secondary-600"></div>
            <p className="mt-4 text-neutral-600 font-medium">Loading refrigerator parts...</p>
          </div>
        )}

        {/* Parts Grid */}
        {!loading && parts.length > 0 && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {parts.map((part) => (
                <motion.div
                  key={part.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-card hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
                  onClick={() => window.location.href = `/spare-parts/${part.slug}`}
                >
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-neutral-50 to-secondary-50 relative overflow-hidden">
                    <img
                      src={part.primary_image_url || '/images/spare-parts/placeholder-part.jpg'}
                      alt={part.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {part.stock_quantity <= part.low_stock_threshold && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Low Stock
                      </span>
                    )}
                    {part.is_genuine && (
                      <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        ✓ Genuine
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2 group-hover:text-secondary-600 transition-colors">
                      {part.name}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">{part.brand}</p>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-primary-600">
                        ₹{part.price.toLocaleString()}
                      </div>
                      {part.bulk_price && (
                        <div className="text-sm text-green-600 font-medium">
                          Bulk: ₹{part.bulk_price.toLocaleString()} ({part.bulk_min_quantity}+ units)
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="text-sm mb-2">
                      {part.stock_quantity > 0 ? (
                        <span className="text-green-600 font-medium">✓ In Stock ({part.stock_quantity})</span>
                      ) : (
                        <span className="text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>

                    {/* Warranty */}
                    {part.warranty_months && (
                      <div className="text-xs text-neutral-500 mt-2">
                        {part.warranty_months} months warranty
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white rounded-lg border-2 border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition font-medium"
                >
                  Previous
                </button>
                <span className="px-6 py-3 font-semibold text-neutral-700">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="px-6 py-3 bg-white rounded-lg border-2 border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && parts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-6">
              <Package className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-2">No parts found</h3>
            <p className="text-neutral-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => window.location.href = '/services/refrigerator-spare-parts'}
              className="px-8 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition font-medium shadow-lg"
            >
              View All Refrigerator Parts
            </button>
          </motion.div>
        )}
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-secondary-600 to-secondary-700 text-white py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Can't Find the Part You Need?
            </h2>
            <p className="text-xl text-secondary-50 mb-8">
              Our expert team is here to help you find the right refrigerator spare part. Contact us now!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={`tel:${PHONE}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-secondary-600 rounded-lg font-semibold hover:bg-secondary-50 transition-all shadow-lg hover:shadow-xl"
              >
                <Phone className="h-5 w-5" />
                Call Us Now
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi, I need help finding a refrigerator spare part`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp Us
              </a>
            </div>
            <p className="mt-6 text-secondary-100 text-sm">
              Same-day delivery available in Thiruvalla & Pathanamthitta
            </p>
          </motion.div>
        </div>
      </section>

      {/* Browse Other Categories */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-800 text-center mb-8">
            Browse Other Categories
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link
              href="/services/ac-spare-parts"
              className="bg-white rounded-xl p-8 shadow-card hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition">
                  <span className="text-3xl">❄️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-800 group-hover:text-primary-600 transition">
                    AC Parts
                  </h3>
                  <p className="text-neutral-600">Browse AC spare parts</p>
                </div>
              </div>
            </Link>
            <Link
              href="/spare-parts"
              className="bg-white rounded-xl p-8 shadow-card hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center group-hover:bg-secondary-200 transition">
                  <Package className="h-8 w-8 text-secondary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-800 group-hover:text-secondary-600 transition">
                    All Spare Parts
                  </h3>
                  <p className="text-neutral-600">View complete catalog</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function RefrigeratorSparePartsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-secondary-50 via-white to-neutral-50 py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-secondary-200 border-t-secondary-600"></div>
          <p className="mt-4 text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <RefrigeratorSparePartsContent />
    </Suspense>
  );
}
