import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Table1 from '../views/nav1/Table1.vue'
import Table2 from '../views/nav1/Table2.vue'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const routes = [{
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '统计',
        iconCls: 'el-icon-data-analysis',
        children: [
            { path: '/twoRecords', component: Table1, name: '两定' },
            { path: '/fourRecords', component: Table2, name: '四定' },
        ]
    },
]

const router = new VueRouter({
    routes
})

export default router