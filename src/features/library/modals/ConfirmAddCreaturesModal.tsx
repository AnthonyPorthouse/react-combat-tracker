import { useMemo, useState } from 'react';
import { BaseModal } from '../../../components/modals/BaseModal';
import type { Creature } from '../../../db/stores/creature';
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

/**
 * Second step of the library-to-combat flow: adjust quantities before adding.
 *
 * After the DM selects creatures in the library browser, this modal lets them
 * specify how many of each creature to spawn. This is essential for encounter
 * design — a DM typically wants 4 Goblins and 1 Hobgoblin, not just "these
 * three creature types".
 *
 * Creatures can be removed from the list in this step without going back to
 * the selection step, providing a lightweight way to reconsider the selection
 * without losing the rest of the choices.
 *
 * State is reset on close (via `handleClose`) so reopening the modal starts
 * fresh rather than showing the previous session's adjustments.
 */
export function ConfirmAddCreaturesModal({
  isOpen,
  onClose,
  creatures,
  onConfirm,
}: ConfirmAddCreaturesModalProps) {
  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, number>>({});
  const [removedCreatureIds, setRemovedCreatureIds] = useState<string[]>([]);

  const items = useMemo<ConfirmItem[]>(() => {
    return creatures
      .filter((creature) => !removedCreatureIds.includes(creature.id))
      .map((creature) => ({
        creature,
        quantity: Math.max(1, quantityOverrides[creature.id] ?? 1),
      }));
  }, [creatures, quantityOverrides, removedCreatureIds]);

  /**
   * Resets both quantity overrides and removed creature ids back to defaults.
   * Called on modal close so the modal starts fresh if reopened.
   */
  const resetItems = () => {
    setQuantityOverrides({});
    setRemovedCreatureIds([]);
  };

  /**
   * Updates the spawn quantity for a specific creature.
   *
   * `Math.max(1, ...)` enforces a minimum of 1 so the DM can't accidentally
   * set a quantity to 0 (which would silently add nothing). Quantities are
   * stored in a separate `quantityOverrides` map rather than mutating the
   * `creatures` prop, preserving the original template data.
   */
  const updateQuantity = (creatureId: string, quantity: number) => {
    setQuantityOverrides((prev) => ({
      ...prev,
      [creatureId]: Math.max(1, quantity),
    }));
  };

  /**
   * Marks a creature as removed from this confirm session.
   *
   * Rather than splicing the `creatures` prop (which is owned by the parent),
   * removals are tracked in a local `removedCreatureIds` set and filtered out
   * in the `items` memo. This avoids prop mutation and keeps the parent's
   * selection intact in case the user navigates back.
   */
  const handleRemove = (creatureId: string) => {
    setRemovedCreatureIds((prev) =>
      prev.includes(creatureId) ? prev : [...prev, creatureId]
    );
  };

  /** Forwards the current item list to the parent. No-ops if the list is empty. */
  const handleConfirm = () => {
    if (items.length === 0) return;
    onConfirm(items);
  };

  const handleClose = () => {
    resetItems();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirm Add to Combat"
      className="max-w-3xl"
      actions={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
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
