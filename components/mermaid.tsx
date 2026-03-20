'use client';

import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default'
    });
    mermaid.run({ nodes: [ref.current] });
  }, [chart, resolvedTheme]);

  return <div ref={ref} className="mermaid">{chart}</div>;
}
