'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import ImageUpload from './ImageUpload';
import type { SparePart, CreatePartData } from '@/lib/spare-parts/types';

// Form schema
const productFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255),
  part_code: z.string().max(100).optional(),
  category: z.enum(['ac', 'refrigerator']),
  sub_category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  appliance_models: z.string().optional(), // Comma-separated string
  price: z.number().positive('Price must be positive'),
  bulk_price: z.number().positive().optional(),
  bulk_min_quantity: z.number().int().positive().optional(),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  low_stock_threshold: z.number().int().positive(),
  is_available: z.boolean(),
  primary_image_url: z.string().url().optional(),
  image_gallery: z.array(z.string().url()).optional(),
  description: z.string().optional(),
  specifications: z.string().optional(), // JSON string
  warranty_months: z.number().int().positive().optional(),
  is_genuine: z.boolean(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  meta_description: z.string().max(160, 'Meta description must be 160 characters or less').optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: SparePart;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 1, name: 'Basic Info', fields: ['name', 'part_code', 'category', 'sub_category', 'brand', 'appliance_models'] },
  { id: 2, name: 'Pricing', fields: ['price', 'bulk_price', 'bulk_min_quantity'] },
  { id: 3, name: 'Stock', fields: ['stock_quantity', 'low_stock_threshold', 'is_available'] },
  { id: 4, name: 'Images', fields: ['primary_image_url', 'image_gallery'] },
  { id: 5, name: 'Details', fields: ['description', 'specifications', 'warranty_months', 'is_genuine'] },
  { id: 6, name: 'SEO', fields: ['slug', 'meta_description'] },
];

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
      name: product.name,
      part_code: product.part_code || '',
      category: product.category,
      sub_category: product.sub_category || '',
      brand: product.brand || '',
      appliance_models: product.appliance_models?.join(', ') || '',
      price: product.price,
      bulk_price: product.bulk_price || undefined,
      bulk_min_quantity: product.bulk_min_quantity || 5,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      is_available: product.is_available,
      description: product.description || '',
      specifications: JSON.stringify(product.specifications || {}),
      warranty_months: product.warranty_months || undefined,
      is_genuine: product.is_genuine,
      slug: product.slug,
      meta_description: product.meta_description || '',
    } : {
      category: 'ac',
      price: 0,
      bulk_min_quantity: 5,
      stock_quantity: 0,
      low_stock_threshold: 5,
      is_available: true,
      is_genuine: true,
      slug: '',
    },
  });

  // Initialize image URLs
  useEffect(() => {
    if (product) {
      const urls = [
        product.primary_image_url,
        ...(product.image_gallery || []),
      ].filter(Boolean) as string[];
      setImageUrls(urls);
    }
  }, [product]);

  // Auto-generate slug from name
  const name = watch('name');
  useEffect(() => {
    if (name && !product) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setValue('slug', slug);
    }
  }, [name, product, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);

    try {
      // Parse appliance models
      const applianceModels = data.appliance_models
        ? data.appliance_models.split(',').map(m => m.trim()).filter(Boolean)
        : [];

      // Parse specifications
      let specifications = {};
      if (data.specifications) {
        try {
          specifications = JSON.parse(data.specifications);
        } catch {
          alert('Invalid JSON in specifications field');
          setSubmitting(false);
          return;
        }
      }

      // Prepare payload
      const payload: any = {
        ...data,
        appliance_models: applianceModels,
        specifications,
        primary_image_url: imageUrls[0] || null,
        image_gallery: imageUrls.slice(1),
      };

      // Remove empty optional fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === undefined) {
          delete payload[key];
        }
      });

      // API call
      const url = product
        ? `/api/spare-parts/${product.id}`
        : '/api/spare-parts';
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save product');
      }

      alert(product ? 'Product updated successfully!' : 'Product created successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(error.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const category = watch('category');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-2 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      currentStep > step.id
                        ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white shadow-md scale-105'
                        : currentStep === step.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg scale-110'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-3 rounded-full transition-all duration-300 ${
                      currentStep > step.id ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="e.g., AC Compressor LG 1.5 Ton"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-2 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Part Code
                </label>
                <input
                  type="text"
                  {...register('part_code')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="e.g., LG-COMP-1.5T"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  >
                    <option value="ac">AC</option>
                    <option value="refrigerator">Refrigerator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Category
                  </label>
                  <input
                    type="text"
                    {...register('sub_category')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="e.g., compressors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  {...register('brand')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="e.g., LG, Samsung, Whirlpool"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compatible Models
                </label>
                <input
                  type="text"
                  {...register('appliance_models')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="Comma-separated: LG Split AC 1.5 Ton, LG Window AC 1.5 Ton"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple models with commas
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="8500.00"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bulk Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('bulk_price', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="7500.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Discounted price for bulk orders
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bulk Min Quantity
                  </label>
                  <input
                    type="number"
                    {...register('bulk_min_quantity', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum quantity for bulk pricing
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Stock */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    {...register('stock_quantity', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="12"
                  />
                  {errors.stock_quantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.stock_quantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold *
                  </label>
                  <input
                    type="number"
                    {...register('low_stock_threshold', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when stock falls below this number
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_available')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Product is available for sale
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Images */}
          {currentStep === 4 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Images
              </label>
              <ImageUpload
                value={imageUrls}
                onChange={setImageUrls}
                maxImages={5}
                category={category}
                partId={product?.id}
              />
            </div>
          )}

          {/* Step 5: Details */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="Detailed product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications (JSON)
                </label>
                <textarea
                  {...register('specifications')}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder='{"power": "1.5 ton", "voltage": "220V", "refrigerant": "R32"}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter specifications as JSON object
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty (months)
                  </label>
                  <input
                    type="number"
                    {...register('warranty_months', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="12"
                  />
                </div>

                <div className="flex items-center mt-7">
                  <input
                    type="checkbox"
                    {...register('is_genuine')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Genuine part
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: SEO */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  {...register('slug')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="ac-compressor-lg-1-5-ton"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  {...register('meta_description')}
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="SEO-friendly description for search engines..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 160 characters
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm hover:shadow"
            >
              Cancel
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={submitting}
                className="flex items-center px-6 py-2.5 text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {product ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
