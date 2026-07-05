import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/productService';
import { getCustomers } from '../services/customerService';
import { createSale } from '../services/salesService';
import { formatCurrency } from '../utils/formatters';
import Receipt from '../components/Receipt';

const POS = () => {
  const { user } = useAuth();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, customer, setCustomer, discount, setDiscount, getSubtotal, getTax, getTotal } = useCart();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerSearch, setCustomerSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [printData, setPrintData] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, custRes] = await Promise.all([
          getProducts({ limit: 200, status: 'active' }),
          getCustomers({ limit: 200 })
        ]);
        if (prodRes?.success) {
          const prods = prodRes.data;
          setAllProducts(prods);
          setProducts(prods);
        }
        if (custRes?.success) setCustomers(custRes.data);
      } catch (err) {
        console.error('POS fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setProducts(allProducts); return; }
    const q = search.toLowerCase();
    setProducts(allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
    ));
  }, [search, allProducts]);

  const handleAddProduct = useCallback((product) => {
    addToCart(product, 1);
    setSearch('');
    searchRef.current?.focus();
  }, [addToCart]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim() && products.length > 0) {
      handleAddProduct(products[0]);
    }
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) return;
    setProcessing(true);
    try {
      const saleData = {
        items: cartItems.map(item => ({
          product: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.product.price * item.quantity
        })),
        customerId: customer?.id || null,
        subtotal: getSubtotal(),
        tax: getTax(),
        discount,
        total: getTotal(),
        paymentMethod
      };
      const res = await createSale(saleData);
      if (res.success) {
        setSuccess({ transactionId: res.data.transactionId, total: res.data.total });
        setPrintData({ sale: res.data, customerName: customer?.name || null, cashierName: user?.username });
        clearCart();
        setShowPaymentModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading POS...</div></div>;

  if (success) {
    return (
      <>
        <div className="receipt-screen flex items-start justify-center h-full pt-8 px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Payment Successful</h2>
              <p className="text-sm text-gray-500 mt-0.5">{success.transactionId}</p>
            </div>

            <div className="receipt-card">
              <Receipt sale={printData?.sale} customerName={printData?.customerName} cashierName={printData?.cashierName} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setSuccess(null); setPrintData(null); }} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors">
                New Sale
              </button>
              <button onClick={() => window.print()} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2">
                <span>🖨️</span>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
        <div className="receipt-print">
          {printData && <Receipt sale={printData.sale} customerName={printData.customerName} cashierName={printData.cashierName} />}
        </div>
      </>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="flex-1 flex flex-col">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name, SKU or barcode..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => handleAddProduct(product)}
                className={`p-2 rounded-lg text-center transition ${product.stock <= 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200 hover:border-blue-400 hover:shadow'}`}
              >
                <p className="text-sm font-semibold truncate">{product.name}</p>
                <p className="text-blue-600 font-bold">{formatCurrency(product.price)}</p>
                <p className={`text-xs ${product.stock <= product.minStock ? 'text-red-500' : 'text-gray-400'}`}>
                  Stock: {product.stock}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-96 flex flex-col">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <button onClick={() => setShowCustomerModal(true)} className="w-full text-left text-sm text-gray-600 hover:text-blue-600">
            {customer ? `Customer: ${customer.name}` : '+ Select Customer'}
          </button>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow p-4 mb-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-3">Cart ({cartItems.length} items)</h3>
          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-8">Cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded bg-gray-200 text-sm">-</button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded bg-gray-200 text-sm">+</button>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-red-500">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span></div>
            <div className="flex justify-between text-sm"><span>Tax (8%)</span><span>{formatCurrency(getTax())}</span></div>
            <div className="flex items-center justify-between text-sm">
              <span>Discount</span>
              <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} className="w-20 text-right border rounded px-1 py-0.5 text-sm" min="0" />
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-1"><span>Total</span><span>{formatCurrency(getTotal())}</span></div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={cartItems.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Pay {formatCurrency(getTotal())}
          </button>
        </div>
      </div>

      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCustomerModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Select Customer</h3>
            <input type="text" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} placeholder="Search..." className="w-full border rounded px-3 py-2 mb-3 text-sm" />
            <div className="space-y-2">
              <button onClick={() => { setCustomer(null); setShowCustomerModal(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">None (Walk-in)</button>
              {customers.filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                <button key={c.id} onClick={() => { setCustomer(c); setShowCustomerModal(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-gray-500 ml-2">{c.loyaltyPoints} pts</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Complete Payment</h3>
            <div className="space-y-3 mb-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3" />
                <span>Cash</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3" />
                <span>Card</span>
              </label>
            </div>
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">Total Amount</p>
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(getTotal())}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handlePayment} disabled={processing} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
                {processing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;