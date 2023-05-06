<template>
  <div class="content">
    <div class="header">
      <div class="left-content">
        <div class="left-item" v-for="(item, index) in formList" :key="index">
          <el-input
            v-if="item.field !== 'collectAmount'"
            class="input-item"
            v-model="item.value"
            size="medium"
            :disabled="item.disabledStatus"
            @change="(event) => inputValue(event, item.field)"
            @keyup.enter.native="add()"
            @blur="inputBlur()"
          ></el-input>
          <span v-if="item.field !== 'collectAmount'">{{ item.label }}</span>

          <!-- 总数框输入 -->
          <el-input-number
            v-if="item.field === 'collectAmount'"
            :precision="1"
            class="input-item total-count"
            v-model="item.value"
            :controls="false"
            size="medium"
            :min="0"
            :disabled="item.disabledStatus"
            @keyup.enter.native="add()"
          ></el-input-number>
          <span v-if="item.field === 'collectAmount'">{{ item.label }}</span>
        </div>
      </div>

      <div class="right-content">
        <el-input-number
          :controls="false"
          v-model="maxTableValue"
          class="max-value"
          :min="1"
          size="medium"
          @keyup.enter.native="handleChange()"
          placeholder="请设置最大组数"
        ></el-input-number>

        <el-select
          size="medium"
          class="el-select-custom"
          v-model="tagValue"
          filterable
          allow-create
          default-first-option
          placeholder="请选择标签"
          @change="changeTag"
        >
          <el-option
            v-for="item in options"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          >
          </el-option>
        </el-select>

        <div class="total-number">
          全部两定合计：<span>{{ allCount }} </span>组
        </div>
        <el-button type="danger" size="medium" @click="clearTable">清空表格</el-button>
      </div>
    </div>
    <div class="table-list">
      <div class="table-item" v-for="(item, index) in tableData" :key="index">
        <TableItem
          :tableList="item.rows"
          :tableType="item.type"
          :maxValue="maxTableValue"
          :userId="userId"
          @resetPage="getData"
        ></TableItem>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getTwoRecords,
  clearRecords,
  betRecords,
  getTagList,
  addTag,
  setMaxRecord,
} from "@/api/index"; //导入api目录下的接口文件，并在{}中写使用的接口
import TableItem from "./components/TableItem.vue";
export default {
  components: {
    TableItem,
  },
  data() {
    return {
      tableData: [],
      allCount: 0,
      // 循环input
      formList: [
        { value: undefined, field: "num1", label: "千 +", disabledStatus: false },
        { value: undefined, field: "num2", label: "百 +", disabledStatus: false },
        { value: undefined, field: "num3", label: "十 +", disabledStatus: false },
        { value: undefined, field: "num4", label: "个 =", disabledStatus: false },
        { value: undefined, field: "collectAmount", label: "组", disabledStatus: false },
      ],
      formData: {
        num1: "",
        num2: "",
        num3: "",
        num4: "",
        collectAmount: "",
      },
      // 用户信息
      userInfo: JSON.parse(sessionStorage.getItem("userInfo")),
      tagValue: "", //标签属性
      options: [],
      userId: "",
      maxTableValue: JSON.parse(sessionStorage.getItem("userInfo")).setMax || 0,
    };
  },
  mounted() {
    this.getData();
    this.getTagList();
    this.userId = this.userInfo.userId;
  },
  methods: {
    // 获取接口数据
    async getData() {
      const res = await getTwoRecords({ userId: this.userId });
      this.tableData = res.data.tables;
      this.allCount = res.data.allCount;
      // 清空
      this.formList = this.formList.map((item) => ({
        ...item,
        value: undefined,
        disabledStatus: false,
      }));
    },

    // 获取标签列表
    async getTagList() {
      const res = await getTagList();
      this.options = res.data;
    },

    // 设置最大组数
    async handleChange() {
      let data = {
        setMax: this.maxTableValue,
        userId: this.userInfo.userId,
      };
      const res = await setMaxRecord(data);
      if (res.code == 200) {
        this.$message({
          type: "success",
          message: "最大组数设置成功",
        });
        let userInfo = {
          ...this.userInfo,
          setMax: this.maxTableValue,
        };
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
      console.log(res);
    },

    //添加标签
    async changeTag(val) {
      let addStatus = this.options.some((item) => item.userId == val);
      // 判断是增加还是查询，true查询
      if (addStatus) {
        this.userId = val;
        this.getData();
      } else {
        const res = await addTag({ nickName: val });
        this.tagValue = "";
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: "标签添加成功",
          });
          this.getTagList();
        }
      }
    },

    // 清空表格
    clearTable() {
      this.$confirm("此操作将永久删除该内容, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const res = await clearRecords({ type: 2, userId: this.userId });
          if (res.code == 200) {
            // 清空
            this.getData();
            this.$message({
              message: "已成功清空",
              type: "success",
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    // 正则表达式
    validate(str) {
      const pattern = /^(?!.*(\d).*\1)[0-9]+$/;
      return pattern.test(str);
    },

    // 监听input输入
    inputValue(e, type) {
      let value = e + "";
      let arr = value.split("");
      let errorStatus = false;
      if (type !== "collectAmount") {
        if (!this.validate(e)) {
          this.$message({
            message: "格式不正确请重新输入",
            type: "error",
          });
          errorStatus = true;
        }
        if (new Set(arr).size !== arr.length) {
          this.$message({
            message: "存在重复数字，请重新输入",
            type: "error",
          });
          errorStatus = true;
        }
        if (errorStatus) {
          this.formList.forEach((item, index) => {
            if (item.field == type) {
              this.$nextTick(() => {
                this.$set(this.formList, index, { ...item, value: undefined });
              });
            }
          });
        }
      }
    },

    // 监听input失去焦点
    inputBlur() {
      let dataList = this.formList.filter(
        (item) => item.value >= 0 && item.field !== "collectAmount"
      );
      this.formList.forEach((item) => {
        item.disabledStatus = false;
        // 满足输入两个数
        if (dataList.length == 2) {
          // 该值不为空
          if (item.value == undefined && item.field !== "collectAmount") {
            item.disabledStatus = true;
          }
        }
      });
    },

    // 添加两定表格
    async add() {
      this.formList.forEach((item) => {
        this.formData[item.field] = item.value;
      });

      // 存在总数量才添加
      if (this.formData.collectAmount) {
        let numList = [];
        for (let i in this.formData) {
          if (this.formData[i]) {
            numList.push(this.formData[i]);
          }
        }
        if (numList.length == 3) {
          let formData = {
            ...this.formData,
            type: 2,
            userId: this.userId,
          };
          const res = await betRecords(formData);
          if (res.code == 200) {
            this.$message({
              message: res.message,
              type: "success",
            });
            //刷新表格
            this.getData();
          } else {
            this.$message({
              message: "添加失败，请重新添加",
              type: "error",
            });
          }
        } else {
          this.$message({
            message: "格式不正确，请重新输入",
            type: "error",
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.content {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  margin: 10px 0;
}

.right-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-content {
  display: flex;
}

.header .input-item {
  width: 100px;
}

.total-number {
  margin: 0 20px;
}

.max-value {
  margin-right: 20px;
  width: 130px;
}

.el-select-custom {
  width: 128px;
}

.total-number span {
  color: red;
  font-size: 30px;
  font-weight: bold;
}

.table-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.table-item {
  width: 49%;
  margin-bottom: 20px;
}
</style>
