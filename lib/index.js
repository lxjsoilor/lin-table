export const VTable = {
  install(Vue, options = {}) {
    const Table = require(`../src/${options.library === 'viewUI' ? 'ITable' : 'Table'}.vue`).default
    Table.install(Vue, options)
  }
}

export const VSearchbar = {
  install(Vue, options = {}) {
    const Searchbar = require(`../src/${options.library === 'viewUI' ? 'ISearchbar' : 'Searchbar'}.vue`).default
    Searchbar.install(Vue, options)
  }
}

export default {
  install(Vue, options = {}) {
    VTable.install(Vue, options)
    VSearchbar.install(Vue, options)
  }
}
