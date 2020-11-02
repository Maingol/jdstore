import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login')
// import Home from '../components/Home'
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home')
// import Welcome from '../components/Welcome'
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome')

// import Users from '../components/users/Users'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/users/Users')
// import Rights from '../components/power/Rights'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights')
// import Roles from '../components/power/Roles'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles')

// import Cate from '../components/goods/Cate'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate')
// import Params from '../components/goods/Params'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params')

// import GoodsList from '../components/goods/List'
const GoodsList = () => import(/* webpackChunkName: "GoodsList_AddGoods" */ '../components/goods/List')
// import AddGoods from '../components/goods/AddGoods'
const AddGoods = () => import(/* webpackChunkName: "GoodsList_AddGoods" */ '../components/goods/AddGoods')

// import Order from '../components/order/Order'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order')
// import Report from '../components/report/Report'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/add-goods', component: AddGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 表示将要访问的路径
  // from 代表由哪个路径跳转而来
  // next 是一个函数，表示放行
  //    next放行方式有两种：1、next()  2、next('/login') 强制跳转
  if (to.path === '/login') {
    next()
  } else {
    // 查看sessionstorage中是否有token
    const tokenStr = window.sessionStorage.getItem('token')
    if (tokenStr) {
      // token不为空，放行
      next()
    } else {
      // token为空，跳转至登陆页面
      next('/login')
      Vue.prototype.$message.error('您没有登陆或登陆时效已过期,请重新登陆')
    }
  }
})
export default router
