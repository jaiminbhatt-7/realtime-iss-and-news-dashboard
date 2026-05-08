import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#a4de6c'];

export default function DataCharts({ issSpeeds, newsArticles }) {
  // Process news data for pie chart
  const newsDistributionData = useMemo(() => {
    if (!newsArticles || newsArticles.length === 0) return [];
    
    const sourceCounts = {};
    newsArticles.forEach(article => {
      const source = article.source || 'Unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    return Object.entries(sourceCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [newsArticles]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ISS Speed Chart */}
      <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold mb-4">ISS Speed Trend (Last 30)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={issSpeeds}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(val) => val.split(' ')[0]} // simplistic time formatter
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 12 }}
                label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* News Distribution Chart */}
      <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold mb-4">News by Source</h2>
        <div className="h-64">
          {newsDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={newsDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {newsDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No news data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
