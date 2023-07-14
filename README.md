# vite-plugin-i18n-autoimport

## plugin options

```javascript
type includeFilter = (id: string) => boolean;
export interface Options {
    locales: string[];  // i18n locale list
    dts?: string; // .d.ts file position, should include in tsconfig.json's include option; default i18n.d.sts
    root?: string; // default cwd()
    include?: FilterPattern | includeFilter;  // filter
    exclude?: FilterPattern;
    getLocaleFs?: (locale: string) => string;  // get the locale config based on the locale value in locales
    genImportName?: (locale: string) => string; // generate the import name of locale config file based on the locale value in locales
}
```

## use plugin in vite

```javascript
import { autoImport } from 'vite-plugin-i18n-autoimport'

export default defineConfig(() => {

  return {
    plugins: [
      autoImport({
        locales: [LOCALE_ENUM.zhCn, LOCALE_ENUM.zhHant],
        dts: './i18ntest.d.ts'
      }),
    ]
  }
})
```

## use in composition API 

```javascript
<script setup lang="ts">
const { t } = defineI18n()
</script>
```