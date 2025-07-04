'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const USER_TYPES = [
  {
    key: 'diy',
    label: 'Doe-het-zelver (DIY)',
    icon: (
      <span className="inline-block mr-2">🔨</span>
    ),
    description: 'Voor particulieren en hobbyklussers'
  },
  {
    key: 'pro',
    label: 'Pro / Bedrijf / Projectteam',
    icon: (
      <span className="inline-block mr-2">🏢</span>
    ),
    description: "Voor zzp'ers, bedrijven en teams"
  }
];

const SUBSCRIPTION_PLANS = {
  diy: [
    {
      key: 'starter',
      name: 'Starter',
      price: '€0',
      period: 'Gratis',
      description: 'Perfect voor je eerste project',
      features: [
        '1 project tegelijk',
        'Materiaallijst + checklist',
        'Basis stappenplannen',
        'AI-tips light'
      ],
      popular: false
    },
    {
      key: 'plus',
      name: 'Plus',
      price: '€4,99',
      period: '/maand',
      description: 'Voor fanatieke zelfklussers',
      features: [
        'Onbeperkt aantal projecten',
        'AI-klusassistent',
        'Persoonlijke stappenplannen',
        'Downloadbare checklists en project-PDF\'s',
        'Toegang tot premium how-to\'s en video\'s'
      ],
      popular: true
    }
  ],
  pro: [
    {
      key: 'basic',
      name: 'Pro Basic',
      price: '€14,99',
      period: '/maand',
      description: 'Voor startende zzp\'ers',
      features: [
        'Onbeperkte projecten',
        'Materiaalbeheer',
        'Werkbon exports (PDF/Excel)',
        'Taken toewijzen aan medewerkers (max 2)',
        'Planning per klant',
        'AI-hulp bij stappen en inschattingen'
      ],
      popular: false
    },
    {
      key: 'team',
      name: 'Pro Team',
      price: '€29,99',
      period: '/maand',
      description: 'Voor teams tot 5 personen',
      features: [
        'Alles van Pro Basic',
        'Teambeheer + werkverdeling',
        'Rapportages (uren, materialen, voortgang)',
        'Klantendossiers',
        'Toegang tot AI-kluscoördinator',
        'Koppeling met boekhoudpakket (optioneel)'
      ],
      popular: true
    }
  ]
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState('choose'); // 'choose' | 'subscription' | 'form'
  const [userType, setUserType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChoose = (type) => {
    setUserType(type);
    setStep('subscription');
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep('form');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (form.password !== form.confirm) {
      setError('Wachtwoorden komen niet overeen.');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (form.password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters bevatten.');
      setIsLoading(false);
      return;
    }

    try {
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            user_type: userType,
            subscription_plan: selectedPlan.key
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        // Success - redirect to appropriate dashboard
        router.push('/dashboard-diy');
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-2">
      <div className="w-full sm:max-w-sm sm:rounded-2xl sm:shadow-lg sm:border sm:border-gray-100 sm:bg-white sm:px-8 sm:py-10 sm:mx-auto">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-3xl font-bold text-black mb-4">🛠️ Fixio</h1>
        </div>

        {step === 'choose' && (
          <>
            <h2 className="text-xl font-semibold text-black text-center mb-6">Kies je type gebruiker</h2>
            <div className="space-y-4 mb-8">
              {USER_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => handleChoose(type.key)}
                  className="w-full flex items-center justify-start px-5 py-4 sm:px-4 sm:py-3 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 text-base sm:text-sm font-semibold text-black transition-all duration-200 shadow-sm"
                >
                  {type.icon}
                  <span>{type.label}</span>
                  <span className="ml-auto text-xs text-gray-400 font-normal">{type.description}</span>
                </button>
              ))}
            </div>
            <div className="text-center text-base sm:text-sm text-gray-500">
              Heb je al een account?{' '}
              <Link href="/login" className="text-purple-600 hover:underline font-medium">
                Inloggen
              </Link>
            </div>
          </>
        )}

        {step === 'subscription' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setStep('choose')}
                className="text-purple-600 hover:underline text-sm"
              >
                ← Terug
              </button>
              <h2 className="text-xl font-semibold text-black text-center">Kies je abonnement</h2>
              <div className="w-12"></div>
            </div>
            
            <div className="space-y-4 mb-8">
              {SUBSCRIPTION_PLANS[userType].map((plan) => (
                <button
                  key={plan.key}
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full p-6 border rounded-2xl text-left transition-all duration-200 ${
                    plan.popular 
                      ? 'border-purple-500 bg-purple-50 shadow-md' 
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-gray-500 text-sm">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{plan.price}</div>
                      <div className="text-gray-500 text-sm">{plan.period}</div>
                    </div>
                  </div>
                  
                  {plan.popular && (
                    <div className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded-full mb-3">
                      Meest gekozen
                    </div>
                  )}
                  
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 text-xs text-gray-400">
                    14 dagen gratis proefperiode
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center text-sm text-gray-500">
              Je kunt altijd later upgraden of downgraden
            </div>
          </>
        )}

        {step === 'form' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setStep('subscription')}
                className="text-purple-600 hover:underline text-sm"
              >
                ← Terug
              </button>
              <h2 className="text-xl font-semibold text-black text-center">Account aanmaken</h2>
              <div className="w-12"></div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Gekozen plan:</div>
              <div className="font-semibold">{selectedPlan.name} - {selectedPlan.price}{selectedPlan.period}</div>
            </div>
            
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Naam"
                  className="w-full px-5 py-4 sm:px-4 sm:py-3 text-base sm:text-sm border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-200 transition-colors bg-gray-50 placeholder-gray-400 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-5 py-4 sm:px-4 sm:py-3 text-base sm:text-sm border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-200 transition-colors bg-gray-50 placeholder-gray-400 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Wachtwoord"
                  className="w-full px-5 py-4 sm:px-4 sm:py-3 text-base sm:text-sm border border-gray-100 rounded-2xl focus:outline-none focus:border-gray-200 transition-colors bg-gray-50 placeholder-gray-400 text-black"
                  required
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Bevestig wachtwoord"
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
                disabled={isLoading}
                className="w-full py-4 sm:py-3 bg-black text-white text-base sm:text-sm font-semibold rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Bezig...' : 'Account aanmaken'}
              </button>
            </form>
            <div className="text-center text-base sm:text-sm text-gray-500">
              Heb je al een account?{' '}
              <Link href="/login" className="text-purple-600 hover:underline font-medium">
                Inloggen
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 