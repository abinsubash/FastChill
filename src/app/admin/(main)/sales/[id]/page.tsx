'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  CreditCard,
  ShoppingBag,
  Printer,
} from 'lucide-react';

type BillItem = {
  product: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

type Bill = {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone?: string;
  items: BillItem[];
  subtotal: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  paymentStatus: 'paid' | 'unpaid';
  createdAt: string;
  updatedAt: string;
};

export default function BillDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (billId) {
      fetchBillDetails();
    }
  }, [billId]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/getBillById?billId=${billId}`);
      const data = await res.json();

      if (data.success) {
        setBill(data.bill);
      } else {
        alert('Bill not found');
        router.push('/admin/sales');
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      alert('Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Bill not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/sales')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Sales
        </button>

        {/* Bill Details Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bill Details</h1>
              <p className="text-gray-600 mt-1">Bill Number: {bill.billNumber}</p>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{bill.customerName}</span>
                </div>
                {bill.customerPhone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{bill.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(bill.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700 capitalize">{bill.paymentMethod}</span>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bill.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-900'
                        : 'bg-orange-100 text-orange-900'
                    }`}
                  >
                    {bill.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Items ({bill.items.length})
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bill.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        ₹{item.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ₹{item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{bill.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Grand Total:</span>
                <span>₹{bill.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}