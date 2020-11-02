module.exports = {
  devServer: {
    port: 8900,
    disableHostCheck: true
  },

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
