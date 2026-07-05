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

const ORDER_TYPE_PRESETS = ['Dine-in', 'Takeaway', 'Delivery', 'Pickup', 'Curbside'];

const Settings = () => {
  const [currency, setCurrency] = useState('USD');
  const [locale, setLocale] = useState('en-US');
  const [taxRate, setTaxRate] = useState('8');
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(false);
  const [serviceChargeRate, setServiceChargeRate] = useState('5');
  const [roundingMode, setRoundingMode] = useState('none');
  const [defaultPayment, setDefaultPayment] = useState('cash');
  const [receiptAutoPrint, setReceiptAutoPrint] = useState(false);
  const [cashierHidePrices, setCashierHidePrices] = useState(false);
  const [cashierHideStock, setCashierHideStock] = useState(false);
  const [orderTypes, setOrderTypes] = useState(['Dine-in', 'Takeaway', 'Delivery']);
  const [storeName, setStoreName] = useState('My Store');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for your purchase!');
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
          const d = res.data;
          setCurrency(d.currency || 'USD');
          setLocale(d.locale || 'en-US');
          setTaxRate(d.tax_rate || '8');
          setTaxInclusive(d.tax_inclusive === 'true');
          setServiceChargeEnabled(d.service_charge_enabled === 'true');
          setServiceChargeRate(d.service_charge_rate || '5');
          setRoundingMode(d.rounding_mode || 'none');
          setDefaultPayment(d.default_payment || 'cash');
          setReceiptAutoPrint(d.receipt_auto_print === 'true');
          setCashierHidePrices(d.cashier_hide_prices === 'true');
          setCashierHideStock(d.cashier_hide_stock === 'true');
          setStoreName(d.store_name || 'My Store');
          setStoreAddress(d.store_address || '');
          setStorePhone(d.store_phone || '');
          setReceiptFooter(d.receipt_footer || 'Thank you for your purchase!');
          try { setOrderTypes(JSON.parse(d.order_types || '["Dine-in","Takeaway","Delivery"]')); } catch { setOrderTypes(['Dine-in', 'Takeaway', 'Delivery']); }
          if (!CURRENCIES.find(c => c.code === d.currency)) {
            setCustomCurrency(d.currency);
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
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(0).replace(/[\d.,\s]/g, '').trim() || code; }
    catch { return code; }
  };

  const preview = (cur, loc) => {
    try { return new Intl.NumberFormat(loc, { style: 'currency', currency: cur }).format(12345.67); }
    catch { return 'Invalid format'; }
  };

  const toggleOrderType = (ot) => {
    setOrderTypes(prev => prev.includes(ot) ? prev.filter(t => t !== ot) : [...prev, ot]);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cur = showCustom && customCurrency ? customCurrency : currency;
      const res = await updateSettings({
        currency: cur,
        locale,
        tax_rate: taxRate,
        tax_inclusive: taxInclusive ? 'true' : 'false',
        service_charge_enabled: serviceChargeEnabled ? 'true' : 'false',
        service_charge_rate: serviceChargeRate,
        rounding_mode: roundingMode,
        default_payment: defaultPayment,
        receipt_auto_print: receiptAutoPrint ? 'true' : 'false',
        cashier_hide_prices: cashierHidePrices ? 'true' : 'false',
        cashier_hide_stock: cashierHideStock ? 'true' : 'false',
        order_types: JSON.stringify(orderTypes),
        store_name: storeName,
        store_address: storeAddress,
        store_phone: storePhone,
        receipt_footer: receiptFooter
      });
      if (res.success) {
        localStorage.setItem('pos_currency', cur);
        localStorage.setItem('pos_locale', locale);
        localStorage.setItem('pos_tax_rate', taxRate);
        localStorage.setItem('pos_tax_inclusive', taxInclusive);
        localStorage.setItem('pos_service_charge_enabled', serviceChargeEnabled);
        localStorage.setItem('pos_service_charge_rate', serviceChargeRate);
        localStorage.setItem('pos_rounding_mode', roundingMode);
        localStorage.setItem('pos_default_payment', defaultPayment);
        localStorage.setItem('pos_receipt_auto_print', receiptAutoPrint);
        localStorage.setItem('pos_cashier_hide_prices', cashierHidePrices);
        localStorage.setItem('pos_cashier_hide_stock', cashierHideStock);
        localStorage.setItem('pos_order_types', JSON.stringify(orderTypes));
        localStorage.setItem('pos_store_name', storeName);
        localStorage.setItem('pos_store_address', storeAddress);
        localStorage.setItem('pos_store_phone', storePhone);
        localStorage.setItem('pos_receipt_footer', receiptFooter);
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

  const sectionClass = 'bg-white rounded-lg shadow';
  const sectionHeaderClass = 'px-6 py-4 border-b';
  const sectionBodyClass = 'px-6 py-5 space-y-5';
  const sectionFooterClass = 'px-6 py-4 border-t bg-gray-50 rounded-b-lg flex items-center justify-between';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass = 'w-full max-w-md px-3 py-2 border rounded-lg text-sm';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure store information, tax, POS behavior, and regional settings</p>
      </div>

      <div className={sectionClass}>
        <div className={sectionHeaderClass}><h2 className="font-semibold text-gray-800">Store Information</h2></div>
        <div className={sectionBodyClass}>
          <div><label className={labelClass}>Store Name</label><input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Address</label><input type="text" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className={inputClass} placeholder="123 Main St, City" /></div>
          <div><label className={labelClass}>Phone</label><input type="text" value={storePhone} onChange={e => setStorePhone(e.target.value)} className={inputClass} placeholder="+1-555-1234" /></div>
          <div><label className={labelClass}>Receipt Footer Message</label><input type="text" value={receiptFooter} onChange={e => setReceiptFooter(e.target.value)} className={inputClass} /></div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className={sectionHeaderClass}><h2 className="font-semibold text-gray-800">Tax & Fees</h2></div>
        <div className={sectionBodyClass}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Tax Rate (%)</label><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} min="0" max="100" step="0.1" className={inputClass} /></div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={taxInclusive} onChange={e => setTaxInclusive(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Tax Inclusive (prices include tax)</span>
              </label>
            </div>
          </div>
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={serviceChargeEnabled} onChange={e => setServiceChargeEnabled(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-gray-700">Enable Service Charge</span>
            </label>
            {serviceChargeEnabled && (
              <div><label className={labelClass}>Service Charge Rate (%)</label><input type="number" value={serviceChargeRate} onChange={e => setServiceChargeRate(e.target.value)} min="0" max="100" step="0.1" className={inputClass} /></div>
            )}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className={sectionHeaderClass}><h2 className="font-semibold text-gray-800">POS Behavior</h2></div>
        <div className={sectionBodyClass}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Rounding Mode</label>
              <select value={roundingMode} onChange={e => setRoundingMode(e.target.value)} className={inputClass}>
                <option value="none">No Rounding</option>
                <option value="nearest_005">Nearest $0.05</option>
                <option value="nearest_010">Nearest $0.10</option>
                <option value="nearest_int">Nearest Whole Number</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Default Payment Method</label>
              <select value={defaultPayment} onChange={e => setDefaultPayment(e.target.value)} className={inputClass}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={receiptAutoPrint} onChange={e => setReceiptAutoPrint(e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">Auto-print receipt after sale</span>
            </label>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className={sectionHeaderClass}><h2 className="font-semibold text-gray-800">Cashier Restrictions</h2></div>
        <div className={sectionBodyClass}>
          <p className="text-sm text-gray-500 -mt-2">These only apply to users with the Cashier role.</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={cashierHidePrices} onChange={e => setCashierHidePrices(e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">Hide prices from cashiers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={cashierHideStock} onChange={e => setCashierHideStock(e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">Hide stock counts from cashiers</span>
            </label>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className={sectionHeaderClass}><h2 className="font-semibold text-gray-800">Order Types</h2></div>
        <div className={sectionBodyClass}>
          <p className="text-sm text-gray-500 -mt-2">Select which order types are available in POS.</p>
          <div className="flex flex-wrap gap-3">
            {ORDER_TYPE_PRESETS.map(ot => (
              <label key={ot} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={orderTypes.includes(ot)} onChange={() => toggleOrderType(ot)} className="rounded" />
                <span className="text-sm text-gray-700">{ot}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">Active: {orderTypes.join(', ') || 'None'}</div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className={sectionHeaderClass}><h2 className="font-semibold text-gray-800">Currency & Regional Format</h2></div>
        <div className={sectionBodyClass}>
          <div>
            <label className={labelClass}>Currency</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto mb-2">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setShowCustom(false); }}
                  className={`px-3 py-2 text-sm rounded-lg border text-left transition ${!showCustom && currency === c.code ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                >
                  <span className="font-medium">{c.symbol}</span>
                  <span className="ml-1.5 text-xs">{c.code}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" id="customCurrency" checked={showCustom} onChange={e => setShowCustom(e.target.checked)} className="rounded" />
              <label htmlFor="customCurrency" className="text-gray-600">Custom currency code</label>
            </div>
            {showCustom && (
              <input type="text" value={customCurrency} onChange={e => setCustomCurrency(e.target.value.toUpperCase())} placeholder="e.g. BTC" className="mt-2 w-full max-w-xs px-3 py-2 border rounded-lg text-sm" maxLength="5" />
            )}
          </div>

          <div>
            <label className={labelClass}>Locale</label>
            <select value={locale} onChange={e => setLocale(e.target.value)} className="w-full max-w-xs px-3 py-2 border rounded-lg text-sm">
              {LOCALES.map(l => <option key={l.code} value={l.code}>{l.label} ({l.code})</option>)}
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Preview</div>
            <div className="text-lg font-semibold text-gray-800">{showCustom && customCurrency ? preview(customCurrency, locale) : preview(currency, locale)}</div>
            <div className="text-xs text-gray-400 mt-1">Symbol: {showCustom && customCurrency ? getSymbol(customCurrency) : getSymbol(currency)}</div>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className={sectionFooterClass}>
          <div>{message && <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</span>}</div>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:bg-gray-400 transition-colors">
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
