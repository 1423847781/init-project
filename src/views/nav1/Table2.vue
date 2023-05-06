<template>
  <div class="content">
    <div class="header">
      <div class="left-content">
        <div class="left-item" v-for="(item, index) in formList" :key="index">
          <el-input-number
            :precision="item.field === 'collectAmount' ? 1 : 0"
            class="input-item"
            :class="[item.field === 'collectAmount' ? 'total-count' : '']"
            v-model="item.value"
            :controls="false"
            size="medium"
            :min="0"
            :max="item.field === 'collectAmount' ? 99999 : 9"
            :disabled="item.disabledStatus"
            @keyup.enter.native="add()"
          ></el-input-number>
          <span>{{ item.label }}</span>
        </div>
      </div>

      <div class="right-content">
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

        <el-radio-group class="radio-group" v-model="radioType" size="medium">
          <el-radio-button label="个位数"></el-radio-button>
          <el-radio-button label="十位数"></el-radio-button>
          <el-radio-button label="百位数"></el-radio-button>
          <el-radio-button label="千位数"></el-radio-button>
        </el-radio-group>
        <el-button size="medium" type="danger" @click="clearTable">清空表格</el-button>
      </div>
    </div>
    <div class="table-list">
      <div class="table-header">
        <!-- 序号 -->
        <div class="order-number">序号</div>
        <div class="rewards">
          <div>奖号</div>
          <div class="font-weight">
            共<span style="color: red"> {{ allCount }}</span> 组
          </div>
        </div>
        <div class="single-digit">
          <div class="one-line">{{ radioType }}</div>
          <div class="column-item">
            <div class="row-item" v-for="item in 10">
              <div>{{ item - 1 }}({{ radioType.slice(0, 2) }})</div>
              <div style="color: red">{{ getNum(item - 1) || "" }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="table-content">
        <!-- 序号 -->
        <div class="order-number">
          <div class="column-item" v-for="(item, index) in records" :key="index">
            {{ index + 1 }}
          </div>
        </div>
        <div class="rewards">
          <div class="column-item" v-for="(item, index) in records" :key="index">
            {{ item.num }}({{ item.collectAmount }})组
          </div>
        </div>
        <div class="single-digit">
          <div class="column-item" v-for="(item, index) in handleNodes" :key="index">
            <div class="row-item" v-for="zItem in 10">
              <span v-if="item.type == zItem - 1"
                >{{ item.num }}({{ item.collectAmount }}组)</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getFourRecords,
  clearRecords,
  betRecords,
  getTagList,
  addTag,
} from "@/api/index";
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
      radioType: "千位数",
      radioObj: {
        千位数: 1,
        百位数: 2,
        十位数: 3,
        个位数: 4,
      },
      resData: null,
      formData: {
        num1: "",
        num2: "",
        num3: "",
        num4: "",
        collectAmount: "",
      },
      records: [],
      typeNodes: [],
      handleNodes: [],
      // 用户信息
      userInfo: JSON.parse(sessionStorage.getItem("userInfo")),
      userId: "",
      tagValue: "", //标签属性
      options: [],
    };
  },
  watch: {
    // 监听选择
    radioType(val) {
      this.radioType = val;
      this.getData();
    },
  },
  mounted() {
    this.getData();
    this.getTagList();
    this.userId = this.userInfo.userId;
  },
  methods: {
    // 获取接口数据
    async getData() {
      let type = this.radioObj[this.radioType];
      const res = await getFourRecords({ type, userId: this.userId });
      this.records = res.data.records;
      this.typeNodes = res.data.typeNodes;
      this.allCount = res.data.allCount;
      this.handleData(this.typeNodes);
      // // 清空
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

    // 处理数据
    handleData(data) {
      this.handleNodes = [];
      data.forEach((item) => {
        item.nodes.forEach((cItem) => {
          let newItem = {
            ...cItem,
            type: item.index,
          };
          this.handleNodes.push(newItem);
        });
      });
    },

    // 获取所在行存在多少
    getNum(index) {
      let nodeObj = this.typeNodes.find((item) => index == item.index);
      return nodeObj?.slaveCount || 0;
    },

    // 清空表格
    clearTable() {
      this.$confirm("此操作将永久删除该内容, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const res = await clearRecords({ type: 4, userId: this.userId });
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

    // 添加四定表格
    async add() {
      this.formList.forEach((item) => {
        this.formData[item.field] = item.value;
      });

      // 存在总数量才添加
      if (this.formData.collectAmount) {
        let numList = [];
        for (let i in this.formData) {
          if (this.formData[i] !== undefined) {
            numList.push(this.formData[i]);
          }
        }
        if (numList.length == 5) {
          let formData = {
            ...this.formData,
            type: 4,
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

<style scoped lang="scss">
* {
  box-sizing: border-box;
}
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

.el-select-custom {
  width: 128px;
}

.left-content {
  display: flex;
}

.header .input-item {
  width: 50px;
  text-align: center;
}

.header .total-count {
  width: 70px;
}

.total-number {
  margin-right: 20px;
}

.font-weight {
  font-weight: bold;
}

.total-number span {
  color: red;
  font-size: 30px;
  font-weight: bold;
}

.table-list {
  .table-header,
  .table-content {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
  }
  .order-number {
    width: 5%;
    text-align: center;
    border-left: 1px solid #ccc;
    .column-item {
      align-items: center;
    }
  }
  .rewards {
    width: 12%;
    text-align: center;
    height: 100%;
    border-left: 1px solid #ccc;
    line-height: 30px;
  }
  .column-item {
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #ccc;
  }
  .column-item:last-child {
    border-bottom: 1px solid #ccc;
  }
  .single-digit {
    width: 83%;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    .one-line {
      width: 100%;
      text-align: center;
    }
    .row-item {
      text-align: center;
      width: 11.11%;
      border-left: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      div {
        width: 100%;
        display: block;
      }
    }
    .row-item:nth-of-type(1) {
      border-left: none;
    }
  }

  // 表头
  .table-header {
    height: 60px;
    border-top: 1px solid #ccc;
    background: #20a0ff;
    color: #fff;
    .order-number {
      height: 100%;
      line-height: 60px;
    }
    // 个位数
    .one-line {
      height: 20px;
    }
    .column-item {
      height: 40px;
      font-size: 14px;
      font-weight: bold;
    }
    .row-item {
      align-items: normal;
    }
  }
  .column-item {
    width: 100%;
    height: 30px;
    text-align: center;
  }
}

.table-item {
  width: 49%;
  margin-bottom: 20px;
}

.radio-group {
  margin: 0 20px;
}
</style>
