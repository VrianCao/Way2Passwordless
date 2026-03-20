import defaultComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Mermaid } from '@/components/mermaid';

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    Mermaid,
    ...components,
  };
}

export default {
  ...defaultComponents,
  Mermaid,
};
