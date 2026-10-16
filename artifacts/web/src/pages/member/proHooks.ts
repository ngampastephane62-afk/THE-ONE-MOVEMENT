import { useQueryClient } from '@tanstack/react-query';
import { useProfessionalAction, getGetProfessionalStateQueryKey, type ProfessionalActionInput } from '@workspace/api-client-react';

export function useProAct() {
  const qc = useQueryClient();
  const m = useProfessionalAction({ mutation: { onSuccess: () => {
    qc.invalidateQueries({ queryKey: getGetProfessionalStateQueryKey() });
    qc.invalidateQueries({ queryKey: ['/api/professional/business'], exact: false });
  } } });
  return { run: (data: ProfessionalActionInput) => m.mutateAsync({ data }), pending: m.isPending };
}

export function errMsg(e: unknown, fallback: string) {
  const x = e as { data?: { error?: unknown } | null } | null;
  return typeof x?.data?.error === 'string' ? x.data.error : fallback;
}

export const money = (cents: number, cur: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur.toUpperCase() }).format(cents / 100);
export const fmtDate = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
