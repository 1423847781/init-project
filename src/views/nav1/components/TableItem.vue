<template>
  <div class="table-content">
    <div class="row-item row-header">
      <div class="column-item column-title">
        <span class="column-left-bottom">{{ titleList[tableType][0] }}</span>
        <span class="column-right-top">{{ titleList[tableType][1] }}</span>
      </div>
      <div class="column-item" v-for="(item, index) in 10">
        {{ index }} <span class="label">({{ titleList[tableType][1] }}位)</span>
      </div>
      <div class="column-item column-count">合计</div>
    </div>
    <div class="row-item" v-for="(item, index) in tableList" :key="index">
      <div class="column-item">
        {{ index }} <span class="label">({{ titleList[tableType][0] }}位)</span>
      </div>
      <div
        class="column-item"
        style="cursor: pointer"
        v-for="(cItem, cIndex) in item.row"
        @click="editVal(item, cIndex)"
        :class="[cItem.collectAmount >= maxValue ? 'font-color' : '']"
      >
        <div class="num" :class="[cItem.collectAmount >= maxValue ? 'font-color' : '']">
          {{ cItem.num }}
        </div>
        <div class="count" :class="[cItem.collectAmount > 0 ? 'font-bold' : '']">
          {{ cItem.collectAmount }}组
        </div>
      </div>
      <div
        class="column-item column-count"
        :class="[item.rowCount > 0 ? 'font-bold' : '']"
      >
        {{ item.rowCount }}组
      </div>
    </div>

    <el-dialog
      title="修改/新增"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form ref="form" label-width="80px">
        <el-form-item>
          <span slot="label">{{ currentNum }}值:</span>
          <el-input-number
            :precision="0"
            v-model="currentValue"
            :controls="false"
            :min="0"
            size="small"
          ></el-input-number>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { updateRecords } from "@/api/index";
export default {
  props: {
    tableList: {
      type: Array,
    },
    tableType: {
      type: Number || String,
    },
    maxValue: {
      type: Number,
    },
    userId: {
      type: Number || String,
    },
  },
  data() {
    return {
      titleList: {
        1: ["千", "百"],
        2: ["千", "十"],
        3: ["千", "个"],
        4: ["百", "十"],
        5: ["百", "个"],
        6: ["十", "个"],
      },
      dialogVisible: false,
      currentValue: "",
      currentNum: "",
    };
  },
  mounted() {},
  methods: {
    // 修改值
    editVal(item, index) {
      this.currentNum = item.row[index].num;
      this.currentValue = item.row[index].collectAmount;
      this.dialogVisible = true;
    },

    //关闭确认
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },

    // 保存
    async save() {
      let sendData = {
        collectAmount: this.currentValue,
        num: this.currentNum,
        userId: this.userId,
      };
      const res = await updateRecords(sendData);
      if (res.code == 200) {
        this.$message({
          message: res.message,
          type: "success",
        });
        this.dialogVisible = false;
        this.$emit("resetPage");
      }
    },
  },
};
</script>

<style scoped>
.table-content {
  width: 100%;
  height: 100%;
  font-size: 14px;
}

.row-item {
  display: flex;
  justify-content: space-between;
  height: 32px;
}

.column-item {
  width: 8.33%;
  border: 1px solid #ccc;
  text-align: center;
  border-left: none;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
}

.row-header,
.column-item:first-child {
  background-color: #409eff;
  color: #fff;
}

.label {
  font-size: 12px;
}

.column-item .num {
  width: 100%;
  color: skyblue;
}
.column-item .count {
  width: 100%;
  line-height: 16px;
}

.column-count {
  width: 10%;
}

.font-bold {
  font-weight: bold;
}

.font-color {
  color: red !important;
  font-weight: bold;
}

.column-item .column-left-bottom {
  position: absolute;
  bottom: 2px;
  left: 3px;
  font-size: 13px;
}
.column-item .column-right-top {
  position: absolute;
  right: 3px;
  top: 2px;
  font-size: 13px;
}
</style>
