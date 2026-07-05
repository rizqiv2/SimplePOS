import { formatCurrency, formatDateTime } from '../utils/formatters';

const storeName = () => localStorage.getItem('pos_store_name') || 'My Store';
const storeAddress = () => localStorage.getItem('pos_store_address') || '';
const storePhone = () => localStorage.getItem('pos_store_phone') || '';
const receiptFooter = () => localStorage.getItem('pos_receipt_footer') || 'Thank you for your purchase!';

const ReceiptDivider = () => <div className="receipt-divider" />;
const ReceiptThinDivider = () => <div className="receipt-thin-divider" />;

const Receipt = ({ sale, customerName, cashierName }) => {
  if (!sale) return null;
  const items = sale.items || [];

  return (
    <div className="receipt">
      <div className="receipt-header">
        <div className="receipt-store-name">{storeName()}</div>
        {storeAddress() && <div className="receipt-store-info">{storeAddress()}</div>}
        {storePhone() && <div className="receipt-store-info">{storePhone()}</div>}
      </div>

      <ReceiptDivider />

      <div className="receipt-transaction">
        <div className="receipt-line">
          <span className="receipt-label">Transaction</span>
          <span className="receipt-value">{sale.transactionId}</span>
        </div>
        <div className="receipt-line">
          <span className="receipt-label">Date</span>
          <span className="receipt-value">{formatDateTime(sale.createdAt)}</span>
        </div>
        <div className="receipt-line">
          <span className="receipt-label">Cashier</span>
          <span className="receipt-value">{cashierName || 'N/A'}</span>
        </div>
      </div>

      <ReceiptDivider />

      <div className="receipt-items">
        <div className="receipt-items-header">
          <span className="receipt-col-item">Item</span>
          <span className="receipt-col-qty">Qty</span>
          <span className="receipt-col-price">Price</span>
          <span className="receipt-col-total">Total</span>
        </div>
        <ReceiptThinDivider />
        {items.map((item, i) => (
          <div key={i} className="receipt-item">
            <div className="receipt-item-row">
              <span className="receipt-col-item">{item.productName || `Product #${item.product}`}</span>
              <span className="receipt-col-qty">{item.quantity}</span>
              <span className="receipt-col-price">{formatCurrency(item.price)}</span>
              <span className="receipt-col-total">{formatCurrency(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <ReceiptDivider />

      <div className="receipt-totals">
        <div className="receipt-line">
          <span>Subtotal</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        <div className="receipt-line">
          <span>Tax</span>
          <span>{formatCurrency(sale.tax)}</span>
        </div>
        {sale.serviceCharge > 0 && (
          <div className="receipt-line">
            <span>Service Charge</span>
            <span>{formatCurrency(sale.serviceCharge)}</span>
          </div>
        )}
        {sale.discount > 0 && (
          <div className="receipt-line">
            <span>Discount</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        )}
        <ReceiptThinDivider />
        <div className="receipt-total">
          <span>Total</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      <ReceiptDivider />

      <div className="receipt-payment">
        <div className="receipt-line">
          <span>Payment</span>
          <span className="receipt-capitalize">{sale.paymentMethod}</span>
        </div>
        {sale.orderType && (
          <div className="receipt-line">
            <span>Order</span>
            <span>{sale.orderType}</span>
          </div>
        )}
        {customerName && (
          <div className="receipt-line">
            <span>Customer</span>
            <span>{customerName}</span>
          </div>
        )}
      </div>

      <ReceiptDivider />

      <div className="receipt-footer">
        <div className="receipt-thanks">{receiptFooter()}</div>
      </div>
    </div>
  );
};

export default Receipt;
