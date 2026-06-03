'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const config = localStorage.getItem('pdt_config');
    if (config) {
      router.replace('/dashboard');
    } else {
      router.replace('/setup');
    }
  }, [router]);

  // Splash while redirecting
  return (
    <div style={{
      minHeight: '100vh',
      background: '#070c1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>🐔</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
