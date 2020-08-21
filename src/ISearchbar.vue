<script>
import { getWindowGrid } from './utils/tools.js'
const defaultColProps = {
  lg: 8,
  md: 8,
  sm: 12,
  xs: 24
}
const defaultRowProps = {
  gutter: 24
}
const grid = 24
function countGridLen(gridSpan, col) {
  Object.keys(col).forEach(k => {
    gridSpan[k] += col[k]
  })
}
const VSearchbar = {
  name: 'HcVSearchbar',
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
    pageKey: {
      type: String,
      require: true
    },
    labelPosition: {
      type: String,
      default: 'left'
    },
    labelWidth: {
      type: Number,
      default: 70
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
      const startIndex = colsBase * collapseRow
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
        ? (<Col {...{ props: operationProps }}>
          <Button type="primary" onClick={handleQuery}>
            查询
          </Button>
          <Button style="margin-left: 8px" onClick={handleReset}>
            重置
          </Button>
          {isCollapse && (
            <a type="primary" style="margin-left: 12px" onClick={changeCollapse}>
              {collapse ? '收起' : '展开'}
              <Icon size={18} type={ collapse ? 'md-arrow-dropup' : 'md-arrow-dropdown' } />
            </a>
          )}
        </Col>)
        : null
      }
      const _FormItems = FormItems.map((item, index) => {
        const col = item.data.attrs ? item.data.attrs.col : null
        item.data.attrs.style = 'width: 100%'
        const props = { ...innerCol, ...col }
        countGridLen(gridSpan, props)
        return (
          <Col {...{ props }} vShow={index < startIndex || collapse}>
            {item}
          </Col>
        )
      })
      return _FormItems.concat(renderFormAction())
    }
  },
  watch: {
    value(newVal) {
      this.defaultValue = newVal
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
      const defaultValue = Object.assign(this.value, this.defaultValue)
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
      <Form {...{ props: formProps }} ref="vmForm" class="x-table-searchbar">
        <Row {...{ props: rowProps }}>{renderFormItems}</Row>
      </Form>
    )
  }
}

/* istanbul ignore next */
VSearchbar.install = function(Vue) {
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
