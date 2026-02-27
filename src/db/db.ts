import { Dexie, type EntityTable } from 'dexie';
import type { Category } from './stores/categories';
import type { Creature } from './stores/creature';
import { DEFAULT_CATEGORIES } from './seeds/categories';

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

/**
 * Seeds the default creature-type categories the first time the database is
 * created on a device.
 *
 * Dexie fires `populate` exactly once — immediately after the initial schema
 * is applied — so this handler runs only for brand-new installations. Users
 * who already have data are never affected. Returning the Promise ensures
 * Dexie awaits the bulk write before resolving the `open()` call, preventing
 * any component from reading an empty categories table during the same tick.
 */
db.on('populate', () => {
    return db.categories.bulkAdd(DEFAULT_CATEGORIES);
});

