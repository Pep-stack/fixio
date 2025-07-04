'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'password'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      // Check if user exists
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy' // We'll check if user exists by trying to sign in
      });
      
      if (error && error.message.includes('Invalid login credentials')) {
        // User exists, proceed to password step
        setStep('password');
      } else if (error) {
        setError('Er is een fout opgetreden. Probeer het opnieuw.');
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        setError('Ongeldige inloggegevens. Probeer het opnieuw.');
      } else {
        // Successful login - redirect to appropriate dashboard
        // TODO: Check user type and redirect accordingly
        router.push('/dashboard-diy');
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-2">
      <div className="w-full sm:max-w-sm sm:rounded-2xl sm:shadow-lg sm:border sm:border-gray-100 sm:bg-white sm:px-8 sm:py-10 sm:mx-auto">
        {step === 'email' ? (
          <>
            {/* Logo and welcome text */}
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-3xl font-bold text-black mb-4">🛠️ Fixio</h1>
              <p className="text-gray-500 text-base sm:text-sm">Log in bij je Fixio account</p>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSubmit} className="mb-8">
              <div className="mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email of gebruikersnaam"
                  className="w-full px-5 py-4 sm:px-4 sm:py-3 text-base sm:text-sm border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-200 transition-colors bg-gray-50 placeholder-gray-400 text-black"
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm mb-4">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-4 sm:py-3 bg-black text-white text-base sm:text-sm font-semibold rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Bezig...' : 'Doorgaan'}
              </button>
            </form>

            {/* OR divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-6 text-gray-400 text-sm font-medium">OF</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Social login options */}
            <div className="space-y-4 mb-12">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full py-4 sm:py-3 border border-gray-100 rounded-2xl text-black font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center bg-white text-base sm:text-sm"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Doorgaan met Google
              </button>
              <button
                onClick={() => handleSocialLogin('apple')}
                className="w-full py-4 sm:py-3 border border-gray-100 rounded-2xl text-black font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center bg-white text-base sm:text-sm"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                Doorgaan met Apple
              </button>
              <button
                onClick={() => handleSocialLogin('phone')}
                className="w-full py-4 sm:py-3 border border-gray-100 rounded-2xl text-black font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center bg-white text-base sm:text-sm"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Doorgaan met telefoonnummer
              </button>
            </div>

            {/* Footer links */}
            <div className="text-center space-y-6">
              <div className="text-base sm:text-sm">
                <Link href="/forgot-password" className="text-purple-600 hover:underline">
                  Wachtwoord vergeten?
                </Link>
                <span className="text-gray-400 mx-3">•</span>
                <Link href="/forgot-username" className="text-purple-600 hover:underline">
                  Gebruikersnaam vergeten?
                </Link>
              </div>
              <div className="text-base sm:text-sm text-gray-500">
                Heb je nog geen account?{' '}
                <Link href="/register" className="text-purple-600 hover:underline font-medium">
                  Registreer
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Password step */}
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-3xl font-bold text-black mb-4">🛠️ Fixio</h1>
              <h2 className="text-2xl sm:text-xl font-bold text-black mb-2 tracking-tight leading-tight">Voer je wachtwoord in</h2>
              <p className="text-gray-500 text-base sm:text-sm mb-3">{email}</p>
              <button 
                onClick={() => setStep('email')}
                className="text-purple-600 text-sm hover:underline"
              >
                Ander account gebruiken?
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="mb-12">
              <div className="mb-6">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wachtwoord"
                  className="w-full px-5 py-4 sm:px-4 sm:py-3 text-base sm:text-sm border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-200 transition-colors bg-gray-50 placeholder-gray-400 text-black"
                  required
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm mb-4">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !password}
                className="w-full py-4 sm:py-3 bg-black text-white text-base sm:text-sm font-semibold rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Bezig...' : 'Inloggen'}
              </button>
            </form>
            {/* Footer links for password step */}
            <div className="text-center space-y-6">
              <div className="text-base sm:text-sm">
                <Link href="/forgot-password" className="text-purple-600 hover:underline">
                  Wachtwoord vergeten?
                </Link>
                <span className="text-gray-400 mx-3">•</span>
                <Link href="/forgot-username" className="text-purple-600 hover:underline">
                  Gebruikersnaam vergeten?
                </Link>
              </div>
              <div className="text-base sm:text-sm text-gray-500">
                Heb je nog geen account?{' '}
                <Link href="/register" className="text-purple-600 hover:underline font-medium">
                  Registreer
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 