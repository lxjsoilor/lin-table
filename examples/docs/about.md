# VSearchbar介绍
VSearchbar组件是VTable的附带组件，用以展示表格的条件检索；但它本身不依赖于VTable，完全能单独使用，下面是VSearchbar的基本使用。

## 使用方式
```js
import Vue from 'vue';
import { VSearchbar } from '@tiger/VTable';

Vue.use(VSearchbar)
```

## 基本用法

### 自动布局
以scopeSlot的形式传入表单组件，并绑定数据。VSearchbar会自动对传入的表单组件进行栅格布局。

::: demo
```html
<template>
  <div>
    <HcVSearchbar v-model="actionParams" @query="handleQuery">
      <!--必须通过scopeSlot 传入表单项目-->
      <template v-slot:default>
        <el-form-item label="活动名称">
          <el-input v-model="actionParams.name" />
        </el-form-item>
        <el-form-item label="活动名称">
          <el-select v-model="actionParams.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </template>
    </HcVSearchbar>
  </div>
</template>

<script>
export default {
  name: 'demo1',
  data() {
    return {
      actionParams: {
        name: '',
        region: ''
      }
    }
  },

  methods: {
    handleQuery(params) {
      alert(JSON.stringify(params))
    }
  }
}
</script>
```
:::

<br><br>

当传入多个表单组件时，会自动对超过行数的组件进行折叠隐藏。默认折叠行数为1，可通过设置collapseRow属性进行调整需要显示的最大行数。
::: demo
```html
<template>
  <div>
    <HcVSearchbar v-model="actionParams" @query="handleQuery">
      <!--必须通过scopeSlot 传入表单项目-->
      <template v-slot:default>
        <el-form-item label="活动名称">
          <el-input v-model="actionParams.name" />
        </el-form-item>
        <el-form-item label="人数">
          <el-input v-model="actionParams.amount" />
        </el-form-item>
        <el-form-item label="条件1">
          <el-input v-model="actionParams.term" />
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker v-model="actionParams.date" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="活动名称">
          <el-select v-model="actionParams.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </template>
    </HcVSearchbar>
  </div>
</template>

<script>
export default {
  name: 'demo1',
  data() {
    return {
      actionParams: {
        name: '',
        region: ''
      }
    }
  },

  methods: {
    handleQuery(params) {
      alert(JSON.stringify(params))
    }
  }
}
</script>
```
:::

<br><br>

也可以设置col属性调整每个表单组件的栅格占据的列数，col属性为一个对象分别可设置xs、sm、md、lg、xl的列数数值。也可以在表单组件上定义col属性（值与HcVSearchbar的col值一致）来调整单个组件的栅格列数。
::: demo
```html
<template>
  <div>
    <HcVSearchbar v-model="actionParams" :collapseRow="0" :col="{ lg: 6 }" @query="handleQuery">
      <!--必须通过scopeSlot 传入表单项目-->
      <template v-slot:default>
        <el-form-item label="活动名称">
          <el-input v-model="actionParams.name" />
        </el-form-item>
        <el-form-item label="人数">
          <el-input v-model="actionParams.amount" />
        </el-form-item>
        <el-form-item label="条件1">
          <el-input v-model="actionParams.term" />
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker v-model="actionParams.date" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="活动名称" :col="{ lg: 12 }">
          <el-select v-model="actionParams.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </template>
    </HcVSearchbar>
  </div>
</template>

<script>
export default {
  name: 'demo1',
  data() {
    return {
      actionParams: {
        name: '',
        region: ''
      }
    }
  },

  methods: {
    handleQuery(params) {
      alert(JSON.stringify(params))
    }
  }
}
</script>
```
:::

<br><br>

### 与VTable组件一起使用
注意如果展示数据为带分页的，需要在传入分页页码的key到pageKey属性里。

::: demo
```html
<template>
  <div>
    <HcVSearchbar v-model="actionParams" pageKey="pageNo" @query="params => $refs['table'].remoteData(params)">
      <!--必须通过scopeSlot 传入表单项目-->
      <template v-slot:default>
        <el-form-item label="姓名">
          <el-input v-model="actionParams.name" />
        </el-form-item>
        </el-form-item>
      </template>
    </HcVSearchbar>
    <HcVTable :columns="columns" :actionParams="actionParams" :action="loadData" ref="table" />
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
    return {
      actionParams: {
        name: ''
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

<br><br>

## API

### Props
| 属性 | 描述 | 类型 | 默认值 |
| :------: | :------: | :------: | :------: |
| value / v-model | 绑定值 | Object | - |
| page-key | 如果检索的数据为带分页的，则需要带上分页页码的key。此prop主要是检索时调整原有页码为第一页 | String | - |
| collapse-row | 折叠隐藏子组件的行数 | Number | 1 |
| row | 内部Row组件的配置[详细查看](https://element.eleme.cn/#/zh-CN/component/layout#row-attributes) | Object | - |
| col | 响应式栅格数配置，分别传入xl, lg、md、sm、xs的栅格数 | Object | ```{ lg: 8, md: 8, sm: 12, xs: 24 }``` |
| label-position | 表单组件标签的位置，如果值为 left 或者 right 时，则需要设置 label-width | String | "left" |
| label-width | 作为HcVSearchbar直接子元素的 form-item 会继承该值。支持 auto | String | "70px" |

### Events
| 事件名 | 说明 | 回调参数 |
| :------: | :------: | :------: | :------: |
| query | 点击查询按钮时触发 | 绑定的value值 |
| reset | 点击重置按钮时触发 | 初次化传入value的值 |