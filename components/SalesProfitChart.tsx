import React, { useState, useRef, useEffect } from 'react';

interface ChartDataPoint {
  date: string;
  gross: number;
  net: number;
  expenses: number;
  profit: number;
}

interface SalesProfitChartProps {
  data: ChartDataPoint[];
}

export default function SalesProfitChart({ data }: SalesProfitChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to show today's data (rightmost) when component loads
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Set scroll to maximum (far right)
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
        No transaction data available
      </div>
    );
  }

  // Chart dimensions and scaling
  const scale = 140000;
  const yLabels = [140000, 105000, 70000, 35000, 0];
  const spacing = 20; // Tight spacing between data points
  const svgWidth = Math.max(900, data.length * spacing + 100);
  const svgHeight = 240;
  const padding = { top: 10, right: 20, bottom: 30, left: 70 };
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const formatCurrency = (val: number) => {
    if (val === 0) return 'KSH 0';
    return `KSH ${(val / 1000).toFixed(0)}k`;
  };

  const getY = (value: number) => padding.top + plotHeight - (value / scale) * plotHeight;
  const getX = (index: number) => padding.left + (index * spacing);
  const zeroY = getY(0);

  // Build path strings for lines
  const grossPath = data.map((d, i) => `${getX(i)},${getY(d.gross)}`).join(' ');
  const netPath = data.map((d, i) => `${getX(i)},${getY(d.net)}`).join(' ');
  const expensesPath = data.map((d, i) => `${getX(i)},${getY(d.expenses)}`).join(' ');
  const profitPath = data.map((d, i) => `${getX(i)},${getY(d.profit)}`).join(' ');

  return (
    <div className="flex h-full relative">
      {/* Y-axis labels */}
      <div className="w-16 flex flex-col justify-between text-[10px] text-[var(--text-secondary)] pr-2 flex-shrink-0 pt-2 pb-8">
        {yLabels.map((label, i) => (
          <span key={i} className="text-right leading-none">{formatCurrency(label)}</span>
        ))}
      </div>

      {/* Chart SVG */}
      <div ref={scrollContainerRef} className="flex-1 overflow-x-auto relative">
        <svg width={svgWidth} height={svgHeight} style={{ minWidth: '100%' }}>
          {/* Dotted grid lines */}
          {yLabels.map((label, i) => (
            <line
              key={`grid-${i}`}
              x1={padding.left}
              y1={getY(label)}
              x2={svgWidth - padding.right}
              y2={getY(label)}
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeDasharray="3,3"
              strokeWidth="1"
            />
          ))}

          {/* Green candlesticks for Gross and Net Sales */}
          {data.map((point, i) => {
            const x = getX(i);
            const grossY = getY(point.gross);
            const netY = getY(point.net);
            
            return (
              <g key={`candle-${i}`}>
                {/* Gross Sales - Bright green candlestick */}
                <line
                  x1={x}
                  y1={zeroY}
                  x2={x}
                  y2={grossY}
                  stroke="#10b981"
                  strokeWidth="2.5"
                  opacity="0.9"
                />
                <circle cx={x} cy={grossY} r="4" fill="#10b981" opacity="0.95" />
                
                {/* Net Sales - Lighter green candlestick (slightly offset) */}
                <line
                  x1={x}
                  y1={zeroY}
                  x2={x}
                  y2={netY}
                  stroke="#34d399"
                  strokeWidth="2.5"
                  opacity="0.85"
                />
                <circle cx={x} cy={netY} r="4" fill="#34d399" opacity="0.9" />
              </g>
            );
          })}

          {/* Red line for Expenses */}
          <polyline 
            points={expensesPath} 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="2" 
            opacity="0.95"
          />
          {data.map((point, i) => (
            <circle 
              key={`expense-dot-${i}`}
              cx={getX(i)} 
              cy={getY(point.expenses)} 
              r="3" 
              fill="#ef4444" 
              opacity="0.95"
            />
          ))}

          {/* Blue line for Verified Profit */}
          <polyline 
            points={profitPath} 
            fill="none" 
            stroke="#60a5fa" 
            strokeWidth="2.5" 
            opacity="0.95"
          />
          {data.map((point, i) => (
            <circle 
              key={`profit-dot-${i}`}
              cx={getX(i)} 
              cy={getY(point.profit)} 
              r="4" 
              fill="#60a5fa" 
              opacity="0.95"
            />
          ))}

          {/* Invisible hover areas */}
          {data.map((point, i) => (
            <rect
              key={`hover-${i}`}
              x={getX(i) - 10}
              y={padding.top}
              width={20}
              height={plotHeight}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-3 shadow-xl text-xs z-10"
            style={{
              left: `${Math.min(getX(hoveredIndex) + 15, svgWidth - 200)}px`,
              top: '10px',
              pointerEvents: 'none'
            }}
          >
            <div className="font-semibold mb-2 text-[var(--text-primary)]">{data[hoveredIndex].date}</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[var(--text-secondary)]">Gross: KSH {data[hoveredIndex].gross.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <span className="text-[var(--text-secondary)]">Net: KSH {data[hoveredIndex].net.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-[var(--text-secondary)]">Expenses: KSH {data[hoveredIndex].expenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                <span className="text-[var(--text-secondary)]">Profit: KSH {data[hoveredIndex].profit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
