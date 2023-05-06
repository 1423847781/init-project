<template>
  <el-form
    :model="loginForm"
    :rules="rules2"
    ref="loginForm"
    label-position="left"
    label-width="0px"
    class="demo-ruleForm login-container"
  >
    <h3 class="title">系统登录</h3>
    <el-form-item prop="account">
      <el-input
        type="text"
        v-model="loginForm.account"
        auto-complete="off"
        placeholder="账号"
        clearable
      ></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        type="password"
        v-model="loginForm.password"
        auto-complete="off"
        placeholder="密码"
        clearable
      ></el-input>
    </el-form-item>
    <el-form-item style="width: 100%">
      <el-button
        type="primary"
        style="width: 100%"
        @click.native.prevent="handleSubmit2"
        v-loading="loading"
        >登录</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script>
import { login } from "@/api/index";
import md5 from "js-md5";
export default {
  data() {
    return {
      loading: false,
      loginForm: {
        account: "",
        password: "",
      },
      rules2: {
        account: [{ required: true, message: "请输入账号", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
    };
  },
  methods: {
    handleSubmit2() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          this.loginForm.password = md5(this.loginForm.password);
          console.log(this.loginForm);
          const res = await login(this.loginForm);
          if (res.code == 200) {
            this.loading = false;
            this.$message({
              message: res.message,
              type: "success",
            });
            sessionStorage.setItem("apiToken", res.data.token);
            sessionStorage.setItem("userInfo", JSON.stringify(res.data));
            this.$router.push({ path: "/twoRecords" });
          } else {
            this.loading = false;
            this.$message({
              message: res.message,
              type: "error",
            });
          }
        } else {
          this.loading = false;
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  margin: 180px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  .title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }
  .remember {
    margin: 0px 0px 35px 0px;
  }
}
</style>
