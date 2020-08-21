<script>
function getFunVNode(val) {
  return typeof(val) === 'function' ? val() : val
}
const constant = {
  SIZE_TYPE: [{ text: '宽松', value: 'large'}, { text: '默认', value: 'default'}, { text: '紧凑', value: 'small'}]
}
const Toolbar = {
  name: 'Toolbar',
  _menuType: [ 'rowSize', 'fullScreen', 'reload', 'setting'],
  props: {
    ctx: Object,
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
      !col.type && col.key && res.push(col.key)
      return res
    }, [])
    return {
      innerColMenu: colMenu || defaultColMenu,
      checkedValue: colMenu || defaultColMenu,
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
        return !innerColMenu.includes(item.key) || newVal.includes(item.key)
      })
    }
  },
  methods: {
    renderSize({ tip, icon }) {
      const { SIZE_TYPE } = constant
      const { changeSize, ctx: { innerSize } } = this
      return (
        <Dropdown onOn-click={ changeSize }>
          <Tooltip content={ tip } placement="top">
            <Icon type={ icon } size={24} />
          </Tooltip>
          <DropdownMenu slot="list">
            { SIZE_TYPE.map(item => <DropdownItem name={item.value} class={[ item.value === innerSize && 'current' ]}>{ item.text }</DropdownItem>) }
          </DropdownMenu>
        </Dropdown>
      )
    },
    renderShowCol({ tip, icon }) {
      const { ctx, innerColMenu, indeterminate, handleCheckAll } = this
      const { wrapper } = ctx.$refs
      const columns = ctx.columns.filter(item => innerColMenu.includes(item.key))
      return (
        <Poptip placement="top-end" trigger="click" popper-class="showColPoptip">
          <Tooltip content={tip} placement="top">
            <Icon type={ icon } size={24} />
          </Tooltip>
          <Checkbox slot="title" class="checkMenu__all" indeterminate={ indeterminate } vModel={ this.checkAll } onOn-change={ handleCheckAll }>列展示</Checkbox>
          <div class="checkMenu" slot="content">
            <CheckboxGroup vModel={this.checkedValue}>
              { columns.map(item => <Checkbox key={ item.key } label={item.key}>{ item.title }</Checkbox> )}
            </CheckboxGroup>
          </div>
        </Poptip>
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
    // const { columns } = this.ctx
    // this.checkedValue = columns.map(item => item.prop)
  },
  render() {
    const { ctx, menu, renderSize, renderShowCol, handleFullscreen, renderPrepend, renderAppend } = this
    const menuType = Toolbar._menuType
    const { $scopedSlots } = ctx
    let toolMenu = [
      { tip: '行密度', type: menuType[0], icon: 'md-funnel', render: renderSize },
      { tip: '全屏', type: menuType[1], icon: 'md-expand', event: handleFullscreen },
      { tip: '刷新', type: menuType[2], icon: 'md-refresh', event: ctx.remoteData },
      { tip: '列设置', type: menuType[3], icon: 'md-settings', render: renderShowCol }
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
        <Tooltip { ...{ nativeOn, props } }>
          <Icon type={ icon } size={24} />
        </Tooltip>
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
          <Divider type="vertical" />
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
.toolbar__list .ivu-icon{
  cursor: pointer;
  margin-left: 15px;
}
.toolbar__option .ivu-divider {
  margin: 0 0 0 15px;
}
.ivu-dropdown-item.current {
  color: #48a2ff;
}

.ivu-checkbox-group-item {
  display: block;
  padding: 0 0 10px 0;
}
</style>