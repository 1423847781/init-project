import request from "@/utils/request"; //导入封装请求的js文件
// 登录
export function login(data) {
    return request({
        url: "/api/user/login",
        method: "post",
        data
    });
}

// 退出登录
export function logout(params) {
    return request({
        url: "/api/user/logout",
        method: "get",
        params
    });
}

// 获取两定
export function getTwoRecords(params) {
    return request({
        url: "/api/collect-two-records/get",
        method: "get",
        params
    });
}

// 更新两定
export function updateRecords(data) {
    return request({
        url: "/api/collect-two-records/update",
        method: "post",
        data
    });
}

// 获取四定
export function getFourRecords(params) {
    return request({
        url: "/api/collect-four-records/get",
        method: "get",
        params
    });
}

//清空两定/四定
export function clearRecords(params) {
    return request({
        url: "/api/betting-records/clear",
        method: "get",
        params
    });
}

// 添加两定/四定
export function betRecords(data) {
    return request({
        url: "/api/betting-records/bet",
        method: "post",
        data
    });
}

// 修改密码
export function editPassword(data) {
    return request({
        url: "/api/user/update/pwd",
        method: "post",
        data
    });
}

// 获取标签列表
export function getTagList() {
    return request({
        url: "/api/user/get/tag",
        method: "get",
    });
}

// 添加标签
export function addTag(data) {
    return request({
        url: "/api/user/add/tag",
        method: "post",
        data
    });
}

// 设置最大组数
export function setMaxRecord(data) {
    return request({
        url: "/api/max-record/set",
        method: "post",
        data
    });
}

// 获取最大组数
export function getMaxRecord(params) {
    return request({
        url: "/api/max-record/get/max",
        method: "get",
        params
    });
}