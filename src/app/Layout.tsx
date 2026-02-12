import { Outlet } from 'react-router';
import { Header } from '@/app/components/Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 pt-16">
        <Outlet />
      </div>
    </div>
  );
}
