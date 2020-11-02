module.exports = {
  devServer: {
    port: 8900,
    disableHostCheck: true
  },

  // 删除打包时生成的那些js.map文件
  /* 参考网址：https://blog.csdn.net/Future1994/article/details/84943245?utm_medium=
  distribute.pc_relevant.none-task-blog-title-6&spm=1001.2101.3001.4242 */
  productionSourceMap: process.env.NODE_ENV !== 'production',

  chainWebpack: config => {
    // 产品发布阶段
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')

      // 使用externals设置排除项
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 向html插件中增加一个属性，用于判断是否向页面渲染特定内容
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    // 产品开发阶段
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      // 向html插件中增加一个属性，用于判断是否向页面渲染特定内容
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
