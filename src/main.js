import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'
import router from './router'

import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
    if (to.path == '/login') {
        sessionStorage.removeItem('userInfo');
    }
    let user = JSON.parse(sessionStorage.getItem('userInfo'));
    console.log(user)
    if (!user && to.path != '/login') {
        next({ path: '/login' })
    } else {
        next()
    }
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')