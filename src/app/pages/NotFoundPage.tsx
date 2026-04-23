/**
 * 404 — friendly fallback dla nieznanych tras.
 * Zast\u0119puje domy\u015bln\u0105 wiadomo\u015b\u0107 React Routera "Hey developer 👋".
 */
import { Link, useLocation } from 'react-router';
import { ArrowLeft, Home } from 'lucide-react';

export function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <p className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h1 className="text-xl font-semibold text-white mb-2">Strona nie istnieje</h1>
        <p className="text-sm text-gray-400 mb-6">
          Szukana \u015bcie\u017cka <code className="text-gray-300 bg-white/5 px-1.5 py-0.5 rounded text-xs">{pathname}</code>
          {' '}nie prowadzi do \u017cadnego widoku. Mo\u017cliwe \u017ce link jest stary, \u017ale przepisany, albo funkcjonalno\u015b\u0107 zosta\u0142a przeniesiona.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Strona g\u0142\u00f3wna
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wr\u00f3\u0107
          </button>
        </div>
      </div>
    </div>
  );
}
