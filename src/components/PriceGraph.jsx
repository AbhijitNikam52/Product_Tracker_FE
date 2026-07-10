import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Line
} from 'recharts';
import useStore from '../store/useStore';
import client from '../api/client';
import LoadingSpinner from './LoadingSpinner';

const PriceGraph = () => {
  const { graphItemId, closeGraph, items } = useStore();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const item = items.find((i) => i._id === graphItemId);

  useEffect(() => {
    if (!graphItemId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await client.get(`/api/prices/${graphItemId}/history`);
        setHistory(response.data);
      } catch (err) {
        console.error('Error fetching price history:', err);
        setError(err.response?.data?.error || 'Failed to load price history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [graphItemId]);

  if (!graphItemId || !item) return null;

  const symbol = item.currency === 'USD' ? '$' : '₹';

  // Compute statistics from history
  const prices = history.map((h) => h.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : item.currentPrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : item.currentPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-2xl bg-ag-surface border border-ag-border rounded-3xl overflow-hidden shadow-2xl fade-in-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-ag-border flex justify-between items-center bg-[#0D0D14]">
          <div>
            <h3 className="font-extrabold text-lg text-ag-white truncate max-w-[400px]">
              {item.productName}
            </h3>
            <p className="text-xs text-ag-muted mt-0.5">
              Price History & Target Threshold
            </p>
          </div>
          <button
            onClick={closeGraph}
            className="w-8 h-8 rounded-full border border-ag-border hover:border-ag-purple flex items-center justify-center text-ag-muted hover:text-ag-white transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner label="Loading price history points..." />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-ag-red text-sm font-medium mb-4">{error}</p>
              <button
                onClick={closeGraph}
                className="px-4 py-2 border border-ag-border rounded-xl text-xs font-semibold text-ag-white hover:border-ag-purple transition-all"
              >
                Close
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-ag-muted text-sm mb-2">No historical data recorded yet.</p>
              <p className="text-xs text-ag-muted">Check back after the first scheduled refresh runs.</p>
            </div>
          ) : (
            <div>
              {/* Responsive Chart Container */}
              <div className="w-full h-72 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                    <XAxis
                      dataKey="recordedAt"
                      tickFormatter={(d) => {
                        try {
                          const date = new Date(d);
                          const isToday = new Date().toDateString() === date.toDateString();
                          return isToday ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a');
                        } catch (e) {
                          return d;
                        }
                      }}
                      stroke="#6B7280"
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      tickFormatter={(v) => `${symbol}${v.toLocaleString()}`}
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      width={65}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#12121A',
                        border: '1px solid #1E1E2E',
                        borderRadius: 12
                      }}
                      formatter={(v) => [`${symbol}${v.toLocaleString()}`, 'Price']}
                      labelFormatter={(l) => format(new Date(l), 'MMM d, yyyy h:mm a')}
                    />
                    {/* Dashed Target Price Line */}
                    <ReferenceLine
                      y={item.targetPrice}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `Target ${symbol}${item.targetPrice}`,
                        fill: '#EF4444',
                        fontSize: 10,
                        position: 'top',
                        style: { fontWeight: 'bold' }
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#A855F7"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#A855F7', stroke: '#12121A', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Price Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-ag-black/50 border border-ag-border rounded-2xl text-center">
                  <p className="text-[10px] text-ag-muted font-bold uppercase tracking-wider mb-1">
                    Lowest Price
                  </p>
                  <p className="text-base font-extrabold text-ag-green">
                    {symbol}{minPrice.toLocaleString()}
                  </p>
                </div>
                
                <div className="p-3 bg-ag-black/50 border border-ag-border rounded-2xl text-center">
                  <p className="text-[10px] text-ag-muted font-bold uppercase tracking-wider mb-1">
                    Highest Price
                  </p>
                  <p className="text-base font-extrabold text-ag-red">
                    {symbol}{maxPrice.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-ag-black/50 border border-ag-border rounded-2xl text-center">
                  <p className="text-[10px] text-ag-muted font-bold uppercase tracking-wider mb-1">
                    Current Price
                  </p>
                  <p className="text-base font-extrabold text-ag-white">
                    {symbol}{item.currentPrice ? item.currentPrice.toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceGraph;
