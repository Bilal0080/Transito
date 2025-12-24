import React, { useEffect, useRef, useState } from 'react';

interface MermaidRendererProps {
  chart: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart || !ref.current) return;
      
      try {
        setError(null);
        // @ts-ignore - mermaid is loaded from CDN in index.html
        if (window.mermaid) {
          // @ts-ignore
          const { svg } = await window.mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart);
          setSvg(svg);
        } else {
          setError("Mermaid library not loaded.");
        }
      } catch (e: any) {
        console.error("Mermaid Render Error:", e);
        setError("Failed to render diagram. Syntax might be invalid.");
        setSvg(''); 
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-red-800 bg-red-900/20 text-red-300 rounded text-sm font-mono">
        <p className="mb-2 font-bold">Diagram Error:</p>
        <p>{error}</p>
        <pre className="mt-4 text-xs opacity-70 whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      className="w-full overflow-x-auto bg-gray-900 p-6 rounded-lg border border-gray-800 flex justify-center items-center min-h-[300px]"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidRenderer;