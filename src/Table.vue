<script>
import * as Table from './utils/eTableOptions.js'
import Toolbar from './Toolbar.vue'
import _omit from 'lodash/omit'
import { mergeProps, isVoid } from './utils/tools.js'
const noop = () => {}
const defaultPluginOptions = {
  pageKey: 'pageNo',
  pageSizeKey: 'pageSize',
  pagination: {},
  preAction(res, paging) {
    if (paging) {
      const { pageNo: page, total, list: data } = res.data.result
      return {
        page,
        total,
        data
      }
    } else {
      return res.data.result
    }
  }
}
// function checkActionCallback(res, paging) {
//   const cbKeys = ['page', 'total', 'data']
//   if (paging) {
//     cbKeys.forEach(key => {
//       if (isVoid(res[key])) {
//          throw new Error('action函数的返回值必须为包含{ total, data, data }的对象')
//       }
//       switch(key) {
//         case 'page':
//         case 'total':
//           if (typeof res[key] !== 'number') throw Error(`action函数里字段${key}必须为Number类型`)
//         break
//         case 'data':
//           if (Array.isArray(res[key])) throw Error(`action函数里字段${key}必须为Array类型`)
//         break
//       }
//       return true
//     })
//   } else {
//     if (Array.isArray(res)) throw new Error('action函数的返回值必须为Array类型')
//   }
// }
const VTable = {
  name: 'HcVTable',
  _pluginOptions: defaultPluginOptions,
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
    memoPagination: {
      type: Boolean,
      default: false
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
    const { data, size = 'medium', columns, pagination, initPagination } = this
    const P = VTable._pluginOptions
    return {
      innerData: [...data],
      innerSize: size,
      innerColumns: columns,
      innerPagination: initPagination({
        showSinglePageTip: false,
        background: true,
        layout: 'prev, pager, next',
        pageSize: 10,
        currentPage: 1,
        total: 30,
        ...P.pagination,
        ...pagination
      })
    }
  },
  computed: {
    rednerPagination() {
      if (!this.pagination) return null
      const self = this
      const { pageSize, total, hideOnSinglePage, showSinglePageTip } = this.innerPagination
      const isAllData = total > 0 && total <= pageSize
      const paginationEvents = {
        'current-change'(val) {
          self.innerPagination['currentPage'] = val
          self.remoteData()
        },
        'size-change'(val) {
          self.innerPagination['pageSize'] = val
          self.remoteData()
        },
        'prev-click'(val) {
          self.innerPagination['currentPage'] = val
          self.remoteData()
        },
        'next-click'(val) {
          self.innerPagination['currentPage'] = val
          self.remoteData()
        }
      }
      return (showSinglePageTip && isAllData) ? <el-divider><span style="font-size: 12px;color: #999;">以上为全部数据</span></el-divider> : <el-pagination {...{ props: this.innerPagination, on: paginationEvents }} />
    },
    renderColumns() {
      if (!Array.isArray(this.columns)) return null
      const { $scopedSlots } = this
      const columns = this.innerColumns
      function createColumn(list) {
        return list.map(item => {
          return (
            <el-table-column
              {...{
                props: item,
                scopedSlots: {
                  default: $scopedSlots[item.prop],
                  header: $scopedSlots[`${item.prop}.header`]
                }
              }}
            >
              {item.children && createColumn(item.children)}
            </el-table-column>
          )
        })
      }
      return createColumn(columns)
    }
  },
  watch: {
    'innerPagination.currentPage'(newVal) {
      if (!this.memoPagination) return
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
    initPagination(params) {
      if (!this.pagination) return {}
      const _pagination = { ...params }
      if (!this.memoPagination) {
        return _pagination
      }
      const { query } = this.$route
      const P = VTable._pluginOptions
      const memo = {
        currentPage: +query[P.pageKey] || _pagination.currentPage,
        pageSize: +query[P.pageSizeKey] || _pagination.pageSize
      }
      return Object.assign(_pagination, memo)
    },
    handleRemote() {

    },
    remoteData(options) {
      const { action, actionParams, usePreAction, pagination } = this
      const { currentPage, pageSize } = this.innerPagination
      const { vmTable } = this.$refs
      const P = VTable._pluginOptions
      const isUsePre = usePreAction && typeof(P.preAction) === 'function'
      const params = {
        ...actionParams
      }
      if (pagination) {
        params[P.pageKey] = currentPage
        params[P.pageSizeKey] = pageSize
      }
      Object.assign(params, options)
      const loadingMask = this.$loading({
        target: vmTable.$el
      })
      return action(params)
        .then(res => {
          const result = isUsePre ? P.preAction(res, pagination) : res
          loadingMask.close()
          if (pagination) {
            this.innerPagination.total = Number(result.total)
            this.innerPagination.currentPage = Number(result.page)
            this.innerData = result.data
          } else {
            this.innerData = result
          }
          this.$emit('remoteSuccess', res)
        })
        .catch(err => {
          loadingMask.close()
          this.$emit('remoteFail', err)
        })
    }
  },
  render() {
    const { $props, $data, $listeners, $scopedSlots, renderColumns, rednerPagination, renderToolBar } = this
    // console.log('==>: render -> $scopedSlots', $scopedSlots['table.append'])
    const props = mergeProps(Table.props, $props, $data)
    const on = $listeners
    const scopedSlots = {
      append: $scopedSlots['table.append']
    }
    return (
      <div class="table-wrapper" ref="wrapper">
        { $scopedSlots['table.prepend'] && $scopedSlots['table.prepend']() }
        { $props.toolbar && <Toolbar { ...{ props: $props.toolbarConfig } } menu={$props.toolbar} ctxOptions={ VTable._pluginOptions } ctx= { this } /> }
        <el-table {...{ props, on, scopedSlots }} ref="vmTable">
          {...renderColumns}
          {scopedSlots.append && <span slot="append" />}
        </el-table>
        {rednerPagination}
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
.table-wrapper .el-pagination {
  padding: 16px 0;
  text-align: center;
  border: solid #EBEEF5;
  border-width: 0;
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
