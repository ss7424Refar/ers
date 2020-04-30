import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from  '../views/Index.vue'

import Detail from '../views/Index/Detail.vue'

Vue.use(VueRouter)

  const routes = [
    {
      path: '/',
      name: 'index',
      component: Index,
      // 如果是'/', index中的router-view会是空白. 需要重定向, 不是很明白..
      redirect: '/detail',
      children:[
        {
          path:'detail',
          name: 'detail',
          component: Detail
        },    //定义默认显示子组件
        {
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          path:'report',
          name: 'report',
          component: function () {
            return import('../views/Index/Report.vue')
          }
        }
      ]
    }
]

const router = new VueRouter({
  // mode: 'history', // 这个还需要后端的支持, 太麻烦了.
  // base: process.env.BASE_URL,
  routes
})

export default router
