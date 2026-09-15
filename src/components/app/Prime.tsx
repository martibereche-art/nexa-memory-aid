import {Link} from '@tanstack/react-router';
import {Crown} from 'lucide-react';
import {usePrime} from '@/lib/prime/usePrime';
import {usePrimeWords} from '@/lib/prime/words';
export function PrimeBadge(){const q=usePrime();const w=usePrimeWords();return <Link to="/app/prime" className="inline-flex items-center gap-2 text-sm font-semibold text-feature-amber"><Crown className="h-4 w-4"/>{q.data?.active && q.data.subscription?.plan==='yearly'?w.yearBadge:w.prime}</Link>;}
