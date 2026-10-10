import { useState, useEffect } from 'react';
import { Check, Globe, Type, Eye, Volume2, Bell, Accessibility } from 'lucide-react';
import { getSettings, setSettings, resetDemoData } from '../utils/storage';

function Settings() {
  const [settings, setSettingsState] = useState(getSettings());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // getSettings() can return null the first time (cache not warmed yet) and
  // only syncs itself to localStorage in the background, so poll briefly
  // until the real data shows up instead of rendering on a null settings object.
  useEffect(() => {
    if (settings) return;
    const interval = setInterval(() => {
      const latest = getSettings();
      if (latest) {
        setSettingsState(latest);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [settings]);

  if (!settings) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-500">Loading settings…</p>
      </div>
    );
  }

  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSettingsState(updated);

    // Apply settings immediately
    if (key === 'highContrast' || key === 'fontSize') {
      window.location.reload();
    }
  };

  const handleResetDemo = () => {
    resetDemoData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  const languages = [
    'English',
    'Hindi',
    'Assamese',
    'Bengali',
    'Marathi',
    'Tamil',
    'Telugu',
    'Gujarati',
    'Kannada',
    'Malayalam',
    'Punjabi',
    'Odia',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Customize accessibility and preferences</p>
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Language</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interface Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select the primary language for activities and interactions
            </p>
          </div>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Accessibility className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Accessibility</h2>
        </div>
        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Type className="w-5 h-5 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Text Size</label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => updateSetting('fontSize', 'normal')}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-colors ${
                  settings.fontSize === 'normal'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => updateSetting('fontSize', 'large')}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-colors ${
                  settings.fontSize === 'large'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Large
              </button>
              <button
                onClick={() => updateSetting('fontSize', 'extra-large')}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-colors ${
                  settings.fontSize === 'extra-large'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Extra Large
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Increase text size for better readability
            </p>
          </div>

          {/* High Contrast Mode */}
          <div>
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">High Contrast Mode</p>
                  <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reduce Animation */}
          <div>
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Reduce Animation</p>
                  <p className="text-sm text-gray-600">Minimize motion effects</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('reduceAnimation', !settings.reduceAnimation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reduceAnimation ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reduceAnimation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification & Sound Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Notifications & Sound</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Activity Reminders</p>
                <p className="text-sm text-gray-600">Get notified about scheduled activities</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Sound Effects</p>
                <p className="text-sm text-gray-600">Play audio feedback during activities</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('sound', !settings.sound)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.sound ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.sound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Demo Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Demo Data</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-orange-900">
            This will reset all demo data including memories, timeline events, notes, and activities.
            This action cannot be undone.
          </p>
        </div>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reset Demo Data
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleResetDemo}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">About SmritiCare</h2>
        <p className="text-gray-700 mb-3">
          SmritiCare is a personalized cognitive engagement platform designed for dementia care.
          It transforms familiar memories, people, places, and experiences into meaningful activities.
        </p>
        <p className="text-sm text-gray-600">
          <strong>Version:</strong> 1.0.0 (Demo)
          <br />
          <strong>Built for:</strong> Smart India Hackathon 2024
          <br />
          <strong>Note:</strong> This platform is designed for cognitive engagement and caregiver support.
          It is not a medical diagnostic tool and does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}

function Activity({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

export default Settings;
