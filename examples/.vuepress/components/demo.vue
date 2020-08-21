<template>
  <hc-xtable :data="tableData" v-bind="{ columns }">
    <template v-slot:name="{ row, $index }">
        {{ row.name + $index }}
    </template>
    <template v-slot:action="{ row, $index }">
        <el-button>11</el-button>
    </template>
  </hc-xtable>
</template>

<script>
export default {
  name: 'demo',
  props: {

  },
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
      },
      {
        prop: 'action',
        label: '操作'
      }
    ]
    return {
      tableData: [
        {
          date: '2016-05-02',
          name: '王小虎',
          province: '上海',
          city: '普陀区',
          address: '上海市普陀区金沙江路 1518 弄',
          zip: 200333,
          tag: '家'
        }, {
          date: '2016-05-04',
          name: '王小虎',
          province: '上海',
          city: '普陀区',
          address: '上海市普陀区金沙江路 1517 弄',
          zip: 200333,
          tag: '公司'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          province: '上海',
          city: '普陀区',
          address: '上海市普陀区金沙江路 1519 弄',
          zip: 200333,
          tag: '家'
        }, {
          date: '2016-05-03',
          name: '王小虎',
          province: '上海',
          city: '普陀区',
          address: '上海市普陀区金沙江路 1516 弄',
          zip: 200333,
          tag: '公司'
        }
      ],
    }
  },
  methods: {

  }
}
</script>