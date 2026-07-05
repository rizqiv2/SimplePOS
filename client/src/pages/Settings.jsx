import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingService';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'IDR', label: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', label: 'Philippine Peso', symbol: '₱' },
  { code: 'THB', label: 'Thai Baht', symbol: '฿' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { code: 'KRW', label: 'South Korean Won', symbol: '₩' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'VND', label: 'Vietnamese Dong', symbol: '₫' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: '﷼' }
];

const LOCALES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'id-ID', label: 'Bahasa Indonesia' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'ms-MY', label: 'Bahasa Melayu' },
  { code: 'th-TH', label: 'ไทย' },
  { code: 'vi-VN', label: 'Tiếng Việt' },
  { code: 'zh-CN', label: '中文 (简体)' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'es-ES', label: 'Español' }
];

const Settings = () => {
  const [currency, setCurrency] = useState('USD');
  const [locale, setLocale] = useState('en-US');
  const [customCurrency, setCustomCurrency] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSettings();
        if (res.success) {
          const cur = res.data.currency || 'USD';
          const loc = res.data.locale || 'en-US';
          setCurrency(cur);
          setLocale(loc);
          if (!CURRENCIES.find(c => c.code === cur)) {
            setCustomCurrency(cur);
            setShowCustom(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getSymbol = (code) => {
    try {
      const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency: code });
      return fmt.format(0).replace(/[\d.,\s]/g, '').trim() || code;
    } catch {
      return code;
    }
  };

  const preview = (cur, loc) => {
    try {
      return new Intl.NumberFormat(loc, { style: 'currency', currency: cur }).format(12345.67);
    } catch {
      return 'Invalid format';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cur = showCustom && customCurrency ? customCurrency : currency;
      const res = await updateSettings({ currency: cur, locale });
      if (res.success) {
        localStorage.setItem('pos_currency', cur);
        localStorage.setItem('pos_locale', locale);
        setMessage({ type: 'success', text: 'Settings saved! Refresh the page to see changes everywhere.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure currency and regional settings</p>
      </div>

      <div className="max-w-xl">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b">
            <h2 className="font-semibold text-gray-800">Currency & Regional Format</h2>
          </div>

          <div className="px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto mb-2">
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setShowCustom(false); }}
                    className={`px-3 py-2 text-sm rounded-lg border text-left transition ${
                      !showCustom && currency === c.code
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{c.symbol}</span>
                    <span className="ml-1.5 text-xs">{c.code}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  id="customCurrency"
                  checked={showCustom}
                  onChange={e => setShowCustom(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="customCurrency" className="text-gray-600">Custom currency code</label>
              </div>
              {showCustom && (
                <input
                  type="text"
                  value={customCurrency}
                  onChange={e => setCustomCurrency(e.target.value.toUpperCase())}
                  placeholder="e.g. BTC, ETH, XRP"
                  className="mt-2 w-full max-w-xs px-3 py-2 border rounded-lg text-sm"
                  maxLength="5"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Locale</label>
              <select
                value={locale}
                onChange={e => setLocale(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border rounded-lg text-sm"
              >
                {LOCALES.map(l => (
                  <option key={l.code} value={l.code}>{l.label} ({l.code})</option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Preview</div>
              <div className="text-lg font-semibold text-gray-800">
                {showCustom && customCurrency
                  ? preview(customCurrency, locale)
                  : preview(currency, locale)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Symbol: {showCustom && customCurrency ? getSymbol(customCurrency) : getSymbol(currency)}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
            <div>
              {message && (
                <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
