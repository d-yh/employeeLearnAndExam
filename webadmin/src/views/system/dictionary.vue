<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item>
        <el-button type="danger" icon="el-icon-delete" @click="deletes">批量删除</el-button>
      </el-form-item>
      <el-form-item>
        <!-- <el-input v-model="serverQuerey.type" @keyup.enter.native="search" placeholder="请输入类型"></el-input> -->
        <el-select v-model="serverQuerey.type" filterable placeholder="请选择类型">
            <el-option v-for="item in optionsType" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="serverQuerey.name1" @keyup.enter.native="search" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(true)">添加</el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-table
        v-loading="listLoading"
        :height="tableHeight"
        :data="listData"
        border
        fit
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" prop="dictionaryId" label="ID"></el-table-column>
        <el-table-column align="center" prop="type" label="类型"></el-table-column>
        <el-table-column align="center" prop="name1" label="Name1"></el-table-column>
        <el-table-column align="center" prop="name2" label="Name2"></el-table-column>
        <el-table-column align="center" prop="name3" label="Name3"></el-table-column>
        <el-table-column align="center" prop="name4" label="Name4"></el-table-column>
        <el-table-column align="center" prop="name5" label="Name5"></el-table-column>
        <el-table-column label="操作" align="center" width="240">
          <template slot-scope="scope">
            <el-link icon="el-icon-edit" type="primary" @click="getById(scope.row.dictionaryId)">编辑</el-link>
            <el-divider direction="vertical"></el-divider>
            <el-link icon="el-icon-delete" type="danger" @click="delById(scope.row.dictionaryId)">删除</el-link>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:15px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="serverQuerey.page"
        :page-sizes="[20,40, 60, 80, 100]"
        :page-size.sync="serverQuerey.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="serverQuerey.total"
      ></el-pagination>
    </div>
    <el-dialog
      :modal-append-to-body="false"
      title="记录信息"
      width="800px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="78px">
          <el-row :gutter="30">
            <el-col :span="12">
              <!-- <el-form-item label="类型" prop="type">
                <el-input placeholder="类型" class="w250" v-model="ruleForm.type"></el-input>
              </el-form-item> -->
              <el-form-item label="类型:" prop="type">
              <el-select v-model="ruleForm.type" filterable placeholder="请选择类型" class="w250">
                <el-option v-for="item in optionsType" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Name1">
                <el-input placeholder="请输入Name1" class="w250" v-model="ruleForm.name1"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Name2">
                <el-input placeholder="请输入Name2" class="w250" v-model="ruleForm.name2"></el-input>
              </el-form-item>
              </el-col>
            <el-col :span="12">
              <el-form-item label="Name3" >
                <el-input placeholder="请输入Name3" class="w250" v-model="ruleForm.name3"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Name4">
                <el-input placeholder="请输入Name4" class="w250" v-model="ruleForm.name4"></el-input>
              </el-form-item>
              </el-col>
            <el-col :span="12">
              <el-form-item label="Name5" >
                <el-input placeholder="请输入Name5" class="w250" v-model="ruleForm.name5"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogBaseFlag=false">取 消</el-button>
        <el-button type="primary" :disabled="submitButtonFlag" @click="submitForm('ruleForm')">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { sendGet, sendPostByKeyValue, sendPostByJson } from "@/utils/httpUtils";
export default {
  data() {
    let isMobileNumber = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入电话号码"));
      } else {
        const reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
        const isPhone = reg.test(value);
        value = Number(value); //转换为数字
        if (typeof value === "number" && !isNaN(value)) {
          //判断是否为数字
          value = value.toString(); //转换成字符串
          if (value.length < 0 || value.length > 12 || !isPhone) {
            //判断是否为11位手机号
            callback(new Error("请输入正确的手机号码"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入电话号码"));
        }
      }
    };
    return {
      tableHeight: window.innerHeight - 200,
      serverQuerey: {
        type: "",
        name1: "",
        total: 0,
        page: 1,
        size: 20,
      },
      //选择类型
      optionsType:[{
          value: '事故等级',
          label: '事故等级'
        }, {
          value: '投诉结论',
          label: '投诉结论'
        }, {
          value: '欠款类型',
          label: '欠款类型'
        }, {
          value: '回场整改措施',
          label: '回场整改措施'
        }, {
          value: '工单项目类别',
          label: '工单项目类别'
        }, {
          value: '收款类型',
          label: '收款类型'
        }, {
          value: '离职类型',
          label: '离职类型'
        }, {
          value: '机动顶班类型',
          label: '机动顶班类型'
        }, {
          value: '投诉类型',
          label: '投诉类型'
        }, {
          value: '回场检查',
          label: '回场检查'
        }, {
          value: '事故责任',
          label: '事故责任'
        }, {
          value: '路检路查',
          label: '路检路查'
        }, {
          value: '发票类型',
          label: '发票类型'
        }, {
          value: '请假类型',
          label: '请假类型'
        }, {
          value: '修理厂',
          label: '修理厂'
        }, {
          value: '投诉机构',
          label: '投诉机构'
        }, {
          value: '事故处理方式',
          label: '事故处理方式'
        }, {
          value: '驾驶员培训方式',
          label: '驾驶员培训方式'
        }, {
          value: '体检类型',
          label: '体检类型'
        }, {
          value: '入职类型',
          label: '入职类型'
        }, {
          value: '事故类别',
          label: '事故类别'
        }, {
          value: '收款方式',
          label: '收款方式'
        }, {
          value: '车险类型',
          label: '车险类型'
        }, {
          value: '考核规则',
          label: '考核规则'
        }, {
          value: '保险类型',
          label: '保险类型'
        }, {
          value: '行政区划',
          label: '行政区划'
        }, {
          value: '经营管理方式',
          label: '经营管理方式'
        }, {
          value: '考核内容',
          label: '考核内容'
        }, {
          value: '投诉处理方式',
          label: '投诉处理方式'
        }],
      dialogBaseFlag: false,
      listLoading: false,
      submitButtonFlag: false,
      baseImgURL: "",
      headers: {},
      listData: [],
      roleList: [],
      checkedRoleIds: [],
      multipleSelection: [],
      ruleForm: {
        type: "",
        name1: "",
      },
      rules: {
        type: [
          { required: true, message: "类型不能为空", trigger: "blur" },
        ],
        name1: [
          { type: "name1", message: "name1不能为空", trigger: "blur" },
        ],
      },
    };
  },
  mounted: async function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    this.search();
  },
  methods: {

  

    getById(dictionaryId) {
      this.submitFlag = false;
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
      const url = "/dictionary/detail?id=" + dictionaryId;
      sendGet(url)
        .then((response) => {
          if (response.code == 200) {
            this.ruleForm = response.data;
          } else {
            this.$message({
              type: "error",
              message: response.message,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    delById(dictionaryId) {
      this.$confirm("确定要删除该记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            sendGet("/dictionary/delete?id=" + dictionaryId)
              .then((response) => {
                if (response.code == 200) {
                  this.search();
                  this.$message({
                    type: "success",
                    message: "删除成功",
                  });
                } else {
                  this.$message({
                    type: "error",
                    message: response.message,
                  });
                }
              })
              .catch((err) => {
                console.log(err);
              });
            done();
          } else {
            done();
          }
        },
      }).catch(() => {
        this.$message({
          type: "info",
          message: "已取消",
        });
      });
    },

    deletes() {
      if (this.multipleSelection.length == 0) {
        this.$message({
          type: "error",
          message: "请先选择记录",
        });
        return;
      }
      this.$confirm("确定批量删除选中记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            let ids = [];
            for (let i = 0; i < this.multipleSelection.length; i++) {
              ids.push(this.multipleSelection[i].dictionaryId);
            }
            // 删除操作
            sendGet("/dictionary/deletes?ids=" + ids.toString())
              .then((response) => {
                if (response.code == 200) {
                  this.search();
                  this.$message({
                    type: "success",
                    message: "删除成功",
                  });
                } else {
                  this.$message({
                    type: "error",
                    message: response.message,
                  });
                }
              })
              .catch((err) => {
                console.log(err);
              });
            done();
          } else {
            done();
          }
        },
      }).catch(() => {
        this.$message({
          type: "info",
          message: "已取消",
        });
      });
    },

    add() {
      this.submitButtonFlag = true;
      sendPostByJson("/dictionary/saveDictionary", this.ruleForm)
        .then((response) => {
          if (response.code == 200) {
            this.search();
            this.$message({
              type: "success",
              message: "操作成功",
            });
            this.dialogBaseFlag = false;
          } else {
            this.$message({
              type: "error",
              message: response.message,
            });
          }
          this.submitButtonFlag = false;
        })
        .catch((error) => {
          console.log(error);
          this.submitButtonFlag = false;
        });
    },

    handleSizeChange(val) {
      //查询
      this.serverQuerey.size = val;
      this.search();
    },

    handleCurrentChange(val) {
      //查询
      this.serverQuerey.page = val;
      this.search();
    },

    photoFormatter(pictures) {
      if (pictures != null && pictures != "") {
        return pictures.split(",");
      }
      return [];
    },
    uploadSuccess(response, file, fileList) {
      if (response) {
        this.ruleForm.photo = this.baseImgURL + response.data.fileUrl;
      }
    },
    uploadError(err, file, fileList) {
      this.$message({
        message: "上传失败",
        type: "error",
      });
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 5;

      if (!isLt2M) {
        this.$message.error("上传文件大小不能超过 5MB!");
      }
      return isLt2M;
    },
    openDialog(flag) {
      this.submitFlag = flag; //false 修改 true 添加
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
      this.checkedRoleIds = [];
      this.ruleForm = {
        type: "",
        name1: "",
      };
    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.add();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    search() {
      this.listLoading = true;
      const url = "/dictionary/findByParam";
      sendPostByKeyValue(url, this.serverQuerey)
        .then((response) => {
          if (response.code == 200) {
            this.listData = response.data.list;
            this.serverQuerey.total = response.data.total;
          } else {
            this.$message({
              type: "error",
              message: response.message,
            });
          }
          this.listLoading = false;
        })
        .catch((err) => {
          this.listLoading = false;
          console.log(err);
        });
    },
  },
};
</script>
<style scoped>
</style>