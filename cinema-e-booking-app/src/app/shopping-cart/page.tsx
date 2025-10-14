'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import AuthLayout from '@/components/AuthLayout';

type TicketType = 'adult' | 'child';
// just a prototype for the UI of the shopping cart

type CartTicket = {
  movieTitle: string;
  type: TicketType;
  quantity: number;
  price?: number; // optional if you want to show per-ticket price later
};

type CheckoutData = {
  tickets: CartTicket[];
  popcorn: boolean;
};

export default function ShoppingCartPage() {
  const [data, setData] = useState<CheckoutData>({ tickets: [], popcorn: false });
  const [promo, setPromo] = useState('');
  const [discountPct, setDiscountPct] = useState(0);

  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('checkoutData');
      if (raw) {
        try {
          const parsed: CheckoutData = JSON.parse(raw);
          setData({ tickets: parsed.tickets || [], popcorn: Boolean(parsed.popcorn) });
        } catch {
          // fallback to defaults
          setData({ tickets: [], popcorn: false });
        }
      } else {
        // Optional: provide a tiny demo so page doesn't look empty in development
        setData({
          tickets: [
            { movieTitle: 'Sample Movie', type: 'adult', quantity: 2, price: 12 },
            { movieTitle: 'Sample Movie', type: 'child', quantity: 1, price: 8 }
          ],
          popcorn: true
        });
      }
    }
  }, []);

  const subtotal = useMemo(() => {
    return data.tickets.reduce((sum, t) => {
      const unit = typeof t.price === 'number' ? t.price : t.type === 'adult' ? 12 : 8;
      return sum + unit * t.quantity;
    }, 0) + (data.popcorn ? 5 : 0);
  }, [data]);

  const discountAmount = useMemo(() => Math.round(subtotal * discountPct) / 100, [subtotal, discountPct]);
  const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) {
      setDiscountPct(0);
      return;
    }
    
    if (code === 'SAVE10') setDiscountPct(10);
    else if (code === 'SAVE20') setDiscountPct(20);
    else setDiscountPct(0);
  };

  return (
    <>
      <Navbar />
      <AuthLayout title="Purchase Details">
        <div className="space-y-6">
          {/* Purchase Details Summary */}
          

          {/* Movie Tickets Section */}
          <div className="bg-white dark:bg-[#17233a] rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-[#373572] dark:text-white">Movie Tickets</h3>
            </div>
            {data.tickets.length === 0 ? (
              <div className="p-4 text-sm text-gray-600 dark:text-gray-300">No tickets found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.tickets.map((t, idx) => {
                  const unit = typeof t.price === 'number' ? t.price : t.type === 'adult' ? 12 : 8;
                  return (
                    <li key={`${t.movieTitle}-${t.type}-${idx}`} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{t.movieTitle}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{t.type} ticket &middot; Qty: {t.quantity}</p>
                      </div>
                      <div className="text-zinc-900 dark:text-white font-semibold">${unit * t.quantity}</div>
                    </li>
                  );
                })}
                {data.popcorn && (
                  <li className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">Popcorn</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">1 item</p>
                    </div>
                    <div className="text-zinc-900 dark:text-white font-semibold">$5</div>
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="promo" className="block mb-2 text-sm font-medium text-[#373572] dark:text-gray-200">Promo Code</label>
              <input
                id="promo"
                name="promo"
                type="text"
                value={promo}
                onChange={e => setPromo(e.target.value)}
                placeholder="Enter code (e.g., SAVE10)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={applyPromo}
              className="h-[46px] px-5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
            >
              Apply
            </button>
          </div>


          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200 mb-2">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            {discountPct > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400 mb-2">
                <span>Discount ({discountPct}%)</span>
                <span>- ${discountAmount}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-[#373572] dark:text-white">Total</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${total}</p>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}


