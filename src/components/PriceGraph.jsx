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
  const [data, setData] = useState(null);
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
        setData(response.data);
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
  const historyList = data?.history || [];
  const predictionsList = data?.predictions || [];
  const recommendation = data?.recommendation || null;

  const prices = historyList.map((h) => h.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : item.currentPrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : item.currentPrice;

  // Combine history and predictions for Recharts
  const chartData = [];
  historyList.forEach((h, index) => {
    const isLastHistory = index === historyList.length - 1;
    chartData.push({
      recordedAt: h.recordedAt,
      price: h.price,
      // Connect history to prediction at the last history point
      predictedPrice: isLastHistory && predictionsList.length > 0 ? h.price : undefined
    });
  });

  predictionsList.forEach((p) => {
    chartData.push({
      recordedAt: p.recordedAt,
      price: undefined,
      predictedPrice: p.predictedPrice
    });
  });

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
              Price Prediction & Purchase Advisor
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
              <LoadingSpinner label="Analyzing price trend and loading predictions..." />
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
          ) : historyList.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-ag-muted text-sm mb-2">No historical data recorded yet.</p>
              <p className="text-xs text-ag-muted">Check back after the first scheduled refresh runs.</p>
            </div>
          ) : (
            <div>
              {/* Responsive Chart Container */}
              <div className="w-full h-72 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                    <XAxis
                      dataKey="recordedAt"
                      tickFormatter={(d) => {
                        try {
                          const date = new Date(d);
                          return format(date, 'MMM d');
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
                      formatter={(v, name) => {
                        const label = name === 'price' ? 'Actual Price' : 'Predicted Price';
                        return [`${symbol}${v.toLocaleString()}`, label];
                      }}
                      labelFormatter={(l) => {
                        try {
                          return format(new Date(l), 'MMM d, yyyy h:mm a');
                        } catch (e) {
                          return l;
                        }
                      }}
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
                      name="price"
                      type="monotone"
                      dataKey="price"
                      stroke="#A855F7"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#A855F7', stroke: '#12121A', strokeWidth: 2 }}
                    />
                    <Line
                      name="predictedPrice"
                      type="monotone"
                      dataKey="predictedPrice"
                      stroke="#22D3EE"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 5, fill: '#22D3EE', stroke: '#12121A', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Purchase Advisor Card */}
              {recommendation && (
                <div className={`mb-6 p-4 rounded-2xl border transition-all duration-300 ${
                  recommendation.decision === 'BUY'
                    ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                }`}>
                  <div className="flex items-start gap-4">
                    {/* Icon Badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      recommendation.decision === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {recommendation.decision === 'BUY' ? '🛒' : '⏳'}
                    </div>

                    {/* Message and Confidence */}
                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full ${
                            recommendation.decision === 'BUY'
                              ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/35'
                              : 'bg-amber-500/25 text-amber-400 border border-amber-500/35'
                          }`}>
                            {recommendation.decision === 'BUY' ? 'Buy Now' : 'Wait'}
                          </span>
                          <span className="text-[11px] text-ag-muted font-semibold">
                            Expected change: <span className={recommendation.expectedChange < 0 ? 'text-ag-green' : recommendation.expectedChange > 0 ? 'text-ag-red' : 'text-ag-white'}>
                              {recommendation.expectedChange < 0 ? '-' : recommendation.expectedChange > 0 ? '+' : ''}
                              {symbol}{Math.abs(recommendation.expectedChange).toLocaleString()}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-ag-muted uppercase font-bold tracking-wider">
                            Confidence:
                          </span>
                          <span className={`text-xs font-extrabold ${
                            recommendation.decision === 'BUY' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {recommendation.confidence}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-ag-white font-medium mt-2 leading-relaxed">
                        {recommendation.message}
                      </p>

                      {/* Confidence Progress Bar */}
                      <div className="w-full bg-ag-black/50 h-1.5 rounded-full mt-3 overflow-hidden border border-ag-border/30">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            recommendation.decision === 'BUY' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${recommendation.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
