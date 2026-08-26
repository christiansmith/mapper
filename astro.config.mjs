// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  site: 'https://christiansmith.github.io',
  base: '/mapper',
  integrations: [
    starlight({
      title: 'Mapper',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/christiansmith/mapper',
        },
      ],
      sidebar: [
        { label: 'Tutorials', items: [{ autogenerate: { directory: 'tutorials' } }] },
        { label: 'How-to guides', items: [{ autogenerate: { directory: 'guides' } }] },
        {
          label: 'Reference',
          items: [
            'reference',
            'reference/descriptor-forms',
            { label: 'Keyword catalog', items: [{ autogenerate: { directory: 'reference/keywords' } }] },
            'reference/json-pointer',
            'reference/context',
            'reference/errors',
            'reference/validation',
            'reference/api',
            'reference/request-plugin',
            'reference/http-api',
            'reference/http-configuration',
            'reference/conformance',
          ],
        },
        { label: 'Explanation', items: [{ autogenerate: { directory: 'explanation' } }] },
      ],
    }),
  ],
})
