import { clearGuestData, readAllGuestData } from "./local-store";
import type { DataStore, InsertRow, Row, TableName } from "./types";

function strip<T extends TableName>(row: Row<T>): InsertRow<T> {
  const { id: _id, user_id: _u, created_at: _c, updated_at: _up, ...rest } = row as Record<string, unknown>;
  return rest as InsertRow<T>;
}

/** Moves every guest record from this device into the signed-in user's cloud account. */
export async function migrateGuestData(store: DataStore): Promise<number> {
  const data = readAllGuestData();
  let moved = 0;

  const saved = await store.insertMany("saved_items", data.saved_items.map(strip));
  moved += saved.length;

  const listMap = new Map<string, string>();
  for (const list of data.packing_lists) {
    const created = await store.insert("packing_lists", strip(list));
    listMap.set(list.id, created.id);
    moved++;
  }
  const packingItems = data.packing_items
    .filter((i) => listMap.has(i.list_id))
    .map((i) => ({ ...strip(i), list_id: listMap.get(i.list_id)! }) as InsertRow<"packing_items">);
  moved += (await store.insertMany("packing_items", packingItems)).length;

  moved += (await store.insertMany("waiting_items", data.waiting_items.map(strip))).length;

  const shopMap = new Map<string, string>();
  for (const list of data.shopping_lists) {
    const created = await store.insert("shopping_lists", strip(list));
    shopMap.set(list.id, created.id);
    moved++;
  }
  const shoppingItems = data.shopping_items
    .filter((i) => shopMap.has(i.list_id))
    .map((i) => ({ ...strip(i), list_id: shopMap.get(i.list_id)! }) as InsertRow<"shopping_items">);
  moved += (await store.insertMany("shopping_items", shoppingItems)).length;

  moved += (await store.insertMany("tasks", data.tasks.map(strip))).length;
  moved += (await store.insertMany("notes", data.notes.map(strip))).length;

  clearGuestData();
  return moved;
}
