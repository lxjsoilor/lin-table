import VTable from './Table.vue'
import VSearchbar from './Searchbar.vue'
export { VTable, VSearchbar }
export default {
  install(Vue, options = {}) {
    Object.assign(VTable._pluginOptions, options)
    Vue.component(VTable.name, VTable)
    Vue.component(VSearchbar.name, VSearchbar)
  }
}
