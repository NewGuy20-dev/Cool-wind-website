'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { SparePart, PartsResponse } from '@/lib/spare-parts/types';
import { CATEGORIES } from '@/lib/spare-parts/constants';

function SparePartsContent() {
  const searchParams = useSearchParams();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters from URL
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  useEffect(() => {
    fetchParts();
  }, [category, search, page]);

  async function fetchParts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Spare Parts Catalog
          </h1>
          <p className="text-xl text-gray-600">
            Genuine AC & Refrigerator Parts | Bulk Discounts Available
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => window.location.href = '/spare-parts'}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              !category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Parts
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => window.location.href = `/spare-parts?category=${cat.id}`}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                category === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search parts by name, code, or brand..."
            defaultValue={search || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;
                window.location.href = value
                  ? `/spare-parts?search=${value}`
                  : '/spare-parts';
              }
            }}
            className="w-full px-6 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading parts...</p>
          </div>
        )}

        {/* Parts Grid */}
        {!loading && parts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {parts.map((part) => (
                <div
                  key={part.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                  onClick={() => window.location.href = `/spare-parts/${part.slug}`}
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-200 relative">
                    <img
                      src={part.primary_image_url || '/images/spare-parts/placeholder-part.jpg'}
                      alt={part.name}
                      className="w-full h-full object-cover"
                    />
                    {part.stock_quantity <= part.low_stock_threshold && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Low Stock
                      </span>
                    )}
                    {part.is_genuine && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✓ Genuine
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {part.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{part.brand}</p>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{part.price.toLocaleString()}
                      </div>
                      {part.bulk_price && (
                        <div className="text-sm text-green-600">
                          Bulk: ₹{part.bulk_price.toLocaleString()} ({part.bulk_min_quantity}+ units)
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="text-sm">
                      {part.stock_quantity > 0 ? (
                        <span className="text-green-600">✓ In Stock ({part.stock_quantity})</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>

                    {/* Warranty */}
                    {part.warranty_months && (
                      <div className="text-xs text-gray-500 mt-2">
                        {part.warranty_months} months warranty
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && parts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No parts found</p>
            <button
              onClick={() => window.location.href = '/spare-parts'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Parts
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Finding a Part?</h2>
          <p className="mb-6">Our team is here to help you find the right spare part</p>
          <div className="flex gap-4 justify-center">
            <a
              href="tel:+918547229991"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100"
            >
              📞 Call Us
            </a>
            <a
              href="https://wa.me/918547229991"
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SparePartsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SparePartsContent />
    </Suspense>
  );
}
