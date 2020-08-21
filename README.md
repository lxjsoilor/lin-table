
# vTiger/VTable
## VTable介绍
vTiger/VTable是开箱即用的 Table 组件，在element Table 之上扩展了更多便捷易用的功能。为了解决项目中需要写很多 table 的样板代码的问题，所以在其中做了封装了很多常用的逻辑来提升开发类table业务的效率。

在 element-ui 的中写一个 table 免不了需要定义一些 state，比如 page，pageNumber，pageSize。如果使用原有el-table的功能可能还需要写很多样板代码来请求数据。但是很多时候这些行为是高度雷同的，所以 vTable 默认封装了请求网络，翻页，搜索和筛选的逻辑。

### 以下为封装的预设行为与预设逻辑
- 提供便捷简单的表格数据请求方式
- 自动与数据请求联动的分页功能
- 数据驱动的列配置，把原有较为复杂的以组件形式生成的列配置通过数据配置来映射，并在 element 的基础上进行了一些封装。
- 查询表单，提供配套的查询组件以处理表格数据筛选的功能。并对查询的表单组件进行自适应排版处理，通过简单的配置和api调用即可完成查询功能。
- 更丰富的自定义表单项，除了element默认提供表格的插槽外，还新增了prepend插槽、toolbar插槽等自定义插槽功能，来满足表格组件大部分的功能展示。
- 操作栏，操作栏可以承载一些常用的操作或者表格的标题以及其他有关表格信息的展示。并提供renderPrepend，renderAppend的渲染方法去自定义的内容。

## Install
使用VTable组件需要在本地上添加flyTiger的内部私服npm源，添加步骤可参考： [前端私服介绍](http://wiki.hucais.com/pages/viewpage.action?pageId=19792552)
```
npm install @tiger/v-table
```
## Usage
查看 [VTable使用文档](http://front-end.flytiger.net/tiger_table/)