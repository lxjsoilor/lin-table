# VTable介绍
vTiger/VTable是开箱即用的 Table 组件，在element Table 之上扩展了更多便捷易用的功能。以减少日常开发中重复的工作，提升开发类table业务的效率。
使用VTable组件需要在本地上添加flyTiger的内部私服npm源，添加步骤可参考： [前端私服介绍](http://wiki.hucais.com/pages/viewpage.action?pageId=19792552)

```shell
npm install @tiger/v-table
```

## 使用方式
```js
import Vue from 'vue';
import { VTable } from '@tiger/VTable';

Vue.use(VTable, {
  // 以下为默认值
  pageKey: 'pageNo', // 设定请求页码参数的key值
  pageSizeKey: 'pageSize', // 设定请求页数参数的key值
  pagination: {}, // vTable组件的默认分页配置
  /**
   * 处理请求函数返回的响应数据
   * @param {Object} res - action函数的返回内容
   * @param {Boolean} paging - 用以区分带分页的数据与列表数据
   * @return {Object} - 根据响应数据 手动返回数据对象{ page[Number]: 页面, total[Number]: 总条数, data[Array]: 传给表格的列表数据 }
   **/
  preAction(res, paging) {
    // （示例）需根据实际响应数据返回
    if (paging) {
      const { pageNo: page, total, list:data } = res.data.result
      return {
        page, total, data
      }
    } else {
      return res.data.result
    }
  }
});
```

## 基本用法

### 展示分页数据
设定```columns```数据和```action```请求方法，即可生成带数据请求的分页表单。<br>
::: tip 注意
- 其中表格中的列是通过```columns```数组生成，每项列数据字段与Element的[Table-column组件Props属性](https://element.eleme.cn/#/zh-CN/component/table#table-column-attributes)相对应。<br>
- 对于传入数据请求的action方法，要求必须返回一个Promise函数，VTable会在mounted阶段去执行它并在返回响应时调用 **preAction** 方法去获取所需求的表格数据和分页信息。
:::

::: demo
```html
<template>
  <div>
    <HcVTable :columns="columns" :action="loadData" />
  </div>
</template>

<script>
export default {
  name: 'demo1',
  data() {
    this.columns = [
      {
        prop: 'date',
        label: '日期',
        width: 120
      },
      {
        prop: 'name',
        label: '姓名',
        width: 90
      },
      {
        prop: 'address',
        label: '地址'
      }
    ]
    return {}
  },
  methods: {
    loadData(params) {
      return axios.get('//192.172.9.142:3000/mock/8/text/user/list', { params })
    }
  }
}
</script>
```
:::

### 列表数据
有时候我们可能需要展示非分页的列表数据。

::: demo
```html
<template>
  <div>
    <HcVTable :columns="columns" :action="handleAction" :pagination="null" />
  </div>
</template>

<script>
export default {
  name: 'demo2',
  data() {
    this.columns = [
      {
        prop: 'name',
        label: '产品',
      },
      {
        prop: 'amount',
        label: '数量'
      }
    ]
    return {}
  },
  methods: {
    handleAction() {
      return axios.get('//192.172.9.142:3000/mock/8/text/products')
    }
  }
}
</script>
```
:::

## 行多选
通过给```columns```数据添加type为```selection```的项，并在v-table中监听```selection-change```事件获取选中行数据。操作与原el-table一致。

::: demo
```html
<template>
  <div>
    <div>已选择名称：{{ selectedName }}</div>
    <HcVTable :columns="columns" :action="loadData" @selection-change="handleSelection" />
  </div>
</template>

<script>
export default {
  name: 'demo5',
  data() {
    this.columns = [
      {
        type: 'selection',
        align: 'center',
        width: 80
      },
      {
        prop: 'date',
        label: '日期',
        width: 120
      },
      {
        prop: 'name',
        label: '姓名',
        width: 90
      },
      {
        prop: 'address',
        label: '地址'
      },
      {
        prop: 'action',
        label: '操作',
        width: 120
      },
    ]
    return {
      selectedName: []
    }
  },
  methods: {
    handleSelection(val) {
      this.selectedName = val.map(item => item.name)
    },
    loadData(params) {
      return axios.get('//192.172.9.142:3000/mock/8/text/user/list', { params })
    }
  }
}
</script>
```
:::

## 排序
通过给columns数据需要排序的项中添加```sortable```属性，即可在当前列进行静态化的排序。如果需要后端排序，需将```sortable```设置为```custom```，同时在 vTable 上监听```sort-change```事件，在事件回调中可以获取当前排序的字段名和排序顺序，传递有关参数并调用vTable的```remoteData```方法请求排序后的表格数据。

::: demo
```html
<template>
  <div>
    <HcVTable :columns="columns" :action="loadData" :default-sort="{prop: 'date', order: 'descending'}" />
  </div>
</template>

<script>
export default {
  name: 'demo6',
  data() {
    this.columns = [
      {
        prop: 'date',
        label: '日期',
        sortable: true,
        width: 120
      },
      {
        prop: 'name',
        label: '姓名',
        width: 90
      },
      {
        prop: 'address',
        label: '地址'
      }
    ]
    return {
    }
  },
  methods: {
    loadData(params) {
      return axios.get('//192.172.9.142:3000/mock/8/text/user/list', { params })
    }
  }
}
</script>
```
:::

## 自定义列模板
通过```columns```数据的prop字段去给VTable组件增加作用域插槽，来实现原有table-column组件的自定义列模板。
::: demo
```html
<template>
  <div>
    <HcVTable :columns="columns" :action="loadData" :pagination="pagination">
      <!--展开行模板-->
      <template v-slot:expandProp="{ row, $index }">
        {{ $index + ':' + row.address }}
      </template>
      <!--自定义列模板-->
      <template v-slot:name="{ row, $index }">
        {{ row.name + $index }}
      </template>
      <template v-slot:action>
        <el-button>编辑</el-button>
      </template>
      <!--自定义表头-->
      <template #address.header>
        <el-input size="mini" placeholder="输入关键字搜索"/>
      </template>
      <!--表格插槽 append-->
      <template #table.append>
        Table Slot append: 插入至表格最后一行之后的内容，如果需要对表格的内容进行无限滚动操作，可能需要用到这个 slot。若表格有合计行，该 slot 会位于合计行之上。
      </template>
    </HcVTable>
  </div>
</template>

<script>
export default {
  name: 'demo3',
  data() {
    this.columns = [
      {
        prop: 'expandProp',
        label: '展开行',
        width: 120,
        type: "expand"
      },
      {
        prop: 'date',
        label: '日期',
        width: 120
      },
      {
        prop: 'name',
        label: '姓名',
        width: 90
      },
      {
        prop: 'address',
        label: '地址'
      },
      {
        prop: 'action',
        label: '操作',
        width: 120
      },
    ]
    return {
      // 设置默认的pagination属性，值与原有的一致：https://element.eleme.cn/#/zh-CN/component/pagination#attributes
      pagination: {
        pageSize: 3
      }
    }
  },
  methods: {
    loadData(params) {
      return axios.get('//192.172.9.142:3000/mock/8/text/user/list', { params })
    }
  }
}
</script>
```
:::

## 多级表头
原有element实现多级表头是通过嵌套el-table-column实现的，而VTable则通过```columns```数据中添加```children```字段来生产多级表头。

::: demo
```html
<template>
  <div>
    <HcVTable :columns="columns" :action="loadData" :pagination="pagination" />
  </div>
</template>

<script>
export default {
  name: 'demo3',
  data() {
    this.columns = [
      {
        prop: 'date',
        label: '日期',
        width: 120
      },
      {
        prop: 'name',
        label: '姓名',
        width: 90
      },
      {
        prop: 'address',
        label: '地址',
        children: [
          {
            prop: 'province',
            label: '省'
          },
          {
            prop: 'city',
            label: '市'
          },
          {
            prop: 'district',
            label: '区'
          }
        ]
      },
      {
        prop: 'action',
        label: '操作',
        width: 120
      },
    ]
    return {
      // 设置默认的pagination属性，值与原有的一致：https://element.eleme.cn/#/zh-CN/component/pagination#attributes
      pagination: {
        pageSize: 4
      }
    }
  },
  methods: {
    loadData(params) {
      return axios.get('//192.172.9.142:3000/mock/8/text/user/list', { params })
    }
  }
}
</script>
```
:::

## 工具栏
通过添加```toolbar```属性为表格增加工具栏，```toolbar```可传递一个数据（```['export', 'rowSize', 'fullScreen', 'reload', 'setting']```）来控制显示的工具菜单。通过传入```[toolbarConfig属性](#toolbarconfig)```来对工具栏进行一些配置。

::: demo
```html
<template>
  <div>
    <HcVTable :columns="columns" :action="loadData" toolbar :toolbarConfig="toolbarConfig"  />
  </div>
</template>

<script>
export default {
  name: 'demo6',
  data() {
    this.columns = [
      {
        prop: 'date',
        label: '日期',
        sortable: true,
        width: 120
      },
      {
        prop: 'name',
        label: '姓名',
        width: 90
      },
      {
        prop: 'address',
        label: '地址'
      }
    ]
    this.toolbarConfig = {
      renderPrepend: <el-tag>标签一</el-tag>,
      renderAppend: () => <el-button icon="el-icon-plus" type="primary" size="small">新建</el-button>
    }
    return {
    }
  },
  methods: {
    loadData(params) {
      return axios.get('//192.172.9.142:3000/mock/8/text/user/list', { params })
    }
  }
}
</script>
```
:::

<br>

## API
VTable 在 element 的 table 上进行一层封装，支持原有table组件的功能上增加了一些预设，并且封装了一些行为。其中通过拦截table的```data```属性去实现组件内部的数据请求。这里只列出与 element table 不同的 api。

### Props
保留Table组件[原有Props](https://element.eleme.cn/#/zh-CN/component/table#table-attributes)上，增加并变更下列属性：
| 属性 | 描述 | 类型 | 默认值 |
| :------: | :------: | :------: | :------: |
| ~~data~~ | 废弃原Table组件的date属性，由VTable内部维护 | - | - |
| columns | 表格列的配置描述，***新增children属性来设置多级表单*** ，其他具体项见 [element文档](https://element.eleme.cn/#/zh-CN/component/table#table-column-attributes) | Array | - |
| pagination | 分页配置选项，具体项见 [element文档](https://element.eleme.cn/#/zh-CN/component/pagination#attributes) | Object | ```{background: true, layout: 'prev, pager, next', pageSize: 10, currentPage: 1, total: 0}``` |
| usePreAction | 使用请求预处理，默认会优先调用插件选项的preAction函数对响应数据进行处理 | ```Boolean``` | ```true``` |
| action | 表格数据请求方法 | Function:```(params: U) => Promise``` | - |
| toolbar | 是否显示表格工具栏，可传入数组```['rowSize', 'fullScreen', 'reload', 'setting']```配置工具栏按钮数量 | Boolean, Array | ```false``` |
| toolbarConfig | 表格工具栏选项，详情可查看 | Object | {} |

### Events
保留Table组件[原有事件](https://element.eleme.cn/#/zh-CN/component/table#table-events)上，增加下列事件：
| 事件名 | 说明 | 回调参数 |
| :------: | :------: | :------: | :------: |
| remoteSuccess | action方法resolve执行后触发 | 响应数据 |
| remoteFail | action方法reject执行后触发 | 错误信息 |

### Methods
执行Table组件[原有方法](https://element.eleme.cn/#/zh-CN/component/table#table-methods),可通过```this.$refs[RefName].$native```获取，下列是VTable自身提供的方法
| 方法名 | 说明 | 参数 |
| :------: | :------: | :------: | :------: |
| remoteData | VTable组件内部的数据请求方法，通过此方法可手动触发表格更新或数据检索等数据数据请求 | options:数据请求携带的参数 |

### Scoped Slot
| 插槽名 | 说明 | 参数 |
| :------: | :------: | :------: |
| - | 自定义列的内容 | { row, column, $index } |
| table.prepend | 插入至表格头前的内容，如需要添加VSearchbar组件或者防止一些功能菜单可能需要用到这个 scoped-slot。 | - |
| table.append | 插入至表格最后一行之后的内容，如果需要对表格的内容进行无限滚动操作，可能需要用到这个 scoped-slot。若表格有合计行，该 scoped-slot 会位于合计行之上。 | - |

### toolbarConfig
| 属性 | 描述 | 类型 |
| :------: | :------: | :------: |
| colMenu | 列设置的下拉菜单配置，传递columns数据的prop名的数组 | Array |
| fullscreenTarget | 全屏显示的区域，默认为vTable的根节点 | HTMLDocument |
| renderPrepend | 渲染toolbar的前置内容，相当于toolbar的插槽 | VNode | Function |
| renderAppend | 渲染toolbar的后置内容，相当于toolbar的插槽 | VNode | Function |