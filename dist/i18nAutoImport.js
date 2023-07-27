"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoImport = void 0;
const node_fs_1 = require("node:fs");
const node_process_1 = require("node:process");
const node_path_1 = require("node:path");
const pluginutils_1 = require("@rollup/pluginutils");
const magic_string_1 = require("magic-string");
const name = 'vite-plugin-i18n-autoimport';
// generate .d.ts
const generateDts = (path) => {
    if ((0, node_fs_1.existsSync)(path))
        return;
    (0, node_fs_1.writeFile)(path, `
import { useI18n } from 'vue-i18n'
declare global {
  export function defineI18n (): ReturnType<typeof useI18n>;
}
  `, {
        flag: 'w',
    }, (err) => {
        console.log(`${name}: ${path} write error`, err);
    });
};
const getLocaleFsDefault = (locale) => {
    return `'./lang/${locale}.json'`;
};
const genImportNameDefault = (locale) => {
    return locale.split('-').join('_');
};
const includeFilterDefault = (id) => id.endsWith('.vue');
function autoImport(options) {
    const { locales, dts = 'i18n.d.ts', exclude, include = includeFilterDefault, root = (0, node_process_1.cwd)(), getLocaleFs = getLocaleFsDefault, genImportName = genImportNameDefault, } = options;
    if (!Array.isArray(locales) || !locales.length)
        throw new Error(`${name}: locales should not be empty!`);
    let includeArr = [];
    let includeFn = () => true;
    if (typeof include === 'function') {
        includeFn = include;
    }
    else {
        includeArr = include;
    }
    const fsFilter = (0, pluginutils_1.createFilter)(includeArr, exclude);
    if (dts !== false) {
        const dtsPath = (0, node_path_1.join)(root, dts);
        generateDts(dtsPath);
    }
    return {
        name,
        enforce: 'pre',
        transform(src, id) {
            if (!(fsFilter(id) && includeFn(id)))
                return null;
            const s = new magic_string_1.default(src);
            s.replace(/\n(.*)defineI18n\(\)/g, (_, $1) => {
                return `
        import { useI18n } from 'vue-i18n'
        ${locales
                    .map((locale) => {
                    return `import ${genImportName(locale)} from ${getLocaleFs(locale)}`;
                })
                    .join(';\n')}

        ${$1} useI18n({
          messages: {
            ${locales
                    .map((locale) => `['${locale}']: ${genImportName(locale)}`)
                    .join(',')}
          }
        })
      `;
            });
            return {
                code: s.toString(),
            };
        },
    };
}
exports.autoImport = autoImport;
