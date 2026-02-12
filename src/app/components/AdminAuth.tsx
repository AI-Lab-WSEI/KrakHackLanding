import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Lock, LogOut, Eye, EyeOff } from 'lucide-react';

interface AdminAuthProps {
  children: ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'MakaPaka2026';

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('admin_session_v1_active');
    const authExpiry = localStorage.getItem('admin_session_v1_expiry');

    console.log('[AdminAuth] Checking session:', { authStatus, authExpiry });

    if (authStatus === 'true' && authExpiry) {
      const expiryDate = new Date(authExpiry);
      if (new Date() < expiryDate) {
        setIsAuthenticated(true);
      } else {
        // Authentication expired
        localStorage.removeItem('admin_session_v1_active');
        localStorage.removeItem('admin_session_v1_expiry');
      }
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);

      // Set authentication to expire in 24 hours
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);

      localStorage.setItem('admin_session_v1_active', 'true');
      localStorage.setItem('admin_session_v1_expiry', expiryDate.toISOString());

      setPassword('');
    } else {
      setError('Nieprawidłowe hasło');
      setPassword('');

      // Add shake animation on error
      const form = document.getElementById('admin-form');
      if (form) {
        form.classList.add('animate-pulse');
        setTimeout(() => form.classList.remove('animate-pulse'), 500);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session_v1_active');
    localStorage.removeItem('admin_session_v1_expiry');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground">Sprawdzanie uprawnień...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Lock className="w-8 h-8 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
              >
                Panel Administracyjny
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mt-2"
              >
                Wymagane jest uwierzytelnienie
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              id="admin-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Hasło dostępu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all pr-12"
                    placeholder="Wprowadź hasło"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Zaloguj się
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Admin Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/60 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Panel Administracyjny
              </h1>
            </div>

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-destructive border border-border/50 hover:border-destructive/30 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Admin Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="container mx-auto px-6 py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}