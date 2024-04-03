<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item>
        <el-button type="danger" icon="el-icon-delete" @click="deletes">批量删除</el-button>
      </el-form-item>
      <el-form-item>
        <el-input v-model="serverQuerey.username" @keyup.enter.native="search" placeholder="请输入账号"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="serverQuerey.nickname" @keyup.enter.native="search" placeholder="请输入昵称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="serverQuerey.mobile" @keyup.enter.native="search" placeholder="请输入联系方式"></el-input>
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
        <!-- <el-table-column align="center" prop="userId" label="ID"></el-table-column> -->
        <el-table-column align="center" prop="photo" label="头像">
          <template slot-scope="scope">
            <div class="demo-image__preview">
              <el-image
                v-if="scope.row.photo"
                style="width: 50px; height: 50px"
                :src="photoFormatter(scope.row.photo)[0]"
                :preview-src-list="photoFormatter(scope.row.photo)"
              ></el-image>
              <el-tag v-if="!scope.row.photo" size="mini">暂无</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="username" label="账号"></el-table-column>
        <el-table-column align="center" prop="nickname" label="昵称"></el-table-column>
        <el-table-column align="center" prop="mobile" label="联系方式"></el-table-column>
        <el-table-column align="center" prop="email" label="邮箱"></el-table-column>
        <el-table-column label="操作" align="center" width="240">
          <template slot-scope="scope">
            <el-link icon="el-icon-edit" type="primary" @click="getById(scope.row.userId)">编辑</el-link>
            <el-divider direction="vertical"></el-divider>
            <el-link type="info" @click="resetPassword(scope.row.userId)">重置密码</el-link>
            <el-divider direction="vertical"></el-divider>
            <el-link icon="el-icon-delete" type="danger" @click="delById(scope.row.userId)">删除</el-link>
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
            <el-col :span="24">
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  :action="baseImgURL+'/api/file/fileUpload'"
                  :show-file-list="false"
                  :headers="headers"
                  name="file"
                  :on-success="uploadSuccess"
                  :on-error="uploadError"
                  :before-upload="beforeAvatarUpload"
                >
                  <img
                    v-if="ruleForm.photo"
                    :src="ruleForm.photo"
                    style="width: 40px;height: 40px;display: block;"
                  />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="账号" prop="username">
                <el-input placeholder="请输入账号" class="w250" v-model="ruleForm.username"></el-input>
              </el-form-item>
              <el-form-item label="联系方式" prop="mobile">
                <el-input placeholder="请输入联系方式" class="w250" v-model="ruleForm.mobile"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="昵称">
                <el-input placeholder="请输入昵称" class="w250" v-model="ruleForm.nickname"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input placeholder="请输入邮箱" class="w250" v-model="ruleForm.email"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="角色">
                <el-checkbox-group v-model="checkedRoleIds">
                  <el-checkbox
                    v-for="item in roleList"
                    :label="item.value"
                    :key="item.value"
                  >{{item.label}}</el-checkbox>
                </el-checkbox-group>
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
        username: "",
        nickname: "",
        mobile: "",
        total: 0,
        page: 1,
        size: 20,
      },
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
        photo: "",
        username: "",
        nickname: "",
        mobile: "",
        email: "",
      },
      rules: {
        username: [
          { required: true, message: "账号不能为空", trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: isMobileNumber, trigger: "blur" },
        ],
        email: [
          { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
        ],
      },
    };
  },
  mounted: async function () {
    await this.initFun();
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    this.search();
  },
  methods: {
    initFun() {
      //查询角色
      sendPostByKeyValue("/role/getKeyValue")
        .then((response) => {
          if (response.code == 200) {
            this.roleList = response.data;
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

    resetPassword(userId) {
      this.$confirm("确定重置密码?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            sendGet("/user/resetPassword?userId=" + userId)
              .then((response) => {
                if (response.code == 200) {
                  this.$message({
                    type: "success",
                    message: "重置成功",
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

    getById(userId) {
      this.submitFlag = false;
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
      const url = "/user/detail?id=" + userId;
      sendGet(url)
        .then((response) => {
          if (response.code == 200) {
            let roleIds = [];
            if (response.data.roles && response.data.roles.length > 0) {
              for (let i = 0; i < response.data.roles.length; i++) {
                if (response.data.roles[i].roleId) {
                  roleIds.push(response.data.roles[i].roleId);
                }
              }
            }
            this.checkedRoleIds = roleIds;
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

    delById(userId) {
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
            sendGet("/user/delete?id=" + userId)
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
              ids.push(this.multipleSelection[i].userId);
            }
            // 删除操作
            sendGet("/user/deletes?ids=" + ids.toString())
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
      let saveRoles = [];
      for (let i = 0; i < this.checkedRoleIds.length; i++) {
        saveRoles.push({
          roleId: this.checkedRoleIds[i],
          userId: this.ruleForm.userId,
        });
      }
      this.ruleForm.userRoles = saveRoles;
      sendPostByJson("/user/saveUser", this.ruleForm)
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
        photo: "",
        username: "",
        nickname: "",
        mobile: "",
        email: "",
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
      const url = "/user/findByParam";
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