import { writeFileSync } from 'node:fs'
import { cwd } from 'node:process'
import { join } from 'node:path'
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import type { Plugin, FilterPattern } from 'vite'

type includeFilter = (id: string) => boolean

export interface Options {
  locales: string[]
  dts: string
  root?: string
  include?: FilterPattern | includeFilter
  exclude?: FilterPattern
  getLocaleFs?: (locale: string) => string
  genImportName?: (locale: string) => string
}

// generate .d.ts
const generateDts = (path: string) => {
  writeFileSync(
    path,
    `
import { useI18n } from 'vue-i18n'
declare global {
  export function defineI18n (): ReturnType<typeof useI18n>;
}
  `,
    {
      flag: 'w',
    },
  )
}

const getLocaleFsDefault = (locale: string) => {
  return `'./lang/${locale}.json'`
}

const genImportNameDefault = (locale: string) => {
  return locale.split('-').join('_')
}

const includeFilterDefault = (id: string) => id.endsWith('.vue')

const name = 'vite-plugin-i18n-autoimport'

export function autoImport(options: Options): Plugin {
  const {
    locales,
    dts = 'i18n.d.ts',
    exclude,
    include = includeFilterDefault,
    root = cwd(),
    getLocaleFs = getLocaleFsDefault,
    genImportName = genImportNameDefault,
  } = options

  if (!Array.isArray(locales) || !locales.length)
    throw new Error(`${name}: locales should not be empty!`)

  let includeArr: FilterPattern = []
  let includeFn: includeFilter = () => true

  if (typeof include === 'function') {
    includeFn = include
  } else {
    includeArr = include
  }
  const fsFilter = createFilter(includeArr, exclude)

  const dtsPath = join(root, dts)
  generateDts(dtsPath)

  return {
    name,
    enforce: 'pre',

    transform(src: string, id: string) {
      if (!(fsFilter(id) && includeFn(id))) return null
      const s = new MagicString(src)
      s.replace(/\n(.*)defineI18n\(\)/g, (_, $1) => {
        return `
        import { useI18n } from 'vue-i18n'
        ${locales
          .map((locale) => {
            return `import ${genImportName(locale)} from ${getLocaleFs(locale)}`
          })
          .join(';\n')}

        ${$1} useI18n({
          messages: {
            ${locales
              .map((locale) => `['${locale}']: ${genImportName(locale)}`)
              .join(',')}
          }
        })
      `
      })

      return {
        code: s.toString(),
      }
    },
  }
}
