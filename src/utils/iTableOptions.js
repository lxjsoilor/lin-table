export function oneOf (value, validList) {
  for (let i = 0; i < validList.length; i++) {
      if (value === validList[i]) {
          return true;
      }
  }
  return false;
}
export const props = {
  data: {
    type: Array,
    default () {
        return [];
    }
  },
  columns: {
      type: Array,
      default () {
          return [];
      }
  },
  size: {
      validator (value) {
          return oneOf(value, ['small', 'large', 'default']);
      },
      default () {
          return !this.$IVIEW || this.$IVIEW.size === '' ? 'default' : this.$IVIEW.size;
      }
  },
  width: {
      type: [Number, String]
  },
  height: {
      type: [Number, String]
  },
  // 3.4.0
  maxHeight: {
      type: [Number, String]
  },
  stripe: {
      type: Boolean,
      default: false
  },
  border: {
      type: Boolean,
      default: false
  },
  showHeader: {
      type: Boolean,
      default: true
  },
  highlightRow: {
      type: Boolean,
      default: false
  },
  rowClassName: {
      type: Function,
      default () {
          return '';
      }
  },
  context: {
      type: Object
  },
  noDataText: {
      type: String
  },
  noFilteredDataText: {
      type: String
  },
  disabledHover: {
      type: Boolean
  },
  loading: {
      type: Boolean,
      default: false
  },
  draggable: {
      type: Boolean,
      default: false
  },
  tooltipTheme: {
      validator (value) {
          return oneOf(value, ['dark', 'light']);
      },
      default: 'dark'
  },
  // #5380 开启后，:key 强制更新，否则使用 index
  // 4.1 开始支持 String，指定具体字段
  rowKey: {
      type: [Boolean, String],
      default: false
  },
  // 4.0.0
  spanMethod: {
      type: Function
  },
  // 4.0.0
  showSummary: {
      type: Boolean,
      default: false
  },
  // 4.0.0
  summaryMethod: {
      type: Function
  },
  // 4.0.0
  sumText: {
      type: String
  },
  // 4.1.0
  indentSize: {
      type: Number,
      default: 16
  },
  // 4.1.0
  loadData: {
      type: Function
  },
  // 4.1.0
  contextMenu: {
      type: Boolean,
      default: false
  },
  // 4.2.0
  showContextMenu: {
      type: Boolean,
      default: false
  }
}