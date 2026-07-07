// Extensions defined in the tutorials, exactly as shown on the pages.
// Change-together rule: a page's extension code and this file change in the
// same commit.
export const initializers = {
  // src/content/docs/guides/write-extensions.md
  placeholder: (value) => (value === undefined ? 'TBD' : value)
}

export const transformers = {
  // src/content/docs/tutorials/extending-the-mapper.md — step 1
  slugify: (value) =>
    typeof value === 'string'
      ? value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-+|-+$)/g, '')
      : value
}

export const plugins = {
  // src/content/docs/tutorials/extending-the-mapper.md — steps 2–3
  publishers: async (options, value) => {
    const directory = {
      p1: { name: 'Mapping Press', city: 'Utrecht' },
      p2: { name: 'Pointer House', city: 'Reykjavík' }
    }
    return directory[value]
  },
  // src/content/docs/guides/fetch-remote-data.md
  catalog: async (options, value) => {
    const rows = {
      books: { b1: { title: 'On Mapping', year: 1998 } }
    }
    return rows[value?.type]?.[value?.id]
  }
}
