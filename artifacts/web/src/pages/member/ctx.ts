import { createContext, useContext } from 'react';
import type { NetworkMember, NetworkState } from '@workspace/api-client-react';

export interface Ctx { me: NetworkMember; base: NetworkState }
export const MeCtx = createContext<Ctx | null>(null);
export const useMe = () => { const c = useContext(MeCtx); if (!c) throw new Error('Member context missing'); return c; };
