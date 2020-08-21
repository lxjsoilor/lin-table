const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  title: 'VTiger',
  base: '/tiger_table/',
  description: 'Just playing around',
  port: 9000,
  head: [
    ['script', { src: 'https://cdn.bootcdn.net/ajax/libs/axios/0.19.2/axios.js' }]
  ],
  plugins: [
    ['vue-demo']
  ],
  themeConfig: {
    displayAllHeaders: true, // 默认值：false
    // 添加导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/docs/' },
      { text: 'Gitlab', link: 'http://git.hucais.com/hucais-frontend/tiger-vtable' },
      // {
      //   text: '选择语言',
      //   // 这里是下拉列表展现形式。
      //   items: [
      //     { text: 'English', link: '/english' },
      //     { text: '中文', link: '/docs/' },
      //   ]
      // }
    ],
    // 为以下路由添加侧边栏
    sidebar: {
      '/docs/': [
        '',
        'about',
        // {
        //   title: 'CSS知识库',
        //   collapsable: true,
        //   children: [
        //     'vue/one', 'vue/two'
        //   ]
        // }
      ],
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
}