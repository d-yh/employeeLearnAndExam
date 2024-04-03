<template>
  <div class="navbar" :class="{'has-logo':showLogo}">
    <div class="container-fluid">
      <logo v-if="showLogo" :collapse="showLogo" />
      <el-divider direction="vertical" class="ms-0 me-4 opacity-25"></el-divider>
      <a @click="toHome" class="el-icon-s-tools ri-home-4-line "  style="margin-right: 10px;font-size: 20px"></a>
      <p class="mb-0 title">HUIYU 辉宇项目信息管理平台</p>
      <!-- <breadcrumb class="breadcrumb-container" /> -->
      <el-dropdown class="avatar-container ms-auto" trigger="click">
        <div class="hstack me-4">
          <el-avatar :src="user&&user.photo?user.photo:photo" fit="cover" class="mx-2"></el-avatar>
          <span class="text-white fs-6">{{user?user.nickname:""}}</span>
          <i class="el-icon-caret-bottom text-white-50 fs_sm mx-1" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item>
            <el-link href="#/personalCenter/training" :underline="false">
              <el-row type="flex" align="middle">
                <i class="ri-user-line fs-5"></i>个人中心
              </el-row>
            </el-link>

          </el-dropdown-item>
          <!-- <el-dropdown-item @click.native="updatePasswordFlag=true">
            <svg-icon icon-class="updatePassword" class="item_icon" />修改密码
          </el-dropdown-item> -->
          <el-dropdown-item divided>
            <el-row type="flex" align="middle" @click.native="logout" class="fs-6">
              <i class="ri-shut-down-line fs-5"></i>退出登录
            </el-row>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-badge :hidden="messageCount===0" :value="messageCount" :max="99" class="me-4">
        <el-button class="message-link" @click.native="getMessageList">
          <i  class="ri-notification-4-fill"></i>
        </el-button>
      </el-badge>

      <!-- 消息弹窗 -->
      <el-dialog
        width="600px"
        :visible.sync="warningDialogVisible"
        top="0"
        :append-to-body="true"
        custom-class="rounded-4"
        :close-on-click-modal="false"
      >
        <div style='position: relative;' class="el-scrollbar">
            <el-tabs v-model="messageDialog" style='width:100%' @tab-click="hideMessageDetail">
              <el-divider class="bg_gray m-0"></el-divider>
              <el-tab-pane label="通知" name="first" class="h-100 py-2">
                <el-scrollbar class="column h-100 rounded-4">
                  <el-checkbox-group v-model="delList">
                  <ul class="w-100 list-group border-0 px-4">
                    <li v-for="item in messageList" :key="item.systemMessageId" class="list-group-item px-0 py-4">
                      <el-row class="col px-3" type="flex" justify="space-between">
                        <div class="d-flex" style="cursor: pointer" @click="showMessageDetail(item)">
                          <el-badge :is-dot="item.readState===0" class="icon_notice" style="margin-right: 20px"><i  class="ri-volume-up-fill"></i></el-badge>
                            <div class="fw-bold fs_lg 1h-lg text-center" style="line-height: 2">{{ item.title }}</div>
                        </div>
                        <el-checkbox v-if="editType===1" style="line-height: 3" :label="item.messageUserId">
                          <br>
                        </el-checkbox>
                      </el-row>
                    </li>
                  </ul>
                  </el-checkbox-group>
                </el-scrollbar>
              </el-tab-pane>
              <el-tab-pane v-if="messageDetail.systemMessageId" label="消息" name="second">
                <el-scrollbar class="column h-100 rounded-4">
                  <ul class="w-100 list-group border-0 px-3">
                    <li class="list-group-item px-0 py-4">
                      <div class="d-flex">
                      <el-badge class="icon_message"><i class="el-icon-s-comment mt-1"></i></el-badge>
                        <div class="col px-3">
                          <div class="text_gray lh-lg">{{ messageDetail.content }}</div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </el-scrollbar>

              </el-tab-pane>
            </el-tabs>
          <div v-if="showEdit" style='position: absolute;right:10px;top:5px;'>
            <el-button v-if="editType===0" size='medium'  @click="showDelList" type="info" >编辑</el-button>
            <el-button v-if="editType===1" size='medium'  @click="delNotify" type="danger" >删除</el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from './Logo'
import Breadcrumb from "@/components/Breadcrumb";
import {sendGet, sendPostByKeyValue, sendPostByJson, sendPost} from "@/utils/httpUtils";
import photo from "./img/photo.png";
export default {
  components: {
    Breadcrumb,
    Logo
  },
  computed: {
    ...mapGetters(["sidebar", "avatar"]),
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
  },
  data() {
    var isMobileNumber = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入电话号码"));
      } else {
        const reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
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
      warningDialogVisible:false,
      dialogBaseFlag: false,
      updatePasswordFlag: false,
      passwordForm: { oldPwd: "", pass: "", checkPass: "" },
      passwordRules: {
        oldPwd: [{ validator: checkOldPwd, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
      },
      total:0,
      serverQuery:{
        page:1,
        size:20
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
      messageDialog: 'first',
      messageCount:0,
      messageList:[],
      messageDetail:{},
      delList:[],
      showEdit:true,
      editType:0
    };
  },
  mounted: function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };

    this.getMessageCount()
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
    async logout() {

      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    async getMessageCount(){
      const url = "/HomePage/getNotReadMessageCount"
      const response = await sendPost(url)
      if(response?.code === 200){
        this.messageCount = response.data
      }
    },
    async getMessageList(){
      const url ="/AppMySelf/getMySelfMessage"
      const response = await sendPostByKeyValue(url,this.serverQuery)
      if(response?.code === 200){
        this.messageList = response.data.list
        this.warningDialogVisible=true
      }
    },
    async showMessageDetail(item)
    {
      const itemIsRead = item.readState
      const url = "/AppMySelf/updateMyselfMessageState"
      const response = await sendPostByKeyValue(url,{messageId:item.systemMessageId})
      if(response?.code === 200){
        this.showEdit = false
        this.editType = 0
        this.delList = []
        item.readState = 1
        this.messageDetail = item
        this.messageDialog = "second"
        if(itemIsRead ===0)this.messageCount-=1
      }
    },
    hideMessageDetail(tab){
      if(tab.index === "0")
      {
        this.messageDetail ={}
        this.showEdit = true
      }
    },
    toHome(){
      this.$router.push({path:'/'})
    },
    showDelList(){
      this.editType = 1
    },
    delNotify(){
      if(this.delList.length === 0){
        this.$message({
          type:"error",
          message:"请选择要删除的消息"
        })
        return
      }
      this.$confirm("确定要删除这些通知?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            const notifyIds =this.delList.join(",")
            const url ="/AppMySelf/deletesMyselfMessage"
            const response = await sendPostByKeyValue(url, {messageUserIds:notifyIds})
            if(response?.code === 200){
              this.$message({
                type:"success",
                message:"删除成功"
              })
              this.editType = 0
              await this.getMessageList()
              await this.getMessageCount()
            }
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
    }
  },
};
</script>
