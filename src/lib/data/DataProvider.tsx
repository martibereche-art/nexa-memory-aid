import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/lib/i18n";
import { localStore } from "./local-store";
import { createCloudStore } from "./cloud-store";
import type { DataStore, InsertRow, Row, TableName, UpdateRow } from "./types";

interface DataContextValue {
  store: DataStore;
  scope: string;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const value = useMemo<DataContextValue>(() => {
    if (user) return { store: createCloudStore(user.id), scope: `user:${user.id}` };
    return { store: localStore, scope: "guest" };
  }, [user]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function rowsKey(scope: string, table: TableName) {
  return ["rows", scope, table] as const;
}

export function useRows<T extends TableName>(table: T, enabled = true) {
  const { store, scope } = useData();
  return useQuery({
    queryKey: rowsKey(scope, table),
    queryFn: () => store.list(table),
    enabled,
    staleTime: 30_000,
  });
}

type Optimistic<T extends TableName> = (rows: Row<T>[]) => Row<T>[];

export function useMutations<T extends TableName>(table: T) {
  const { store, scope } = useData();
  const qc = useQueryClient();
  const { t } = useI18n();
  const key = rowsKey(scope, table);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["rows", scope] });

  async function applyOptimistic(fn: Optimistic<T>) {
    await qc.cancelQueries({ queryKey: key });
    const previous = qc.getQueryData<Row<T>[]>(key);
    if (previous) qc.setQueryData<Row<T>[]>(key, fn(previous));
    return previous;
  }

  const create = useMutation({
    mutationFn: (values: InsertRow<T>) => store.insert(table, values),
    onSuccess: (row) => {
      qc.setQueryData<Row<T>[]>(key, (old) => [row, ...(old ?? [])]);
      invalidate();
    },
    onError: () => toast.error(t("common.error")),
  });

  const createMany = useMutation({
    mutationFn: (values: InsertRow<T>[]) => store.insertMany(table, values),
    onSuccess: (rows) => {
      qc.setQueryData<Row<T>[]>(key, (old) => [...rows, ...(old ?? [])]);
      invalidate();
    },
    onError: () => toast.error(t("common.error")),
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateRow<T> }) => store.update(table, id, values),
    onMutate: async ({ id, values }) =>
      applyOptimistic((rows) =>
        rows.map((r) => (r.id === id ? ({ ...r, ...values, updated_at: new Date().toISOString() } as Row<T>) : r)),
      ),
    onError: (_e, _v, previous) => {
      if (previous) qc.setQueryData(key, previous);
      toast.error(t("common.error"));
    },
    onSettled: () => invalidate(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => store.remove(table, id),
    onMutate: async (id) => applyOptimistic((rows) => rows.filter((r) => r.id !== id)),
    onError: (_e, _v, previous) => {
      if (previous) qc.setQueryData(key, previous);
      toast.error(t("common.error"));
    },
    onSettled: () => invalidate(),
  });

  const removeMany = useMutation({
    mutationFn: (ids: string[]) => store.removeMany(table, ids),
    onMutate: async (ids) => {
      const set = new Set(ids);
      return applyOptimistic((rows) => rows.filter((r) => !set.has(r.id)));
    },
    onError: (_e, _v, previous) => {
      if (previous) qc.setQueryData(key, previous);
      toast.error(t("common.error"));
    },
    onSettled: () => invalidate(),
  });

  return { create, createMany, update, remove, removeMany };
}
