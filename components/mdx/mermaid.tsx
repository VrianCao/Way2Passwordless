import { createHash } from 'node:crypto';
import { cache } from 'react';
import { JSDOM } from 'jsdom';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';

type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SvgMeasurementWindow = Pick<Window, 'getComputedStyle'> & {
  SVGElement: typeof SVGElement;
};

type PurifyFactory = ((root: unknown) => Record<string, unknown>) & Record<string, unknown>;

const MERMAID_THEME = {
  background: 'transparent',
  primaryColor: '#ffffff',
  primaryBorderColor: '#d4d4d8',
  primaryTextColor: '#111827',
  secondaryColor: '#f8fafc',
  secondaryBorderColor: '#d4d4d8',
  secondaryTextColor: '#111827',
  tertiaryColor: '#f1f5f9',
  tertiaryBorderColor: '#d4d4d8',
  tertiaryTextColor: '#111827',
  mainBkg: '#ffffff',
  secondBkg: '#f8fafc',
  tertiaryBkg: '#f1f5f9',
  clusterBkg: '#ffffff',
  clusterBorder: '#d4d4d8',
  lineColor: '#111827',
  defaultLinkColor: '#111827',
  edgeLabelBackground: '#ffffff',
  textColor: '#111827',
  fontFamily:
    '"Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Source Han Sans SC",sans-serif',
} as const;

const GLOBAL_REPLACEMENTS = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'SVGElement',
  'SVGGraphicsElement',
  'Element',
  'Node',
  'DOMParser',
  'XMLSerializer',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
] as const;

let mermaidModulePromise: Promise<(typeof import('mermaid'))['default']> | undefined;
let renderQueue: Promise<void> = Promise.resolve();

function loadMermaid() {
  mermaidModulePromise ??= import('mermaid').then((module) => module.default);
  return mermaidModulePromise;
}

async function ensureMermaidPurify(window: unknown) {
  // `mermaid` vendors DOMPurify in an internal chunk. During Next build it can be imported
  // before `window` exists, which leaves `purify.sanitize` undefined for flowcharts.
  // @ts-expect-error Mermaid does not publish typings for this internal module.
  const { purify } = (await import('mermaid/dist/chunks/mermaid.esm/chunk-UKMXQNCB.mjs')) as {
    purify: PurifyFactory;
  };

  if (typeof purify.sanitize === 'function') return;

  Object.assign(purify, purify(window));
}

async function ensureDomPurify(window: unknown) {
  const module = (await import('dompurify')) as unknown as { default: PurifyFactory };
  const purify = module.default;

  if (typeof purify.sanitize === 'function') return;

  Object.assign(purify, purify(window));
}

async function withRenderLock<T>(task: () => Promise<T>) {
  const previous = renderQueue;
  let release!: () => void;

  renderQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    return await task();
  } finally {
    release();
  }
}

function parseNumber(value: string | null | undefined, fallback = 0) {
  if (!value) return fallback;

  const match = value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/i);
  return match ? Number(match[0]) : fallback;
}

function parseTranslate(value: string | null | undefined) {
  const match = value?.match(/translate\(([^)]+)\)/i);
  if (!match) return { x: 0, y: 0 };

  const [x = 0, y = 0] = match[1]
    .split(/[ ,]+/)
    .filter(Boolean)
    .map((part) => Number(part));

  return { x, y };
}

function translateBox(box: Box, x = 0, y = 0): Box {
  return {
    x: box.x + x,
    y: box.y + y,
    width: box.width,
    height: box.height,
  };
}

function unionBoxes(boxes: Box[]): Box {
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function measurePath(pathData: string | null | undefined): Box {
  const numbers = pathData?.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];
  const xs: number[] = [];
  const ys: number[] = [];

  for (let index = 0; index < numbers.length - 1; index += 2) {
    xs.push(numbers[index]);
    ys.push(numbers[index + 1]);
  }

  if (xs.length === 0 || ys.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function installSvgGeometryPolyfills(window: SvgMeasurementWindow) {
  const prototype = window.SVGElement.prototype as SVGElement & {
    getBBox?: () => Box;
    getBoundingClientRect?: () => DOMRect;
    getComputedTextLength?: () => number;
    getSubStringLength?: (start: number, length: number) => number;
  };

  const measure = (element: SVGElement): Box => {
    const tag = element.tagName.toLowerCase();
    const attr = (name: string) => element.getAttribute(name);

    if (tag === 'text' || tag === 'tspan') {
      const fontSize = parseNumber(attr('font-size') ?? window.getComputedStyle(element).fontSize, 16);
      const textAnchor = attr('text-anchor') ?? window.getComputedStyle(element).textAnchor;
      const x = parseNumber(attr('x'));
      const y = parseNumber(attr('y'));
      const lineCount = Math.max(element.querySelectorAll('tspan').length, (element.textContent || '').split('\n').length, 1);
      const lines =
        element.querySelectorAll('tspan').length > 0
          ? Array.from(element.querySelectorAll('tspan')).map((node) => (node.textContent || '').trim())
          : (element.textContent || '').split('\n').map((line) => line.trim());
      const width = Math.max(...lines.map((line) => Math.max(line.length, 1) * fontSize * 0.62), fontSize * 0.62);
      const left = textAnchor === 'middle' ? x - width / 2 : textAnchor === 'end' ? x - width : x;

      return {
        x: left,
        y: y - fontSize,
        width,
        height: lineCount * fontSize * 1.2,
      };
    }

    if (tag === 'rect' || tag === 'foreignobject' || tag === 'image' || tag === 'use') {
      return {
        x: parseNumber(attr('x')),
        y: parseNumber(attr('y')),
        width: parseNumber(attr('width')),
        height: parseNumber(attr('height')),
      };
    }

    if (tag === 'circle') {
      const cx = parseNumber(attr('cx'));
      const cy = parseNumber(attr('cy'));
      const r = parseNumber(attr('r'));

      return {
        x: cx - r,
        y: cy - r,
        width: r * 2,
        height: r * 2,
      };
    }

    if (tag === 'ellipse') {
      const cx = parseNumber(attr('cx'));
      const cy = parseNumber(attr('cy'));
      const rx = parseNumber(attr('rx'));
      const ry = parseNumber(attr('ry'));

      return {
        x: cx - rx,
        y: cy - ry,
        width: rx * 2,
        height: ry * 2,
      };
    }

    if (tag === 'line') {
      const x1 = parseNumber(attr('x1'));
      const y1 = parseNumber(attr('y1'));
      const x2 = parseNumber(attr('x2'));
      const y2 = parseNumber(attr('y2'));

      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };
    }

    if (tag === 'polygon' || tag === 'polyline') {
      const points = (attr('points') || '')
        .trim()
        .split(/\s+/)
        .map((pair) => pair.split(',').map(Number))
        .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

      if (points.length > 0) {
        const xs = points.map(([x]) => x);
        const ys = points.map(([, y]) => y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);

        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
        };
      }
    }

    if (tag === 'path') {
      return measurePath(attr('d'));
    }

    const childBoxes = Array.from(element.children)
      .filter((child): child is SVGElement => child instanceof window.SVGElement)
      .map((child) => {
        const box = measure(child);
        const { x, y } = parseTranslate(child.getAttribute('transform'));
        return translateBox(box, x, y);
      })
      .filter((box) => box.width > 0 || box.height > 0);

    return childBoxes.length > 0 ? unionBoxes(childBoxes) : { x: 0, y: 0, width: 0, height: 0 };
  };

  Object.defineProperty(prototype, 'getBBox', {
    configurable: true,
    value(this: SVGElement) {
      return measure(this);
    },
  });

  Object.defineProperty(prototype, 'getBoundingClientRect', {
    configurable: true,
    value(this: SVGElement) {
      const box = measure(this);

      return {
        ...box,
        top: box.y,
        right: box.x + box.width,
        bottom: box.y + box.height,
        left: box.x,
        toJSON() {
          return this;
        },
      };
    },
  });

  Object.defineProperty(prototype, 'getComputedTextLength', {
    configurable: true,
    value(this: SVGElement) {
      return measure(this).width;
    },
  });

  Object.defineProperty(prototype, 'getSubStringLength', {
    configurable: true,
    value(this: SVGElement, _start: number, length: number) {
      const totalLength = Math.max((this.textContent || '').length, 1);
      return measure(this).width * ((length || 0) / totalLength);
    },
  });
}

async function withMermaidDom<T>(task: () => Promise<T>) {
  const dom = new JSDOM('<!doctype html><html><body><div id="mermaid-root"></div></body></html>', {
    pretendToBeVisual: true,
  });
  const scope = globalThis as Record<string, unknown>;
  const previous = new Map<string, unknown>();
  const replacements: Record<(typeof GLOBAL_REPLACEMENTS)[number], unknown> = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    SVGElement: dom.window.SVGElement,
    SVGGraphicsElement: dom.window.SVGGraphicsElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    DOMParser: dom.window.DOMParser,
    XMLSerializer: dom.window.XMLSerializer,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
  };

  installSvgGeometryPolyfills(dom.window);

  for (const key of GLOBAL_REPLACEMENTS) {
    previous.set(key, scope[key]);
    Object.defineProperty(scope, key, {
      configurable: true,
      writable: true,
      value: replacements[key],
    });
  }

  try {
    return await task();
  } finally {
    for (const key of GLOBAL_REPLACEMENTS) {
      Object.defineProperty(scope, key, {
        configurable: true,
        writable: true,
        value: previous.get(key),
      });
    }

    dom.window.close();
  }
}

function enhanceSvg(svg: string) {
  let output = svg;

  if (!output.includes('preserveAspectRatio=')) {
    output = output.replace('<svg ', '<svg preserveAspectRatio="xMinYMin meet" ');
  }

  output = output.replace(/style="([^"]*)"/, (_match, style: string) => {
    const normalized = style.trim().endsWith(';') ? style.trim() : `${style.trim()};`;
    return `style="${normalized} height: auto;"`;
  });

  return output;
}

const renderMermaidSvg = cache(async (chart: string) => {
  return withRenderLock(async () =>
    withMermaidDom(async () => {
      await ensureDomPurify(window);
      await ensureMermaidPurify(window);
      const mermaid = await loadMermaid();
      const root = document.getElementById('mermaid-root');

      if (!root) {
        throw new Error('Mermaid root container was not created.');
      }

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        htmlLabels: false,
        theme: 'base',
        themeVariables: MERMAID_THEME,
      });

      const id = `mermaid-${createHash('sha1').update(chart).digest('hex').slice(0, 10)}`;
      const { svg } = await mermaid.render(id, chart, root);

      return enhanceSvg(svg);
    }),
  );
});

export async function Mermaid({ chart }: { chart: string }) {
  try {
    const svg = await renderMermaidSvg(chart);

    return (
      <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-card/40 px-3 py-3 sm:px-4">
        <div
          className="flex justify-center [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return (
      <CodeBlock title="Mermaid">
        <Pre>{`${chart}\n\n[render error] ${message}`}</Pre>
      </CodeBlock>
    );
  }
}
