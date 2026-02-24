import { Dexie, type EntityTable } from 'dexie';
import type { Category } from './stores/categories';
import type { Creature } from './stores/creature';

export const db = new Dexie('combatTracker') as Dexie & {
    categories: EntityTable<Category, 'id'>;
    creatures: EntityTable<Creature, 'id'>;
}

db.version(1).stores({
    categories: 'id, name',
    creatures: 'id, name, initiativeType, initiative, *categoryIds',
});

