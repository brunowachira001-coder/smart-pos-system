import React from 'react';

interface ReceiptItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  price_type: string;
  subtotal: number;
}

interface ReceiptData {
  transactionNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  change: number;
  paymentMethod: string;
  cashierName: string;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  shopEmail?: string;
}

interface ReceiptPrintProps {
  data: ReceiptData;
  onClose: () => void;
}

export default function ReceiptPrint({ data, onClose }: ReceiptPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This will trigger the browser's print dialog with "Save as PDF" option
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Action Buttons - Hidden when printing */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center print:hidden">
          <h2 className="text-lg font-bold text-gray-900">Receipt Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 receipt-content">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{data.shopName || 'Smart POS'}</h1>
            {data.shopAddress && <p className="text-sm text-gray-600">{data.shopAddress}</p>}
            {data.shopPhone && <p className="text-sm text-gray-600">Tel: {data.shopPhone}</p>}
            {data.shopEmail && <p className="text-sm text-gray-600">{data.shopEmail}</p>}
          </div>

          <div className="border-t border-b border-gray-300 py-3 mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Receipt #:</span>
              <span className="font-mono font-semibold">{data.transactionNumber}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Date:</span>
              <span>{data.date}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Customer:</span>
              <span>{data.customerName}</span>
            </div>
            {data.customerPhone && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Phone:</span>
                <span>{data.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cashier:</span>
              <span>{data.cashierName}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 text-gray-700">Item</th>
                  <th className="text-center py-2 text-gray-700">Qty</th>
                  <th className="text-right py-2 text-gray-700">Price</th>
                  <th className="text-right py-2 text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">
                      <div>{item.product_name}</div>
                      <div className="text-xs text-gray-500">({item.price_type})</div>
                    </td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">KSH {item.unit_price.toFixed(2)}</td>
                    <td className="text-right py-2 font-semibold">KSH {item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-300 pt-3 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span>KSH {data.subtotal.toFixed(2)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Discount:</span>
                <span className="text-red-600">-KSH {data.discount.toFixed(2)}</span>
              </div>
            )}
            {data.tax > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Tax:</span>
                <span>KSH {data.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mb-2">
              <span>TOTAL:</span>
              <span>KSH {data.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold">{data.paymentMethod}</span>
            </div>
            {data.paymentMethod !== 'debt' && (
              <>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span>KSH {data.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-600">Change:</span>
                  <span className="text-green-600">KSH {data.change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center border-t border-gray-300 pt-4">
            <p className="text-sm text-gray-600 mb-2">Thank you for your business!</p>
            <p className="text-xs text-gray-500">Powered by Smart POS System</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-content,
          .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10mm;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
