import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from  '../views/Index.vue'

import Detail from '../views/Index/Detail.vue'
import Report from '../views/Index/Report.vue'

Vue.use(VueRouter)

  const routes = [
    {
      path: '/',
      name: 'index',
      component: Index,
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
  routes
})

export default router
