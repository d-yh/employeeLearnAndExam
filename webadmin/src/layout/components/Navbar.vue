<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <span>欢迎您：{{user&&(user.nickname||user.nickname)}}</span>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="user.photo?user.photo:photo" class="user-avatar" />
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item @click.native="dialogBaseFlag=true">
            <svg-icon icon-class="updateData" class="item_icon" />修改资料
          </el-dropdown-item>
          <el-dropdown-item @click.native="updatePasswordFlag=true">
            <svg-icon icon-class="updatePassword" class="item_icon" />修改密码
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">
              <svg-icon icon-class="logout" class="item_icon" />退出登录
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog
      :modal-append-to-body="false"
      title="修改资料"
      width="500px"
      @open="openDialogBase"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="90px">
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
          <el-form-item label="昵称" prop="nickname">
            <el-input placeholder="请输入昵称" class="w250" v-model="ruleForm.nickname"></el-input>
          </el-form-item>
          <el-form-item label="联系方式" prop="mobile">
            <el-input placeholder="请输入联系方式" class="w250" v-model="ruleForm.mobile"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input placeholder="请输入邮箱" class="w250" v-model="ruleForm.email"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogBaseFlag=false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">提 交</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :modal-append-to-body="false"
      :visible.sync="updatePasswordFlag"
      top="200px"
      width="420px"
      @open="openUpdatePasswordDialog"
      :lock-scroll="false"
    >
      <div style="width: 360px;magin: 0 auto;">
        <el-form
          :model="passwordForm"
          :rules="passwordRules"
          ref="passwordForm"
          label-width="100px"
        >
          <el-form-item label="旧密码" prop="oldPwd">
            <el-input
              v-model="passwordForm.oldPwd"
              :type="oldPwd"
              name="oldPwd"
              auto-complete="on"
              placeholder="请输入旧密码"
            ></el-input>
            <span class="show-pwd" @click="showPwd(1)">
              <svg-icon :icon-class="oldPwd === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-form-item label="新密码" prop="pass">
            <el-input
              v-model="passwordForm.pass"
              :type="pass"
              name="pass"
              auto-complete="on"
              placeholder="请输入新密码"
            ></el-input>
            <span class="show-pwd" @click="showPwd(2)">
              <svg-icon :icon-class="pass === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-form-item label="确认新密码" prop="checkPass">
            <el-input
              v-model="passwordForm.checkPass"
              :type="checkPass"
              name="checkPass"
              auto-complete="on"
              placeholder="请再次输入新密码"
            ></el-input>
            <span class="show-pwd" @click="showPwd(3)">
              <svg-icon :icon-class="checkPass === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-form-item>
            <el-row>
              <el-col :span="12">
                <div class="grid-content bg-purple">
                  <el-button type="primary" @click="updatePwd('passwordForm')">提 交</el-button>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="grid-content bg-purple-light">
                  <el-button @click="updatePasswordFlag=false">取 消</el-button>
                </div>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import { sendGet, sendPostByKeyValue, sendPostByJson } from "@/utils/httpUtils";
import photo from "./img/photo.png";
export default {
  components: {
    Breadcrumb,
    Hamburger,
  },
  computed: {
    ...mapGetters(["sidebar", "avatar"]),
  },
  data() {
    var isMobileNumber = (rule, value, callback) => {
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
    var checkOldPwd = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入旧密码"));
      }
      callback();
    };
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        if (this.passwordForm.checkPass !== "") {
          this.$refs.passwordForm.validateField("checkPass");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else if (value !== this.passwordForm.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      user: this.$store.state.user.userInfo,
      dialogBaseFlag: false,
      updatePasswordFlag: false,
      passwordForm: { oldPwd: "", pass: "", checkPass: "" },
      passwordRules: {
        oldPwd: [{ validator: checkOldPwd, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
      },
      photo,
      baseImgURL: "",
      oldPwd: "password",
      pass: "password",
      checkPass: "password",
      genderList: [
        {
          value: 1,
          label: "男",
        },
        {
          value: 2,
          label: "女",
        },
      ],
      headers: {},
      ruleForm: {
        photo: "",
        username: "",
        nickname: "",
        mobile: "",
        email: "",
      },
      rules: {
        nickname: [
          { required: true, message: "昵称不能为空", trigger: "blur" },
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
  mounted: function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
  },
  methods: {
    openDialogBase() {
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
      if (this.user) {
        this.ruleForm.userId = this.user.userId;
        this.ruleForm.photo = this.user.photo;
        this.ruleForm.username = this.user.username;
        this.ruleForm.nickname = this.user.nickname;
        this.ruleForm.mobile = this.user.mobile;
        this.ruleForm.email = this.user.email;
      }
    },
    openUpdatePasswordDialog() {
      this.$nextTick(() => {
        this.$refs["passwordForm"].clearValidate();
      });
      this.passwordForm = { oldPwd: "", pass: "", checkPass: "" };
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
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          sendPostByJson("/user/saveUser", this.ruleForm)
            .then((response) => {
              this.dialogBaseFlag = false;
              this.$store.dispatch("user/getInfo").then((data) => {
                this.user = data;
              });
              this.$message({
                message: "修改成功",
                type: "success",
              });
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    updatePwd(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //修改密码
          sendPostByKeyValue("/user/changePassword", {
            newPassword: this.passwordForm.pass,
            oldPassword: this.passwordForm.oldPwd,
          })
            .then((response) => {
              if (response.code == 200) {
                this.$message({
                  type: "success",
                  message: "修改成功",
                });
                this.updatePasswordFlag = false;
                this.logout();
              } else {
                this.$message({
                  type: "error",
                  message: response.message,
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    showPwd(flag) {
      if (flag === 2) {
        if (this.pass === "password") {
          this.pass = "";
        } else {
          this.pass = "password";
        }
      } else if (flag === 3) {
        if (this.checkPass === "password") {
          this.checkPass = "";
        } else {
          this.checkPass = "password";
        }
      } else {
        if (this.oldPwd === "password") {
          this.oldPwd = "";
        } else {
          this.oldPwd = "password";
        }
      }
    },
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.item_icon {
  margin-right: 10px;
}
.show-pwd {
  position: absolute;
  right: 10px;
  top: 2px;
  font-size: 16px;
  color: #889aa4;
  cursor: pointer;
  user-select: none;
}
</style>
