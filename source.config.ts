import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { remarkDirectiveAdmonition, remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import remarkDirective from 'remark-directive';
import { z } from 'zod';

export const docs = defineDocs({
  dir: '.',
  docs: {
    files: ['*.mdx'],
    schema: pageSchema.extend({
      sidebar_position: z.number().optional(),
    }),
  },
  meta: {
    files: [],
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkDirective, remarkDirectiveAdmonition, remarkMdxMermaid],
  },
});
