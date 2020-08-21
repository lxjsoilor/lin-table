<script>
import _isEqual from 'lodash/isEqual'
import { getWindowGrid } from './utils/tools.js'
const defaultColProps = {
  lg: 8,
  md: 8,
  sm: 12,
  xs: 24
}
const defaultRowProps = {
  gutter: 6
}
const grid = 24
function countGridLen(gridSpan, col) {
  Object.keys(col).forEach(k => {
    gridSpan[k] += col[k]
  })
}
const VSearchbar = {
  name: 'HcVSearchbar',
  _pluginOptions: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Object
    },
    row: {
      type: Object
    },
    col: {
      type: Object
    },
    collapseRow: {
      type: Number,
      default: 1
    },
    pageKey: String,
    labelPosition: {
      type: String,
      default: 'left'
    },
    labelWidth: {
      type: String,
      default: '70px'
    }
  },
  data() {
    const { value, col } = this
    return {
      innerCol: { ...defaultColProps, ...col },
      gridType: 'lg',
      collapse: false,
      defaultValue: { ...value }
    }
  },
  computed: {
    colsBase() {
      const { innerCol, gridType } = this
      const base = grid / innerCol[gridType]
      return base
    },
    renderFormItems() {
      const { $slots, collapse, colsBase, innerCol, gridType, collapseRow, changeCollapse, handleQuery, handleReset } = this
      const FormItems = $slots.default.filter(item => item.tag)
      const formItemLen = FormItems.length
      const isCollapse = !!collapseRow && formItemLen / colsBase > collapseRow
      const startIndex = isCollapse ? colsBase * collapseRow - 1 : -1
      const currentSpan = innerCol[gridType]
      const gridSpan = { lg: 0, md: 0, sm: 0, xs: 0 }
      const renderFormAction = () => {
        const isBreak = gridSpan[gridType] >= grid
        const num = isBreak ? (gridSpan[gridType] / currentSpan) : formItemLen
        const offset = Math.abs((num % colsBase) - (colsBase - 1)) * currentSpan
        const operationProps = {
          ...innerCol,
          [gridType]: {
            span: currentSpan,
            offset: collapse ? offset : (isCollapse || isBreak) ? currentSpan * (colsBase - 1) : 0
          }
        }
        return formItemLen
        ? (<el-col {...{ props: operationProps }}>
          <el-button size="small" type="primary" onClick={handleQuery}>
            查询
          </el-button>
          <el-button size="small" style="margin-left: 8px" onClick={handleReset}>
            重置
          </el-button>
          {isCollapse && (
            <el-link type="primary" style="margin-left: 12px" onClick={changeCollapse}>
              {collapse ? '收起' : '展开'}
              <i class={collapse ? 'el-icon-caret-top' : 'el-icon-caret-bottom'} />
            </el-link>
          )}
        </el-col>)
        : null
      }
      const _FormItems = FormItems.map((item, index) => {
        const col = item.data.attrs ? item.data.attrs.col : null
        const props = { ...innerCol, ...col }
        countGridLen(gridSpan, props)
        return (
          <el-col {...{ props }} vShow={index > startIndex || collapse}>
            {item}
          </el-col>
        )
      })
      return _FormItems.concat(renderFormAction())
    }
  },
  watch: {
    value(newVal) {
      this.defaultValue = { ...newVal }
    }
  },
  methods: {
    changeCollapse() {
      this.collapse = !this.collapse
    },
    handleQuery() {
      const { pageKey } = this
      const params = { ...this.value }

      if (pageKey) params[pageKey] = 1
      this.$emit('query', params)
    },
    handleReset() {
      const isUnique = !_isEqual(this.value, this.defaultValue)
      const defaultValue = Object.assign(this.value, this.defaultValue)
      isUnique && this.handleQuery(defaultValue)
      this.$emit('change', defaultValue)
      this.$emit('reset', defaultValue)
    }
  },
  mounted() {
    this.gridType = getWindowGrid()
    window.onresize = () => {
      this.gridType = getWindowGrid()
    }
  },
  render() {
    const { row, renderFormItems } = this
    const rowProps = {
      ...defaultRowProps,
      ...row
    }
    const formProps = {
      inline: true,
      labelPosition: this.labelPosition,
      labelWidth: this.labelWidth,
      model: this.value,
      size: 'small'
    }
    return (
      <el-form {...{ props: formProps }} class="x-table-searchbar">
        <el-row {...{ props: rowProps }}>{renderFormItems}</el-row>
      </el-form>
    )
  }
}

/* istanbul ignore next */
VSearchbar.install = function(Vue, options) {
  Object.assign(VSearchbar._pluginOptions, options)
  Vue.component(VSearchbar.name, VSearchbar)
}
export default VSearchbar
</script>
<style>
.x-table-searchbar {
  padding: 12px 16px 0 16px;
  background-color: #fff;
}
</style>
