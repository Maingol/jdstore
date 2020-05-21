<template>
  <!-- 布局容器 -->
  <el-container>
    <!-- 布局头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 布局侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="handleCollapse">|||</div>
        <!-- 菜单列表 -->
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#3899FF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activeIndex">
          <!-- 下拉菜单 -->
          <!-- 必须指定index属性，这里需要在index前加上冒号进行属性绑定，
          而且index属性只接受字符串，所以这里在值后面加上了一个空字符串 -->
          <el-submenu :index="item.id+''" :key="item.id" v-for="item in menus.data">
            <!-- 一级菜单 -->
            <template slot="title">
              <i :class="'iconfont '+iconfonts[item.order]"/>
              <span slot="title">{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="v.path" :key="v.id" v-for="v in item.children" @click="saveIndex(v.path)">
              <i class="el-icon-menu"></i>
              <span slot="title">{{v.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      /* 服务器返回的菜单列表数据 */
      menus: {},
      /* 一级菜单前的图标名称 */
      iconfonts: {
        1: 'icon-users',
        2: 'icon-cube',
        3: 'icon-shangpin',
        4: 'icon-danju',
        5: 'icon-baobiao'
      },
      isCollapse: false,
      /* el-menu中default-active属性绑定的变量 */
      activeIndex: ''
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    /* 点击左侧菜单栏折叠按钮后触发的函数 */
    handleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    /* 点击二级菜单后保存当前激活菜单的index */
    saveIndex (index) {
      this.activeIndex = index
      window.sessionStorage.setItem('active-index', index)
    }
  },
  /* 页面刚一加载时，就发请求获取菜单列表 */
  async created () {
    const res = await this.$http({
      url: 'menus',
      method: 'get'
    })
    if (res.meta.status !== 200) {
      this.$message.error(res.meta.msg)
    } else {
      this.menus = res
    }
    /* 每次页面加载时取出sessionstorge中的index赋值给activeIndex */
    this.activeIndex = window.sessionStorage.getItem('active-index')
  }
}
</script>

<style lang="less" scoped>
  .el-container{
    height: 100%;
    margin: 0;
    padding: 0;
  }
  .el-header{
    background-color: #363D40;
    display: flex;
    // 两边分布
    justify-content: space-between;
    // 垂直居中
    align-items: center;
    // 头像贴近左侧
    padding-left: 0;
    // 调整字体样式
    font-size: 20px;
    color: white;
    div {
      display: flex;
      align-items: center;
      span{
        margin-left: 15px;
      }
    }
  }
  .el-aside{
    background-color: #313743;
    .iconfont{
      /*margin-left: 5px;*/
      margin-right: 10px;
    }
    .el-menu{
      border-right: none;
    }
    .toggle-button{
      /* 设置div的背景色 */
      background-color: #475163;
      /* 设置div内字体的颜色 */
      color: white;
      /* 设置div内字体的大小 */
      font-size: 12px;
      /* 设置div的高度 */
      line-height: 24px;
      /* 设置div内的文本居中对齐 */
      text-align: center;
      /* 设置div内文本字符之间的间距 */
      letter-spacing: 0.2em;
      /* 设置鼠标悬停时鼠标样式为小手 */
      cursor: pointer;
    }
  }
  .el-main{
    background-color: #E9EDF0;
  }
</style>
