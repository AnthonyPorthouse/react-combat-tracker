import { useState } from 'react';
import { BaseModal } from '../modals/BaseModal';
import type { Creature } from '../../db/stores/creature';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface ConfirmAddCreaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatures: Creature[];
  onConfirm: (items: { creature: Creature; quantity: number }[]) => void;
}

interface ConfirmItem {
  creature: Creature;
  quantity: number;
}

export function ConfirmAddCreaturesModal({
  isOpen,
  onClose,
  creatures,
  onConfirm,
}: ConfirmAddCreaturesModalProps) {
  const [items, setItems] = useState<ConfirmItem[]>(() =>
    creatures.map((creature) => ({ creature, quantity: 1 }))
  );

  const updateQuantity = (creatureId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.creature.id === creatureId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const handleRemove = (creatureId: string) => {
    setItems((prev) => prev.filter((item) => item.creature.id !== creatureId));
  };

  const handleConfirm = () => {
    if (items.length === 0) return;
    onConfirm(items);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Add to Combat"
      className="max-w-3xl"
      actions={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={items.length === 0}
            className={`px-4 py-2 rounded-md font-medium transition ${
              items.length > 0
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add to Combat
          </button>
        </div>
      }
    >
      {items.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
          No creatures selected. Return to the library to choose creatures.
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.creature.id}
              className="flex items-center justify-between gap-4 border border-gray-200 rounded-md p-3"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {item.creature.name}
                </p>
                <p className="text-xs text-gray-500">
                  Init: {item.creature.initiative} ({item.creature.initiativeType})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.creature.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  aria-label={`Decrease ${item.creature.name} quantity`}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.creature.id, Number(e.target.value) || 1)
                  }
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                />
                <button
                  type="button"
                  onClick={() => updateQuantity(item.creature.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  aria-label={`Increase ${item.creature.name} quantity`}
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.creature.id)}
                  className="px-2 py-1 text-red-600 hover:text-red-700 text-sm"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </BaseModal>
  );
}
