'use client';

import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import mermaid from 'mermaid';
import { useEffect, useId, useRef, useState } from 'react';

let initialized = false;

function initMermaid() {
  if (initialized) return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    htmlLabels: true,
    theme: 'base',
    themeVariables: {
      background: 'transparent',
      primaryColor: 'var(--color-fd-card)',
      primaryBorderColor: 'var(--color-fd-border)',
      primaryTextColor: 'var(--color-fd-foreground)',
      secondaryColor: 'var(--color-fd-secondary)',
      secondaryBorderColor: 'var(--color-fd-border)',
      secondaryTextColor: 'var(--color-fd-foreground)',
      tertiaryColor: 'var(--color-fd-muted)',
      tertiaryBorderColor: 'var(--color-fd-border)',
      tertiaryTextColor: 'var(--color-fd-foreground)',
      mainBkg: 'var(--color-fd-card)',
      secondBkg: 'var(--color-fd-secondary)',
      tertiaryBkg: 'var(--color-fd-muted)',
      clusterBkg: 'var(--color-fd-card)',
      clusterBorder: 'var(--color-fd-border)',
      lineColor: 'var(--color-fd-foreground)',
      defaultLinkColor: 'var(--color-fd-foreground)',
      edgeLabelBackground: 'var(--color-fd-background)',
      textColor: 'var(--color-fd-foreground)',
      fontFamily: 'inherit',
    },
  });

  initialized = true;
}

function setNaturalWidth(svg: SVGSVGElement) {
  const viewBox = svg.getAttribute('viewBox');
  if (!viewBox) return;

  const parts = viewBox.split(/\s+/).map(Number);
  const width = parts[2];

  if (Number.isFinite(width) && width > 0) {
    svg.style.width = `${Math.ceil(width)}px`;
  }

  svg.style.maxWidth = 'none';
  svg.style.height = 'auto';
  svg.style.display = 'block';
  svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
}

export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, '-');
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const container = ref.current;
      if (!container) return;

      container.innerHTML = '';
      setError(null);

      try {
        initMermaid();
        const { svg, bindFunctions } = await mermaid.render(`mermaid-${id}`, chart);

        if (cancelled) return;

        container.innerHTML = svg;
        const svgElement = container.querySelector('svg');
        if (svgElement instanceof SVGSVGElement) {
          setNaturalWidth(svgElement);
        }

        bindFunctions?.(container);
      } catch (err) {
        if (cancelled) return;

        container.innerHTML = '';
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    void render();

    return () => {
      cancelled = true;
      if (ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [chart, id]);

  if (error) {
    return (
      <CodeBlock title="Mermaid">
        <Pre>{`${chart}\n\n[render error] ${error}`}</Pre>
      </CodeBlock>
    );
  }

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-fd-border bg-fd-card/40 px-3 py-3 sm:px-4">
      <div
        ref={ref}
        className="flex w-max min-w-full justify-start sm:justify-center [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-none"
      />
    </div>
  );
}
