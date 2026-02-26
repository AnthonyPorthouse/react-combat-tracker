import { Dexie, type EntityTable } from 'dexie';
import type { Category } from './stores/categories';
import type { Creature } from './stores/creature';

export const db = new Dexie('combatTracker') as Dexie & {
    categories: EntityTable<Category, 'id'>;
    creatures: EntityTable<Creature, 'id'>;
}

// --- Schema Version History ---
// When changing the schema, increment the version and add an upgrade() block.
// Never modify a past version — always add a new one. See:
// https://dexie.org/docs/Tutorial/Design#database-versioning
//
// v1: Initial schema — categories and creatures
db.version(1).stores({
    categories: 'id, name',
    creatures: 'id, name, initiativeType, initiative, *categoryIds',
});

// v2: Add hp field to creatures (not indexed — no schema string change needed)
db.version(2).stores({
    categories: 'id, name',
    creatures: 'id, name, initiativeType, initiative, *categoryIds',
}).upgrade(tx => {
    return tx.table('creatures').toCollection().modify(creature => {
        if (creature.hp === undefined) {
            creature.hp = 0;
        }
    });
});

