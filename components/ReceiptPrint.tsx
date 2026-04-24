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

  // Format date and time separately
  const formatDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  };

  const { date: formattedDate, time: formattedTime } = formatDateTime();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
        <div className="p-8 receipt-content bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Header with Shop Info */}
          <div className="border-4 border-blue-900 p-4 mb-4">
            <div className="flex items-start gap-4">
              {/* Shop Logo/Icon Placeholder */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-blue-900 rounded flex items-center justify-center text-white text-2xl font-bold">
                  {(data.shopName || 'SP').substring(0, 2).toUpperCase()}
                </div>
              </div>
              
              {/* Shop Details */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-blue-900 uppercase mb-1">
                  {data.shopName || 'SMART POS'}
                </h1>
                <p className="text-xs text-gray-600 italic mb-2">Shop More, Save More</p>
                
                <div className="space-y-1 text-xs">
                  {data.shopAddress && (
                    <div className="flex items-start gap-2">
                      <span className="text-red-600">📍</span>
                      <span className="text-gray-700">{data.shopAddress}</span>
                    </div>
                  )}
                  {data.shopPhone && (
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600">📞</span>
                      <span className="text-gray-700">{data.shopPhone}</span>
                    </div>
                  )}
                  {data.shopEmail && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">✉️</span>
                      <span className="text-gray-700">{data.shopEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Title */}
          <div className="bg-blue-900 text-white py-2 px-4 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">RECEIPT</h2>
              <p className="text-xs italic">Thank you for shopping with us!</p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm border-b border-gray-300 pb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt No.</span>
              <span className="font-semibold">: {data.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold">: {formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-semibold">: {formattedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cashier</span>
              <span className="font-semibold">: {data.cashierName}</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-gray-600">Customer</span>
              <span className="font-semibold">: {data.customerName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="text-left py-2 px-3 font-semibold">Qty</th>
                  <th className="text-left py-2 px-3 font-semibold">Description</th>
                  <th className="text-right py-2 px-3 font-semibold">Unit Price (KES)</th>
                  <th className="text-right py-2 px-3 font-semibold">Total (KES)</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-3 text-center font-semibold">{item.quantity}</td>
                    <td className="py-2 px-3">{item.product_name}</td>
                    <td className="py-2 px-3 text-right">{item.unit_price.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="border-t-2 border-gray-300 pt-3 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-semibold">{data.subtotal.toFixed(2)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-600">Discount</span>
                <span className="text-red-600 font-semibold">-{data.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold bg-blue-900 text-white py-3 px-4 mt-3">
              <span>TOTAL AMOUNT</span>
              <span>{data.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <h3 className="font-bold text-green-800 mb-3 text-sm">PAYMENT DETAILS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Payment Method</span>
                <span className="font-semibold">: {data.paymentMethod}</span>
              </div>
              {data.paymentMethod !== 'debt' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Amount Paid</span>
                    <span className="font-semibold">: {data.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Change</span>
                    <span className="font-bold text-green-600">: {data.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-dashed border-gray-300 pt-4">
            <p className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: 'cursive' }}>
              Thank you for shopping with us!
            </p>
            <p className="text-xs text-gray-500">Goods once sold are not returnable</p>
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
            padding: 5mm;
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
