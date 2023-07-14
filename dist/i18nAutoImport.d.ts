import type { Plugin, FilterPattern } from 'vite'
type includeFilter = (id: string) => boolean
export interface Options {
  locales: string[]
  dts?: string
  root?: string
  include?: FilterPattern | includeFilter
  exclude?: FilterPattern
  getLocaleFs?: (locale: string) => string
  genImportName?: (locale: string) => string
}
export declare function autoImport(options: Options): Plugin
export {}
