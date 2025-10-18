'use client';

import { useState } from 'react';
import { X, Plus, Minus, RotateCw } from 'lucide-react';
import type { SparePart } from '@/lib/spare-parts/types';

interface StockAdjustmentModalProps {
  part: SparePart;
  onClose: () => void;
  onSuccess: () => void;
}

type AdjustmentType = 'set' | 'add' | 'remove';

export default function StockAdjustmentModal({
  part,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('add');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getNewQuantity = (): number => {
    switch (adjustmentType) {
      case 'set':
        return quantity;
      case 'add':
        return part.stock_quantity + quantity;
      case 'remove':
        return Math.max(0, part.stock_quantity - quantity);
      default:
        return part.stock_quantity;
    }
  };

  const newQuantity = getNewQuantity();
  const quantityChange = newQuantity - part.stock_quantity;

  const handleSubmit = async () => {
    if (quantity <= 0 && adjustmentType !== 'set') {
      alert('Quantity must be greater than 0');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for this adjustment');
      return;
    }

    setSubmitting(true);

    try {
      // Update stock quantity
      const updateResponse = await fetch(`/api/spare-parts/${part.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
        },
        body: JSON.stringify({
          stock_quantity: newQuantity,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update stock');
      }

      // Log inventory movement
      const movementType = adjustmentType === 'add' ? 'add' : 
                          adjustmentType === 'remove' ? 'remove' : 'adjust';

      const movementResponse = await fetch('/api/spare-parts/inventory-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
        },
        body: JSON.stringify({
          part_id: part.id,
          movement_type: movementType,
          quantity_change: quantityChange,
          quantity_before: part.stock_quantity,
          quantity_after: newQuantity,
          reason,
          notes: notes || null,
          performed_by: 'admin', // TODO: Get actual admin user
        }),
      });

      if (!movementResponse.ok) {
        console.error('Failed to log movement, but stock was updated');
      }

      alert('Stock adjusted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Adjustment error:', error);
      alert(error.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Adjust Stock</h2>
            <p className="text-sm text-gray-600 mt-1">{part.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Stock */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Current Stock</div>
            <div className="text-3xl font-bold text-blue-600">{part.stock_quantity}</div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'add'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('remove')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'remove'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Minus className="w-5 h-5 mr-2" />
                Remove Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('set')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'set'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <RotateCw className="w-5 h-5 mr-2" />
                Set Exact
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {adjustmentType === 'set' ? 'New Quantity' : 'Quantity'}
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={adjustmentType === 'set' ? 'Enter exact quantity' : 'Enter quantity to adjust'}
            />
          </div>

          {/* Preview */}
          {quantity > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="font-medium">{part.stock_quantity}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Change:</span>
                <span className={`font-medium ${quantityChange > 0 ? 'text-green-600' : quantityChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {quantityChange > 0 ? '+' : ''}{quantityChange}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                <span className="text-sm font-medium text-gray-700">New Stock:</span>
                <span className="text-xl font-bold text-blue-600">{newQuantity}</span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason * <span className="text-xs text-gray-500">(Required for audit trail)</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select reason...</option>
              {adjustmentType === 'add' && (
                <>
                  <option value="restock">Restock from supplier</option>
                  <option value="return">Customer return</option>
                  <option value="found">Found in inventory</option>
                  <option value="correction">Inventory correction</option>
                </>
              )}
              {adjustmentType === 'remove' && (
                <>
                  <option value="damage">Damaged/Defective</option>
                  <option value="theft">Theft/Loss</option>
                  <option value="internal_use">Internal use</option>
                  <option value="correction">Inventory correction</option>
                </>
              )}
              {adjustmentType === 'set' && (
                <>
                  <option value="physical_count">Physical count verification</option>
                  <option value="correction">System correction</option>
                  <option value="audit">Audit adjustment</option>
                </>
              )}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional details about this adjustment..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || quantity <= 0 || !reason}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2" />
                Adjusting...
              </>
            ) : (
              'Confirm Adjustment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
