<script>
import * as Table from './utils/iTableOptions.js'
import Toolbar from './IToolbar.vue'
import _omit from 'lodash/omit'
import { mergeProps, isVoid, getType } from './utils/tools.js'
const noop = () => {}
const defaultPluginOptions = {
  pageKey: 'pageNo',
  pageSizeKey: 'pageSize',
  preAction(res, paging) {
    if (paging) {
      const { pageNo: page, total, list: data } = res.data.result
      return { page, total, data }
    } else {
      return res.data.result
    }
  }
}
const VTable = {
  name: 'HcVTable',
  _pluginOptions: defaultPluginOptions,
  components: {
    [Toolbar.name]: Toolbar
  },
  provide() {
    return {
      ctxTable: this
    }
  },
  props: {
    columns: {
      type: Array
    },
    pagination: {
      type: [Object],
      default() {
        return {}
      }
    },
    action: Function,
    actionParams: {
      type: Object,
      default() {
        return {}
      }
    },
    toolbar: {
      type: [Array, Boolean],
      default: false,
      validator(val) {
        if (typeof val === 'boolean') return true
        return val.every(item => Toolbar._menuType.includes(item))
      }
    },
    toolbarConfig: {
      type: Object,
    },
    usePreAction: {
      type: Boolean,
      default: true
    },
    // el-tabel Props
    ...Table.props
  },
  data() {
    const { data, size = 'medium', spanMethod, columns, pagination, initPagination } = this
    const P = VTable._pluginOptions
    return {
      innerLoading: false,
      innerData: [...data],
      innerSize: size,
      innerColumns: columns,
      innerPagination: initPagination({
        // layout: 'prev, pager, next',
        pageSize: 10,
        current: 1,
        total: 30,
        ...P.pagination,
        ...pagination
      }),
      innerSpanMethod(options) {
        if (typeof spanMethod !== 'function') return undefined
        // const { row, column, rowIndex, columnIndex } = options
        const spanParams = spanMethod(options)
        return spanParams
      }
    }
  },
  computed: {
    RednerPagination() {
      if (!this.pagination) return null
      const self = this
      const { pageSize, total, hideOnSinglePage } = this.innerPagination
      const isAllData = total > 0 && total <= pageSize
      const paginationEvents = {
        'on-change'(val) {
          self.innerPagination['current'] = val
          self.remoteData()
        },
        'on-page-size-change'(val) {
          self.innerPagination['pageSize'] = val
          self.remoteData()
        }
      }
      return isAllData ? <Divider><span style="font-size: 12px;color: #999;">以上为全部数据</span></Divider> : <Page {...{ props: this.innerPagination, on: paginationEvents }} />
    }
  },
  watch: {
    'innerPagination.current'(newVal) {
      if (!this.innerPagination.memo) return
      let { query, name, hash } = this.$route
      const P = VTable._pluginOptions
      const pageKey = P.pageKey
      query = newVal !== 1 ? { ...query, [pageKey]: newVal } : _omit(query, [pageKey])
      this.$router.push({
        name,
        query,
        hash
      })
    }
  },
  mounted() {
    this.$native = this.$refs.vmTable
    this.remoteData()
  },
  methods: {
    initPagination(...arg) {
      if (!this.pagination) return {}
      const _pagination = Object.assign(...arg)
      if (!_pagination.memo) return _pagination

      const { query } = this.$route
      const P = VTable._pluginOptions
      const memo = {
        current: +query[P.pageKey] || _pagination.current,
        pageSize: +query[P.pageSizeKey] || _pagination.pageSize
      }
      return Object.assign(_pagination, memo)
    },
    remoteData(options) {
      const { action, actionParams, usePreAction, pagination } = this
      const { current, pageSize } = this.innerPagination
      const { vmTable } = this.$refs
      const P = VTable._pluginOptions
      const isUsePreAction = usePreAction && typeof(P.preAction) === 'function'
      const params = {
        ...actionParams
      }
      if (pagination) {
        params[P.pageKey] = current
        params[P.pageSizeKey] = pageSize
      }
      Object.assign(params, options)
      this.innerLoading = true
      return action(params)
        .then(res => {
          const result = isUsePreAction ? P.preAction(res, pagination) : res
          if (pagination) {
            this.innerPagination.total = result.total
            this.innerPagination.current = result.page
            this.innerData = result.data
          } else {
            this.innerData = result
          }
          this.innerLoading = false
          this.$emit('remoteSuccess', res)
        })
        .catch(err => {
        console.log('==>: remoteData -> err', err)
          this.innerLoading = false
          this.$emit('remoteFail', err)
        })
    }
  },
  render() {
    const { $props, $data, $listeners, $scopedSlots, columnScopedSlots, RednerPagination } = this
    // console.log('==>: render -> $scopedSlots', $scopedSlots['table.append'])
    const props = mergeProps(Table.props, $props, $data)
    const on = $listeners
    const scopedSlots = {
      ...$scopedSlots
    }
    return (
      <div class="table-wrapper" ref="wrapper">
        { $scopedSlots['table.prepend'] && $scopedSlots['table.prepend']() }
        { $props.toolbar && <Toolbar { ...{ props: $props.toolbarConfig } } menu={$props.toolbar}  ctx= { this } /> }
        <i-table {...{ props, on, scopedSlots }} ref="vmTable">
          {$scopedSlots.header && <span slot="header" />}
          {$scopedSlots.footer && <span slot="footer" />}
          {$scopedSlots['table.append'] && <span slot="footer" />}
        </i-table>
        {RednerPagination}
      </div>
    )
  }
}

/* istanbul ignore next */
VTable.install = function(Vue, options) {
  Object.assign(VTable._pluginOptions, options)
  Vue.component(VTable.name, VTable)
}
export default VTable
</script>
<style>
.table-wrapper {
  z-index: 1;
}
.table-wrapper:not(:root):fullscreen {
  overflow: auto;
  background-color: #fff;
}
.table-wrapper .ivu-page {
  padding: 16px 0;
  text-align: center;
  border: solid #EBEEF5;
  border-width: 0 1px 0 1px;
}
.table-wrapper .toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 18px;
  background-color: #fff;
}
.table-wrapper .toolbar__option {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.table-wrapper .toolbar__list {

}
.table-wrapper .toolbar__list .el-tooltip {
  margin-left: 16px;
  font-size: 22px;
  cursor: pointer;
}
</style>
