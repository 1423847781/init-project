<template>
  <el-row class="container">
    <el-col :span="24" class="header">
      <el-col
        :span="10"
        class="logo"
        :class="collapsed ? 'logo-collapse-width' : 'logo-width'"
      >
        {{ collapsed ? "" : sysName }}
      </el-col>
      <el-col :span="10">
        <div class="tools" @click.prevent="collapse">
          <i :class="collapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div>
      </el-col>
      <el-col :span="4" class="userinfo">
        <el-dropdown trigger="hover">
          <span class="el-dropdown-link userinfo-inner"
            ><img :src="sysUserAvatar" /> {{ sysUserName || "admin" }}</span
          >
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="dialogVisible = true"
              >修改密码</el-dropdown-item
            >
            <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-col>
    <el-col :span="24" class="main">
      <aside :class="collapsed ? 'menu-collapsed' : 'menu-expanded'">
        <!--导航菜单-->
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          unique-opened
          router
          v-if="!collapsed"
        >
          <template v-for="(item, index) in $router.options.routes" v-if="!item.hidden">
            <el-submenu :index="index + ''" v-if="!item.leaf">
              <template slot="title"
                ><i :class="item.iconCls"></i>{{ item.name }}</template
              >
              <el-menu-item
                v-for="child in item.children"
                style="min-width: 80px"
                :index="child.path"
                :key="child.path"
                v-if="!child.hidden"
                >{{ child.name }}</el-menu-item
              >
            </el-submenu>
            <el-menu-item
              v-if="item.leaf && item.children.length > 0"
              :index="item.children[0].path"
              ><i :class="item.iconCls"></i>{{ item.children[0].name }}</el-menu-item
            >
          </template>
        </el-menu>
        <!--导航菜单-折叠后-->
        <ul
          class="el-menu el-menu-vertical-demo collapsed"
          v-if="collapsed"
          ref="menuCollapsed"
        >
          <li
            v-for="(item, index) in $router.options.routes"
            v-if="!item.hidden"
            class="el-submenu item"
          >
            <template v-if="!item.leaf">
              <div
                class="el-submenu__title"
                style="padding-left: 20px"
                @mouseover="showMenu(index, true)"
                @mouseout="showMenu(index, false)"
              >
                <i :class="item.iconCls"></i>
              </div>
              <ul
                class="el-menu submenu"
                :class="'submenu-hook-' + index"
                @mouseover="showMenu(index, true)"
                @mouseout="showMenu(index, false)"
              >
                <li
                  v-for="child in item.children"
                  v-if="!child.hidden"
                  :key="child.path"
                  class="el-menu-item"
                  style="padding-left: 40px"
                  :class="$route.path == child.path ? 'is-active' : ''"
                  @click="$router.push(child.path)"
                >
                  {{ child.name }}
                </li>
              </ul>
            </template>
            <template v-else>
              <li class="el-submenu">
                <div
                  class="el-submenu__title el-menu-item"
                  style="
                    padding-left: 20px;
                    height: 56px;
                    line-height: 56px;
                    padding: 0 20px;
                  "
                  :class="$route.path == item.children[0].path ? 'is-active' : ''"
                  @click="$router.push(item.children[0].path)"
                >
                  <i :class="item.iconCls"></i>
                </div>
              </li>
            </template>
          </li>
        </ul>
      </aside>
      <section class="content-container">
        <div class="grid-content bg-purple-light">
          <el-col :span="24" class="breadcrumb-container">
            <strong class="title">{{ $route.name }}</strong>
            <el-breadcrumb separator="/" class="breadcrumb-inner">
              <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="24" class="content-wrapper">
            <transition name="fade" mode="out-in">
              <router-view></router-view>
            </transition>
          </el-col>
        </div>
      </section>
    </el-col>

    <!-- 密码修改 -->
    <el-dialog title="修改密码" :visible.sync="dialogVisible" width="30%">
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginForm"
        label-position="left"
        label-width="0px"
        class="demo-ruleForm login-container"
      >
        <el-form-item>
          <el-input
            type="text"
            v-model="loginForm.realName"
            auto-complete="off"
            placeholder="账号"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item prop="oldPassword">
          <el-input
            type="password"
            v-model="loginForm.oldPassword"
            auto-complete="off"
            placeholder="请输入旧密码"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input
            type="password"
            v-model="loginForm.newPassword"
            auto-complete="off"
            placeholder="请输入新密码"
            clearable
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import md5 from "js-md5";
import { editPassword, logout } from "@/api/index";
import headerImg from "@/assets/logo.png";
export default {
  data() {
    return {
      sysName: "VUEADMIN",
      collapsed: false,
      sysUserName: "",
      sysUserAvatar: require("@/assets/logo.png"),
      dialogVisible: false,
      loginForm: {
        realName: "",
        oldPassword: "",
        newPassword: "",
      },
      rules: {
        oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, message: "长度至少在6个字符以上", trigger: "blur" },
        ],
      },
      userInfo: null,
    };
  },
  methods: {
    // 修改密码
    save() {
      let sendInfo = {
        userId: this.userInfo.userId,
        oldPassword: "",
        newPassword: "",
      };
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          sendInfo.oldPassword = md5(this.loginForm.oldPassword);
          sendInfo.newPassword = md5(this.loginForm.newPassword);
          const res = await editPassword(sendInfo);
          if (res.code == 200) {
            this.$message({
              message: "密码修改成功",
              type: "success",
            });
            setTimeout(() => {
              this.$router.push("/login");
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("apiToken");
            }, 1000);
          } else {
            this.$message({
              message: res.message,
              type: "error",
            });
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    //退出登录
    logout() {
      var _this = this;
      this.$confirm("确认退出吗?", "提示", {})
        .then(async () => {
          const res = await logout();
          this.$message({
            message: "退出成功",
            type: "success",
          });
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("apiToken");
          _this.$router.push("/login");
        })
        .catch(() => {});
    },
    //折叠导航栏
    collapse: function () {
      this.collapsed = !this.collapsed;
    },
    showMenu(i, status) {
      this.$refs.menuCollapsed.getElementsByClassName(
        "submenu-hook-" + i
      )[0].style.display = status ? "block" : "none";
    },
  },
  mounted() {
    this.userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    this.sysUserName = this.userInfo.realName;
    this.loginForm.realName = this.sysUserName;
  },
};
</script>

<style scoped lang="scss">
$color-primary: #20a0ff; //#18c79c
.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
  .header {
    height: 60px;
    line-height: 60px;
    background: $color-primary;
    color: #fff;
    .userinfo {
      text-align: right;
      padding-right: 35px;
      float: right;
      .userinfo-inner {
        cursor: pointer;
        color: #fff;
        img {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          margin: 10px 0px 10px 10px;
          float: right;
        }
      }
    }
    .logo {
      height: 60px;
      font-size: 22px;
      padding-left: 20px;
      padding-right: 20px;
      border-color: rgba(238, 241, 146, 0.3);
      border-right-width: 1px;
      border-right-style: solid;
      img {
        width: 40px;
        float: left;
        margin: 10px 10px 10px 18px;
      }
      .txt {
        color: #fff;
      }
    }
    .logo-width {
      width: 150px;
    }
    .logo-collapse-width {
      width: 60px;
    }
    .tools {
      padding: 0px 23px;
      width: 14px;
      height: 60px;
      line-height: 60px;
      font-size: 24px;
      cursor: pointer;
    }
  }
  .main {
    display: flex;
    position: absolute;
    top: 60px;
    bottom: 0px;
    overflow: hidden;
    aside {
      flex: 0 0 230px;
      width: 230px;
      .el-menu {
        height: 100%;
      }
      .collapsed {
        width: 60px;
        .item {
          position: relative;
        }
        .submenu {
          position: absolute;
          top: 0px;
          left: 60px;
          z-index: 99999;
          height: auto;
          display: none;
        }
      }
    }
    .menu-collapsed {
      flex: 0 0 60px;
      width: 60px;
    }
    .menu-expanded {
      flex: 0 0 150px;
      width: 150px;
    }
    .content-container {
      flex: 1;
      overflow-y: scroll;
      padding: 20px;
      .breadcrumb-container {
        .title {
          width: 200px;
          float: left;
          color: #475669;
          text-align: left;
        }
        .breadcrumb-inner {
          float: right;
        }
      }
      .content-wrapper {
        background-color: #fff;
        box-sizing: border-box;
      }
    }
  }
}
</style>
