import React, { useEffect, useRef } from 'react';

export default function ProgressChart({ data }) {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // This is a simple implementation without external libraries
    // In a real app, you'd use Chart.js or Recharts for better visualizations
    renderChart();
  }, [data]);
  
  const renderChart = () => {
    const canvas = chartRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate bar width based on data length
    const barWidth = (width - 60) / data.length;
    const maxValue = 100; // Percentage scale
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw bars
    data.forEach((item, index) => {
      const x = 50 + index * barWidth;
      const accuracy = item.total ? Math.round((item.correct / item.total) * 100) : 0;
      const barHeight = (accuracy / maxValue) * (height - 70);
      
      // Draw bar
      ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.fillRect(x, height - 40 - barHeight, barWidth - 10, barHeight);
      
      // Draw label
      ctx.fillStyle = '#64748B';
      ctx.font = '12px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.title, x + (barWidth - 10) / 2, height - 20);
      
      // Draw value
      ctx.fillStyle = '#334155';
      ctx.font = '12px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${accuracy}%`, x + (barWidth - 10) / 2, height - 45 - barHeight);
    });
    
    // Draw y-axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Poppins, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('0%', 35, height - 35);
    ctx.fillText('50%', 35, height / 2);
    ctx.fillText('100%', 35, 30);
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      {data && data.length > 0 ? (
        <canvas 
          ref={chartRef} 
          width={800} 
          height={300} 
          className="w-full h-full"
        />
      ) : (
        <p className="text-gray-500">No progress data available</p>
      )}
    </div>
  );
}
