
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer } from 'lucide-react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptProps {
  transactionNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  paymentAmount: number;
  changeAmount: number;
  paymentMethod: string;
  cashierName: string;
  date: string;
  time: string;
  onPrint: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({
  transactionNumber,
  items,
  subtotal,
  discountAmount,
  discountType,
  discountValue,
  taxAmount,
  taxRate,
  total,
  paymentAmount,
  changeAmount,
  paymentMethod,
  cashierName,
  date,
  time,
  onPrint
}) => {
  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transactionNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              width: 80mm;
              margin: 0 auto;
              padding: 10px;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 15px;
            }
            .store-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .receipt-info {
              text-align: center;
              margin-bottom: 15px;
              font-size: 10px;
            }
            .receipt-items {
              margin-bottom: 15px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .item-name {
              flex: 1;
              text-align: left;
            }
            .item-qty-price {
              text-align: right;
              white-space: nowrap;
              margin-left: 10px;
            }
            .item-total {
              text-align: right;
              font-weight: bold;
            }
            .separator {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .total-row {
              font-weight: bold;
              font-size: 14px;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 1px solid #000;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 15px;
              font-size: 10px;
            }
            @media print {
              body {
                width: auto;
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <div class="store-name">TOKO SAYA</div>
            <div>Jl. Contoh No. 123</div>
            <div>Telp: (021) 1234-5678</div>
          </div>
          
          <div class="separator"></div>
          
          <div class="receipt-info">
            <div>No: ${transactionNumber}</div>
            <div>Tanggal: ${date}</div>
            <div>Waktu: ${time}</div>
            <div>Kasir: ${cashierName}</div>
          </div>
          
          <div class="separator"></div>
          
          <div class="receipt-items">
            ${items.map(item => `
              <div class="item-row">
                <div class="item-name">${item.name}</div>
              </div>
              <div class="item-row">
                <div class="item-qty-price">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</div>
                <div class="item-total">Rp ${item.total.toLocaleString('id-ID')}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="separator"></div>
          
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
          </div>
          
          ${discountAmount > 0 ? `
            <div class="summary-row">
              <span>Diskon ${discountType === 'percentage' ? `(${discountValue}%)` : ''}:</span>
              <span>-Rp ${discountAmount.toLocaleString('id-ID')}</span>
            </div>
          ` : ''}
          
          <div class="summary-row">
            <span>Pajak (${taxRate}%):</span>
            <span>Rp ${taxAmount.toLocaleString('id-ID')}</span>
          </div>
          
          <div class="summary-row total-row">
            <span>TOTAL:</span>
            <span>Rp ${Math.round(total).toLocaleString('id-ID')}</span>
          </div>
          
          <div class="summary-row">
            <span>Bayar (${paymentMethod}):</span>
            <span>Rp ${Math.round(paymentAmount).toLocaleString('id-ID')}</span>
          </div>
          
          <div class="summary-row">
            <span>Kembali:</span>
            <span>Rp ${Math.round(changeAmount).toLocaleString('id-ID')}</span>
          </div>
          
          <div class="receipt-footer">
            <div class="separator"></div>
            <div>Terima kasih atas kunjungan Anda!</div>
            <div>Barang yang sudah dibeli tidak dapat ditukar</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    onPrint();
  };

  // Automatically show print dialog when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      printReceipt();
    }, 500); // Small delay to ensure component is fully rendered

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg mb-2">Transaksi Berhasil!</h3>
        <p className="text-sm text-gray-600">No: {transactionNumber}</p>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-green-600">
          Rp {Math.round(total).toLocaleString('id-ID')}
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Bayar: Rp {Math.round(paymentAmount).toLocaleString('id-ID')}
        </div>
        <div className="text-sm text-gray-600">
          Kembali: Rp {Math.round(changeAmount).toLocaleString('id-ID')}
        </div>
      </div>
      
      <Button 
        onClick={printReceipt}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        <Printer className="h-4 w-4 mr-2" />
        Cetak Ulang Receipt
      </Button>
    </div>
  );
};

export default Receipt;
