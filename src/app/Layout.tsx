import { Outlet, useLocation } from 'react-router';
import { Header } from '@/app/components/Header';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <ScrollToTop />
      <Header />
      <div className="flex-1 pt-16">
        <Outlet />
      </div>
    </div>
  );
}
