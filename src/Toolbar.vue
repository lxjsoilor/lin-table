<script>
import { openDownloadDialog, asyncAsset } from './utils/tools.js'
let XLSX = undefined
function getFunVNode(val) {
  return typeof(val) === 'function' ? val() : val
}
// 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
function sheet2blob(sheet, sheetName) {
	sheetName = sheetName || 'sheet1';
	var workbook = {
		SheetNames: [sheetName],
		Sheets: {}
	};
	workbook.Sheets[sheetName] = sheet;
	// 生成excel的配置项
	var wopts = {
		bookType: 'xlsx', // 要生成的文件类型
		bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
		type: 'binary'
	};
	var wbout = XLSX.write(workbook, wopts);
	var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
	// 字符串转ArrayBuffer
	function s2ab(s) {
		var buf = new ArrayBuffer(s.length);
		var view = new Uint8Array(buf);
		for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}
	return blob;
}
const constant = {
  SIZE_TYPE: [{ text: '默认', value: 'medium'}, { text: '中等', value: 'small'}, { text: '紧凑', value: 'mini'}]
}
const Toolbar = {
  name: 'Toolbar',
  _menuType: [ 'rowSize', 'fullScreen', 'reload', 'setting', 'export'],
  props: {
    ctx: Object,
    ctxOptions: Object,
    menu: [Array, Boolean],
    fullscreenTarget: [Object],
    colMenu: {
      type: Array
    },
    renderPrepend: {
      type: [ String, Object, Function ],
      default: null
    },
    renderAppend: {
      type: [ String, Object, Function ],
      default: null
    }
  },
  data() {
    const { columns, colMenu } = this.ctx
    const defaultColMenu = columns.reduce((res, col) => {
      !col.type && col.prop && res.push(col.prop)
      return res
    }, [])
    return {
      innerColMenu: colMenu || defaultColMenu,
      exportLoading: false,
      checkedValue: [],
      indeterminate: false,
      checkAll: true
    }
  },
  watch: {
    checkedValue(newVal) {
      const { innerColMenu } = this
      const { columns } = this.ctx
      const count  = innerColMenu.length
      const checkedCount = newVal.length
      this.checkAll = count === checkedCount
      this.indeterminate = checkedCount > 0 && checkedCount < count
      this.ctx.innerColumns = columns.filter(item => {
        return !innerColMenu.includes(item.prop) || newVal.includes(item.prop)
      })
    }
  },
  methods: {
    renderSize({ tip, icon }) {
      const { SIZE_TYPE } = constant
      const { changeSize, ctx: { innerSize } } = this
      return (
        <el-dropdown onCommand={ changeSize }>
          <el-tooltip content={ tip } placement="top">
            <i class={`el-icon-${icon}`} />
          </el-tooltip>
          <el-dropdown-menu slot="dropdown">
            { SIZE_TYPE.map(item => <el-dropdown-item command={item.value} class={[ item.value === innerSize && 'current' ]}>{ item.text }</el-dropdown-item>) }
          </el-dropdown-menu>
        </el-dropdown>
      )
    },
    renderShowCol({ tip, icon }) {
      const { ctx, innerColMenu, indeterminate, handleCheckAll } = this
      const { wrapper } = ctx.$refs
      const columns = ctx.columns.filter(item => innerColMenu.includes(item.prop))
      return (
        <el-popover placement="bottom" trigger="hover" popper-options={{
          boundariesElement: wrapper
        }}>
          <el-tooltip content={tip} placement="top" slot="reference">
            <i class={`el-icon-${icon}`} />
          </el-tooltip>
          <div class="checkMenu">
            <el-checkbox class="checkMenu__all" indeterminate={ indeterminate } vModel={ this.checkAll } onChange={ handleCheckAll }>列展示</el-checkbox>
            { columns.map(item => <el-checkbox vModel={this.checkedValue} key={ item.prop } label={item.prop}>{ item.label }</el-checkbox> )}
          </div>
        </el-popover>
      )
    },
    renderExport({ tip, icon }) {
      const { calcSheetColumn, ctx, ctxOptions } = this
      const { pagination } = ctx
      const handleExport = () => calcSheetColumn({
        sourceData: ctx.innerData
      })
      const handleExportAll = () => {
        const { innerPagination: { total }, action, actionParams, usePreAction, $options } = ctx
        const isUsePre = usePreAction && typeof(ctxOptions.preAction) === 'function'
        const params = {
          ...actionParams,
          [ctxOptions.pageKey]: 1,
          [ctxOptions.pageSizeKey]: total
        }
        if (this.exportLoading) return
        this.exportLoading = true
        action(params).then(res=> {
          const result = isUsePre ? ctxOptions.preAction(res, pagination) : res
          calcSheetColumn({
            sourceData: result.data
          })
          this.exportLoading = false
        }).catch(() =>{
          this.exportLoading = false
        })
      }
      return (
        <el-popover placement="bottom" trigger="hover">
          <el-tooltip content={tip} placement="top" slot="reference">
            <i class={`el-icon-${icon}`} />
          </el-tooltip>
          <div class="hc-cell" onClick={ handleExport }><i class="el-icon-connection" />&nbsp;导出当前数据</div>
          { pagination && <div class="hc-cell" onClick={ handleExportAll }><i class={ this.exportLoading ? 'el-icon-loading' : 'el-icon-connection' } />&nbsp;导出所有数据</div> }
        </el-popover>
      )
    },
    handleCheckAll(val) {
      const { innerColMenu } = this
      this.checkedValue = val ? innerColMenu : [];
      this.indeterminate = false;
    },
    changeSize(val) {
      this.ctx.innerSize = val
    },
    calcSheetColumn(options = {}) {
      const { sourceData, fileName } = Object.assign({
        sourceData: [],
        fileName: '导出数据'
      }, options)

      const { ctx, innerColMenu } = this
      const columns = ctx.columns.filter(item => innerColMenu.includes(item.prop))
      const sheetData = []
      const sheetColumns = []
      let meterLevel = 0
      const recursion = function(list, rank=[], level=0, startIndex=null) {
        list.forEach((item, index) => {
          const { label, prop } = item
          if (item.children) {
            const _rank = [ ...rank, { label, prop } ]
            const _level = level + 1
            meterLevel = _level > meterLevel ? _level : meterLevel
            startIndex = index
            recursion(item.children, _rank, _level, startIndex)
          } else {
            const _item = { label, prop, level }
            if (rank.length) {
              _item.rank = rank
              _item.startIndex = startIndex
            }
            sheetColumns.push(_item)
          }
        })
      }
      const createSheetData = function() {
        const len = sheetColumns.length
        const row = Array(len).fill(null)
        for(let i = 0; i <= meterLevel; i++) {
          sheetData.push(
            sheetColumns.map((item, index) => {
              if (item.level === i) {
                return item.label
              } else if (item.rank && index === item.startIndex) {
                return item.rank[i].label
              } else {
                return null
              }
            })
          )
        }
      }
      recursion(columns)
      createSheetData()
      const rowKeys = sheetColumns.map(item => item.prop)
      sourceData.forEach(item => {
        sheetData.push(rowKeys.map(key => item[key]))
      })
      const sheet = XLSX.utils.aoa_to_sheet(sheetData)
      // sheet["!merges"] = [
      //   {s: {r: 0, c: 0}, e: {r: 1, c: 0}},
      //   {s: {r: 0, c: 1}, e: {r: 1, c: 1}},
      //   {s: {r: 0, c: 2}, e: {r: 0, c: 4}},
      //   {s: {r: 0, c: 5}, e: {r: 1, c: 5}}
      // ]
      openDownloadDialog(sheet2blob(sheet), `${fileName}.xlsx`)
    },
    handleFullscreen() {
      const { ctx, fullscreenTarget } = this
      const { wrapper } = ctx.$refs
      const target = fullscreenTarget || wrapper
      const isSupport = wrapper.requestFullscreen
      if (!isSupport) {
        this.$message.warning('当前设备不支持全屏功能')
        return
      }
      const isFullscreen = document.fullscreenElement
      isFullscreen ? document.exitFullscreen() : wrapper.requestFullscreen()
    }
  },
  mounted() {
    const { menu } = this
    if ((Array.isArray(menu) && menu.includes('export')) || (typeof(menu) === 'boolean' && menu)) {
      //XLSX = require('xlsx/dist/xlsx.core.min.js')
      asyncAsset('//cdn.bootcdn.net/ajax/libs/xlsx/0.16.4/xlsx.core.min.js').then(res => {
        XLSX = window.XLSX
      })
    }
    this.checkedValue = [ ...this.innerColMenu ]
  },
  render() {
    const { ctx, menu, renderSize, renderShowCol, handleFullscreen, renderPrepend, renderAppend, renderExport } = this
    const { $scopedSlots } = ctx
    const menuType = Toolbar._menuType
    let toolMenu = [
      { tip: '数据导出', type: menuType[4], icon: 'download', render: renderExport },
      { tip: '行密度', type: menuType[0], icon: 'c-scale-to-original', render: renderSize },
      { tip: '全屏', type: menuType[1], icon: 'full-screen', event: handleFullscreen },
      { tip: '刷新', type: menuType[2], icon: 'refresh', event: ctx.remoteData },
      { tip: '列设置', type: menuType[3], icon: 'setting', render: renderShowCol }
    ]
    if (Array.isArray(menu)) {
      toolMenu = toolMenu.filter(item => menu.includes(item.type))
    }
    const renderToolMenu = toolMenu.map(item => {
      const { tip, icon } = item
      const nativeOn = {
        click: item.event || null
      }
      const props = {
        placement: 'top',
        content: tip
      }
      const ToolItem = (
        <el-tooltip { ...{ nativeOn, props } } slot="reference">
          <i class={`el-icon-${icon}`} />
        </el-tooltip>
      )
      return item.render ? item.render({ tip, icon }) : ToolItem
    })
    const prependSlot = $scopedSlots['toolbar.prepend']
    const appendSlot = $scopedSlots['toolbar.append']
    const _RenderPrepend = prependSlot ? prependSlot() : getFunVNode(renderPrepend)
    const _RenderAppend = appendSlot ? appendSlot() : getFunVNode(renderAppend)
    return (
      <section class="toolbar">
        <div class="toolbar__title">
          { _RenderPrepend }
        </div>
        <div class="toolbar__option">
          { _RenderAppend }
          <el-divider direction="vertical" />
          <div class="toolbar__list">
            { renderToolMenu }
          </div>
        </div>
      </section>
    )
  }
}
export default Toolbar
</script>
<style>

.toolbar .toolbar__title {
  flex: 1;
}
.toolbar__option .el-divider {
  margin-left: 15px;
  margin-right: 0;
}
.el-dropdown-menu__item.current {
  color: #48a2ff;
}
.hc-cell {
  padding: 10px 16px;
  margin: 0 -12px;
  cursor: pointer;
}
.hc-cell >[class^=el-icon-] {
  margin-right: 8px;
  font-size: 18px;
}
.hc-cell:hover {
  color: #48a2ff;
  background-color: #ecf5ff;
}
.checkMenu {}
.checkMenu .el-checkbox {
  display: block;
  margin: 0;
  padding-bottom: 12px;
}
.checkMenu .checkMenu__all {
  margin: 0 -12px 12px -12px;
  padding: 0 12px 12px 12px;
  border-bottom: 1px solid #f0f0f0;
}
</style>