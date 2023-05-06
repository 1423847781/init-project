import axios from 'axios'
import { Message, MessageBox } from 'element-ui' //导入element-ui组件库

// 创建axios的对象
const instance = axios.create({
    baseURL: "/", //配置固定域名
    timeout: 5000
})

// 请求拦截
// 所有的网络请求都会走这个方法,可以在请求添加自定义内容
instance.interceptors.request.use(
    function(config) {
        config.headers.token = sessionStorage.getItem('apiToken');
        return config
    },
    function(err) {
        return Promise.request(err)
    }
)

// 响应拦截
// 此处可以根据服务器返回的状态码做相应的数据
instance.interceptors.response.use(
    function(response) {
        const res = response
        console.log(res)
        if (res.status == 200) {
            return res.data
        } else {
            debugger
            return res
        }
    },
    function(err) {
        return err
            // return Promise.request(err)
    }
)

// 封装get和post请求
export function get(url, params) {
    return instance.get(url, { params })
}

export function post(url, data) {
    return instance.post(url, data)
}

export default instance;