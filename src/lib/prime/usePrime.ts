import {useQuery} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {useAuth} from '@/lib/auth/AuthProvider';
import {getPrime} from './access.functions';
export function usePrime(){const {user}=useAuth();const fn=useServerFn(getPrime);return useQuery({queryKey:['prime',user?.id],queryFn:()=>fn(),enabled:!!user,staleTime:0,refetchInterval:30000});}
