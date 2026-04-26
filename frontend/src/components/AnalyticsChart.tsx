/**
 * Analytics Chart Component
 * Displays link click analytics using Recharts
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { LinkAnalytics } from '../types';
import { getCountryName, formatNumber } from '../utils';

interface AnalyticsChartProps {
  /** Analytics data to display */
  analytics: LinkAnalytics;
}

/**
 * Component to display link analytics with charts
 * Shows clicks over time and top countries
 */
export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ analytics }) => {
  // Convert top countries to chart format
  const countriesData = Object.entries(analytics.topCountries)
    .map(([code, count]) => ({
      country: getCountryName(code),
      clicks: count,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10); // Top 10 countries
  
  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Clicks</p>
          <p className="text-3xl font-bold text-blue-600">{formatNumber(analytics.totalClicks)}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Unique Visitors</p>
          <p className="text-3xl font-bold text-green-600">
            {formatNumber(analytics.uniqueVisitors)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Click Rate</p>
          <p className="text-3xl font-bold text-purple-600">
            {analytics.uniqueVisitors > 0
              ? ((analytics.totalClicks / analytics.uniqueVisitors) * 100).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>
      
      {/* Clicks Over Time Chart */}
      {analytics.clicksOverTime.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Clicks Over Time (30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.clicksOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Top Countries Chart */}
      {countriesData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Top Countries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="country"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clicks" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
