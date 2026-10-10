import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Images,
  Gamepad2,
  Route,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  Eye,
  ArrowLeft,
  Languages,
  Sparkles
} from 'lucide-react';
import { getSettings, getPatient } from '../utils/storage';
import { useLanguage } from '../context/LanguageContext';
import PatientSwitcher from './PatientSwitcher';

function Layout({ onReturnHome }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const settings = getSettings();
  const patient = getPatient();
  const { lang, setLang, t } = useLanguage();

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('patientProfile'), href: '/profile', icon: User },
    { name: t('memoryLibrary'), href: '/memory-library', icon: Images },
    { name: t('activities'), href: '/activities', icon: Gamepad2 },
    { name: t('memoryFinder'), href: '/memory-finder', icon: Sparkles },
    { name: t('memoryJourney'), href: '/journey', icon: Route },
    { name: t('insights'), href: '/insights', icon: BarChart3 },
    { name: t('settings'), href: '/settings', icon: SettingsIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className={`dashboard-texture min-h-screen relative overflow-x-hidden ${settings?.highContrast ? 'high-contrast' : ''} ${settings?.fontSize === 'large' ? 'large-text' : ''}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-amber-100/80 bg-[#fbf7ed]/90 backdrop-blur-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <Link to="/dashboard" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="SMARA Logo" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-gray-900">SMARA</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left leading-none transition-all ${
                    active
                      ? 'bg-purple-100 text-purple-900 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <p className="text-xs text-gray-600">SMARA v1.0.2</p>
            <p className="mt-1 text-xs text-gray-600">Remembering Together. Caring Always.</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen relative">
        {/* Top bar */}
        <div className="sticky top-0 z-30 border-b border-amber-100/80 bg-[#fbf7ed]/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
              <button
                onClick={onReturnHome}
                className="hidden items-center gap-1.5 rounded-lg border border-stone-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-all sm:inline-flex"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('backToHome')}
              </button>
              <PatientSwitcher patient={patient} />
            </div>

            {/* Language Switcher & Actions */}
            <div className="flex shrink-0 items-center space-x-3">
              {/* Language Switcher Select */}
              <div className="flex items-center gap-1.5 bg-white/90 border border-stone-200 px-2.5 py-1.5 rounded-xl shadow-xs">
                <Languages className="w-4 h-4 text-stone-500" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="as">অসমীয়া (Assamese)</option>
                  <option value="mni">মৈতৈলোন্ (Manipuri)</option>
                </select>
              </div>

              <Link
                to="/settings"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-400 focus-visible:ring-offset-2"
                title="Accessibility Settings"
              >
                <Eye className="w-5 h-5" />
              </Link>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-400 focus-visible:ring-offset-2">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2.5 pl-3 border-l border-stone-200">
                <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">Ananya</p>
                  <p className="text-[10px] text-gray-600">{t('caregiver')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Left Botanical Floral Watermark Overlay */}
        <div className="fixed top-16 left-64 w-[420px] h-[340px] pointer-events-none opacity-30 select-none z-0 rotate-180">
          <svg
            viewBox="0 0 460 380"
            fill="none"
            stroke="#968574"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <path d="M 460 380 C 380 300, 300 230, 240 150 C 210 110, 180 80, 150 55" />
            <path d="M 240 150 C 215 125, 180 135, 170 165 C 188 182, 222 172, 240 150 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <path d="M 300 230 C 265 205, 230 215, 220 245 C 242 262, 278 252, 300 230 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <path d="M 195 100 C 170 75, 135 85, 125 115 C 142 132, 178 122, 195 100 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <path d="M 360 300 C 330 275, 295 285, 285 315 C 305 330, 340 320, 360 300 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <circle cx="150" cy="55" r="10" stroke="#968574" fill="#FBF7ED" />
            <path d="M 150 45 C 138 22, 162 22, 150 45 Z" />
            <path d="M 160 55 C 183 43, 183 67, 160 55 Z" />
            <path d="M 150 65 C 162 88, 138 88, 150 65 Z" />
            <path d="M 140 55 C 117 67, 117 43, 140 55 Z" />
            <path d="M 440 380 C 390 270, 355 190, 320 115 C 305 75, 280 40, 260 20" />
            <path d="M 355 190 C 378 168, 412 180, 422 208 C 405 225, 370 212, 355 190 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <path d="M 320 115 C 342 92, 375 105, 385 132 C 368 150, 335 138, 320 115 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <circle cx="260" cy="20" r="8" stroke="#968574" fill="#FBF7ED" />
            <circle cx="390" cy="300" r="6" stroke="#968574" fill="#FBF7ED" />
          </svg>
        </div>

        {/* Page content */}
        <main className="w-full flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 relative z-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Bottom-Right Botanical Floral Watermark Overlay */}
        <div className="fixed bottom-0 right-0 w-[460px] h-[380px] pointer-events-none opacity-40 select-none z-0">
          <svg
            viewBox="0 0 460 380"
            fill="none"
            stroke="#968574"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <path d="M 460 380 C 380 300, 300 230, 240 150 C 210 110, 180 80, 150 55" />
            <path d="M 240 150 C 215 125, 180 135, 170 165 C 188 182, 222 172, 240 150 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <path d="M 300 230 C 265 205, 230 215, 220 245 C 242 262, 278 252, 300 230 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <path d="M 195 100 C 170 75, 135 85, 125 115 C 142 132, 178 122, 195 100 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <path d="M 360 300 C 330 275, 295 285, 285 315 C 305 330, 340 320, 360 300 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <circle cx="150" cy="55" r="10" stroke="#968574" fill="#FBF7ED" />
            <path d="M 150 45 C 138 22, 162 22, 150 45 Z" />
            <path d="M 160 55 C 183 43, 183 67, 160 55 Z" />
            <path d="M 150 65 C 162 88, 138 88, 150 65 Z" />
            <path d="M 140 55 C 117 67, 117 43, 140 55 Z" />
            <path d="M 440 380 C 390 270, 355 190, 320 115 C 305 75, 280 40, 260 20" />
            <path d="M 355 190 C 378 168, 412 180, 422 208 C 405 225, 370 212, 355 190 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <path d="M 320 115 C 342 92, 375 105, 385 132 C 368 150, 335 138, 320 115 Z" fill="#F4EFE6" fillOpacity="0.5" />
            <circle cx="260" cy="20" r="8" stroke="#968574" fill="#FBF7ED" />
            <path d="M 260 12 C 250 -4, 270 -4, 260 12 Z" />
            <path d="M 268 20 C 284 10, 284 30, 268 20 Z" />
            <path d="M 260 28 C 270 44, 250 44, 260 28 Z" />
            <path d="M 252 20 C 236 30, 236 10, 252 20 Z" />
            <circle cx="390" cy="300" r="6" stroke="#968574" fill="#FBF7ED" />
            <circle cx="295" cy="70" r="5" stroke="#968574" fill="#FBF7ED" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Layout;