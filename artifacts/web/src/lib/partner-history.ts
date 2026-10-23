export { partnerHistory, type HistoryCategory, type HistoryPartner } from '@workspace/shared/partner-directory';
export const historyLogo = (id: number) => `${import.meta.env.BASE_URL}api/documentary/media/archive-partner-${String(id).padStart(2, '0')}.webp`;
