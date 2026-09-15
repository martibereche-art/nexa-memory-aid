import {useEffect} from 'react';
import {useAuth} from '@/lib/auth/AuthProvider';
import {usePrime} from '@/lib/prime/usePrime';
export function useBackground(){const {profile}=useAuth();const prime=usePrime();
 useEffect(()=>{const id=prime.data?.active&&profile?.background?profile.background:'nexa';document.documentElement.dataset['bg']=id;return()=>{document.documentElement.dataset['bg']='nexa';};},[prime.data?.active,profile?.background]);}
