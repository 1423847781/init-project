const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    devServer: {
        proxy: {
            "/api": {
                target: "http://8.134.175.208:8001",
                changeOrigin: true, // 允许跨域请求
                logLevel: 'debug',
                pathRewrite: {
                    // 重写路径，替换请求地址中的指定路径
                    "^/api": "/", // 将请求地址中的/api替换为空，也就是请求地址中不会包含/api/
                },
            },
        },
    },
})