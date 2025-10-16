'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { SparePart } from '@/lib/spare-parts/types';
import { formatPrice, calculatePrice, getStockInfo } from '@/lib/spare-parts/utils';

export default function PartDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [part, setPart] = useState<SparePart | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchPart();
  }, [slug]);

  async function fetchPart() {
    try {
      // First get all parts to find by slug
      const response = await fetch('/api/spare-parts?limit=100');
      const data = await response.json();
      const foundPart = data.parts.find((p: SparePart) => p.slug === slug);
      
      if (foundPart) {
        setPart(foundPart);
      }
    } catch (error) {
      console.error('Error fetching part:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Part Not Found</h1>
          <a href="/spare-parts" className="text-blue-600 hover:underline">
            ← Back to Catalog
          </a>
        </div>
      </div>
    );
  }

  const stockInfo = getStockInfo(part);
  const totalPrice = calculatePrice(part, quantity);
  const isBulkPrice = part.bulk_price && quantity >= part.bulk_min_quantity;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <a href="/spare-parts" className="hover:text-blue-600">Spare Parts</a>
          <span className="mx-2">›</span>
          <span>{part.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <img
                src={part.primary_image_url || '/images/spare-parts/placeholder-part.jpg'}
                alt={part.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{part.name}</h1>
            
            {/* Badges */}
            <div className="flex gap-2 mb-6">
              {part.is_genuine && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ Genuine Part
                </span>
              )}
              {part.warranty_months && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {part.warranty_months} Months Warranty
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                stockInfo.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                stockInfo.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {stockInfo.message}
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatPrice(part.price)}
              </div>
              {part.bulk_price && (
                <div className="text-lg text-green-600">
                  Bulk Price: {formatPrice(part.bulk_price)} ({part.bulk_min_quantity}+ units)
                  <span className="text-sm text-gray-600 ml-2">
                    Save {Math.round(((part.price - part.bulk_price) / part.price) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              {isBulkPrice && (
                <p className="text-sm text-green-600 mt-2">
                  🎉 Bulk discount applied!
                </p>
              )}
            </div>

            {/* Total */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mb-8">
              <a
                href={`https://wa.me/918547229991?text=${encodeURIComponent(`Hi! I'd like to order:\n${part.name}\nQuantity: ${quantity}\nTotal: ${formatPrice(totalPrice)}`)}`}
                className="block w-full px-6 py-4 bg-green-500 text-white text-center rounded-lg font-medium hover:bg-green-600 transition"
              >
                💬 Order via WhatsApp
              </a>
              <a
                href="tel:+918547229991"
                className="block w-full px-6 py-4 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition"
              >
                📞 Call to Order
              </a>
            </div>

            {/* Description */}
            {part.description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-gray-700">{part.description}</p>
              </div>
            )}

            {/* Specifications */}
            {part.specifications && Object.keys(part.specifications).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Specifications</h2>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  {Object.entries(part.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="text-gray-700">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compatible Models */}
            {part.appliance_models && part.appliance_models.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">Compatible Models</h2>
                <div className="flex flex-wrap gap-2">
                  {part.appliance_models.map((model, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
