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
  shopTagline?: string;
  shopLogo?: string;
  shopAddress?: string;
  shopPhone?: string;
  shopEmail?: string;
}

interface ReceiptPrintProps {
  data: ReceiptData;
  onClose: () => void;
}

export default function ReceiptPrint({ data, onClose }: ReceiptPrintProps) {
  // Cache bust v2
  const [autoPrintEnabled, setAutoPrintEnabled] = React.useState(false);

  // Check if auto-print is enabled
  React.useEffect(() => {
    const autoPrint = localStorage.getItem('autoPrintReceipt');
    setAutoPrintEnabled(autoPrint === 'true');
  }, []);

  // Auto-print when receipt loads if enabled
  React.useEffect(() => {
    if (autoPrintEnabled && data) {
      // Small delay to ensure receipt is fully rendered
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [autoPrintEnabled, data]);

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
        <div className="p-4 border-b border-gray-200 flex justify-end items-center print:hidden">
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

        {/* Receipt Content with Background Graphics */}
        <div className="p-8 receipt-content bg-white relative overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Subtle Background Graphics */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, #C41E3A 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, #003087 0%, transparent 70%)' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}></div>
          </div>

          {/* Header with Shop Info - Centered */}
          <div className="mb-4 pb-4 border-b-2 border-gray-300 text-center relative z-10">
            <div className="flex flex-col items-center gap-3">
              {/* Shop Logo */}
              <div className="flex-shrink-0">
                {data.shopLogo ? (
                  <img 
                    src={data.shopLogo} 
                    alt="Shop Logo" 
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-blue-700 rounded flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {(data.shopName || 'SP').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Shop Details */}
              <div>
                <h1 className="text-3xl font-bold uppercase mb-1" style={{ color: '#C41E3A' }}>
                  {data.shopName || 'SMART POS'}
                </h1>
                {data.shopTagline && (
                  <p className="text-sm italic mb-3" style={{ color: '#1F2937' }}>{data.shopTagline}</p>
                )}
                
                <div className="space-y-1 text-xs" style={{ color: '#1F2937' }}>
                  {data.shopAddress && (
                    <div className="flex items-center justify-center gap-2">
                      <span style={{ color: '#C41E3A' }}>📍</span>
                      <span>{data.shopAddress}</span>
                    </div>
                  )}
                  {data.shopPhone && (
                    <div className="flex items-center justify-center gap-2">
                      <span style={{ color: '#003087' }}>📞</span>
                      <span>{data.shopPhone}</span>
                    </div>
                  )}
                  {data.shopEmail && (
                    <div className="flex items-center justify-center gap-2">
                      <span style={{ color: '#10B981' }}>✉️</span>
                      <span>{data.shopEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Title - Centered */}
          <div className="mb-4 flex flex-col items-center gap-2 relative z-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#003087' }}>
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold" style={{ color: '#003087' }}>RECEIPT</h2>
              <p className="text-sm italic" style={{ color: '#C41E3A' }}>Thank you for shopping with us!</p>
            </div>
          </div>

          {/* Transaction Details - Centered */}
          <div className="mb-4 pb-3 border-b border-gray-300 relative z-10">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm max-w-md mx-auto">
              <div className="flex justify-between">
                <span style={{ color: '#1F2937' }}>Receipt No.</span>
                <span className="font-semibold" style={{ color: '#111827' }}>: {data.transactionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#1F2937' }}>Customer</span>
                <span className="font-semibold" style={{ color: '#111827' }}>: {data.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#1F2937' }}>Date</span>
                <span className="font-semibold" style={{ color: '#111827' }}>: {formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#1F2937' }}>Cashier</span>
                <span className="font-semibold" style={{ color: '#111827' }}>: {data.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#1F2937' }}>Time</span>
                <span className="font-semibold" style={{ color: '#111827' }}>: {formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4 relative z-10">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#003087', color: 'white' }}>
                  <th className="text-center py-2 px-2 font-bold">Qty</th>
                  <th className="text-left py-2 px-3 font-bold">Description</th>
                  <th className="text-right py-2 px-3 font-bold">Unit Price (KES)</th>
                  <th className="text-right py-2 px-3 font-bold">Total (KES)</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-2 text-center font-semibold" style={{ color: '#111827' }}>{item.quantity}</td>
                    <td className="py-2 px-3" style={{ color: '#1F2937' }}>{item.product_name}</td>
                    <td className="py-2 px-3 text-right" style={{ color: '#1F2937' }}>{item.unit_price.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-semibold" style={{ color: '#111827' }}>{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="border-t-2 border-gray-300 pt-3 mb-4 relative z-10">
            <div className="flex justify-between text-base mb-2 px-2">
              <span style={{ color: '#1F2937' }}>Subtotal</span>
              <span className="font-semibold" style={{ color: '#111827' }}>{data.subtotal.toFixed(2)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-base mb-2 px-2">
                <span style={{ color: '#C41E3A' }}>Discount</span>
                <span className="font-semibold" style={{ color: '#C41E3A' }}>-{data.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-white py-3 px-4 mt-3" style={{ backgroundColor: '#003087' }}>
              <span>TOTAL AMOUNT</span>
              <span>{data.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-2 rounded p-4 mb-4 relative z-10" style={{ backgroundColor: '#F0FDF4', borderColor: '#10B981' }}>
            <h3 className="font-bold mb-3 text-base" style={{ color: '#047857' }}>PAYMENT DETAILS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#1F2937' }}>Payment Method</span>
                <span className="font-semibold" style={{ color: '#111827' }}>: {data.paymentMethod.toUpperCase()}</span>
              </div>
              {data.paymentMethod !== 'debt' && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: '#1F2937' }}>Amount Paid</span>
                    <span className="font-semibold" style={{ color: '#111827' }}>: {data.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#1F2937' }}>Change</span>
                    <span className="font-bold" style={{ color: '#10B981' }}>: {data.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-dashed border-gray-400 pt-4 relative z-10">
            <p className="text-xl font-bold mb-2" style={{ color: '#C41E3A', fontFamily: 'cursive' }}>
              Thank you for shopping with us!
            </p>
            <p className="text-xs" style={{ color: '#1F2937' }}>Goods once sold are not returnable</p>
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
