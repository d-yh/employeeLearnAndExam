<template>
  <div class="position-relative w-100 h-100">
    <el-image fit="fitCover" :src="logo_bg" class="w-100 h-100"></el-image>
    <div class="position-absolute top-0 end-0 h-100 w-70 login-container"   v-if="!changePwd">
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form px-3 pb-5"
        auto-complete="on"
        label-position="center"

      >
        <el-image fit="container" :src="logo" class="mb-5" style="width:130px"></el-image>
        <h4 class="fw-bold mb-5"> HUIYU 辉宇项目信息管理平台</h4>

        <el-form-item prop="username" class="w-100">
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="请输入账号"
            name="username"
            type="text"
            tabindex="1"
            auto-complete="on"
            class="rounded-3">
          <i slot="prefix" class="ri-user-6-line"></i>
        </el-input>
        </el-form-item>

        <el-form-item prop="password" class="w-100">
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="请输入密码"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
            class="rounded-3"
          >
          <i slot="prefix" class="ri-lock-2-line"></i>
          <i slot="suffix" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </i>
          </el-input>
        </el-form-item>
        <div class="w-100" style="text-align:right">

          <el-link  @click="changPwdFnc" :underline="false">忘记密码</el-link>
        </div>
        <el-form-item  class="w-100">

        <el-button
          :loading="loading"
          type="primary"
          class="btn btn-primary w-100 my-3 rounded-3"
          style="height:48px"
          @click.native.prevent="handleLogin"
        >登录</el-button>
        </el-form-item>
      </el-form>
      </div>
    <div class="position-absolute top-0 end-0 h-100 w-70 login-container resetPwd" v-if="changePwd">
      <el-form
        ref="restPwd"
        :model="resetModel"
        :rules="loginRules"
         class="login-form px-3 pb-5 restContainer"
         auto-complete="on"
         label-position="left"


         style="align-items:flex-start"
      >
           <div class="mb-5 blod" style="cursor:pointer;" @click="returnLogin"> <i class="el-icon-arrow-left" style="color:blue"  ></i> 返回登录</div>
           <h4   class="mb-5" >忘记密码</h4>
           <el-form-item prop="workNumber" class="w-100"  v-if="step==1">
              <el-input
              ref="name"
              v-model="resetModel.workNumber"
              placeholder="账号/工号"
              name="name"
              type="text"
              tabindex="1"
              auto-complete="on"

              class="rounded-3">

              </el-input>
           </el-form-item>
             <el-form-item prop="idCard" class="w-100"  v-if="step==1">
              <el-input
              ref="idCard"
              v-model="resetModel.idCard"
              placeholder="身份证号"
              name="idCard"
              type="text"
              tabindex="1"
              auto-complete="on"

              class="rounded-3">

              </el-input>
           </el-form-item>
             <el-form-item prop="nwepwd" class="w-100" v-if="step==2">
                <el-input
                  :key="passwordType_new"
                  ref="passwordnew"
                  v-model="resetModel.nwepwd"
                  :type="passwordType_new"
                  placeholder="新密码"
                  name="passwordnew"
                  tabindex="2"
                  auto-complete="on"

                  class="rounded-3"
                >

                <i slot="suffix" @click="showPwd2(1)">
                  <svg-icon :icon-class="passwordType_new === 'password' ? 'eye' : 'eye-open'" />
                </i>
                </el-input>

             </el-form-item>
             <el-form-item prop="checkpwd" class="w-100"  v-if="step==2">
                <el-input
                  :key="passwordType_check+'c'"
                  ref="passwordcheck"
                  v-model="resetModel.checkpwd"
                  :type="passwordType_check"
                  placeholder="确认新密码"
                  name="passwordcheck"
                  tabindex="3"
                  auto-complete="on"

                  class="rounded-3"
                >

                    <i slot="suffix" @click="showPwd2(2)">
                      <svg-icon :icon-class="passwordType_check === 'password' ? 'eye' : 'eye-open'" />
                    </i>
                </el-input>
                </el-form-item>
                <el-form-item  class="w-100">
                <el-button
                  v-if="step==1"
                  :loading="loadingpwd"
                  type="primary"
                  class="btn btn-primary w-100 my-3 rounded-3"
                  style="height:48px"
                   @click="checkUserPermission"
                >身份验证</el-button>
                <el-button
                 v-if="step==2"
                  :loading="loadingpwd"
                  type="primary"
                  @click="upPwd"
                  class="btn btn-primary w-100 my-3 rounded-3"
                  style="height:48px"

                >修改密码</el-button>
             </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import logo_bg from "@/assets/images/bg_login.jpg"
import logo from "@/assets/images/logo.png"
import { sendPostByKeyValue } from '@/utils/httpUtils';
export default {
  name: "Login",
  data() {


    const check2pwd=(rule,value,callback)=>{
      if(value==''){
        return  callback(new Error("请再次输入密码!"))
      }
      if(this.resetModel.nwepwd.trim()&&this.resetModel.checkpwd.trim()&&this.resetModel.nwepwd.trim()===this.resetModel.checkpwd.trim()){
        debugger
          callback()
      }else{
        return callback(new Error("新密码和确认密码不一致!"))
      }
    }
     var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.resetModel.nwepwd) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
    return {
      logo_bg,
      logo,
      step:1,
      loadingpwd:false,
      changePwd:false,
      loginForm: {
        username: "",
        password: ""
      },
      loginRules: {
        username: [
          { required: true, message: "请输入账号", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        workNumber: [{ required: true, message: "请输入账号/工号", trigger: "blur" }],
        idCard: [{ required: true, message: "请输入身份证号", trigger: "blur" }],
        nwepwd: [{ required: true, message: "请输入新密码", trigger: "blur" }],
        checkpwd: [
          { required: true, message: "请确认新密码", trigger: "blur" },
                    { validator: validatePass2, trigger: 'blur' }
        ],


      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
      fitCover: "cover",
      resetModel:{
          workNumber:"",
          idCard:"",
          nwepwd:"",
          checkpwd:"",

      },
      userInfo:{},
      passwordType_new:"password",
      passwordType_check:"password",


    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {


      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //reset pwd
    changPwdFnc(){
      this.$refs.loginForm.clearValidate()
      this.changePwd=true
      this.step=1;
      this.$nextTick(()=>{

        this.$refs.restPwd.clearValidate()
      })
    },
    showPwd2(arg){

        switch(arg){
          case 1:
            this.passwordType_new==="password"?this.passwordType_new = "text":this.passwordType_new = "password"
             this.$nextTick(() => {
               this.$refs.passwordnew.focus();
            });
            break;

          case 2:
            this.passwordType_check==="password"?this.passwordType_check = "text":this.passwordType_check = "password"
            this.$nextTick(() => {
             /// this.$refs.passwordcheck.focus();
           });
            break
          // default:
          //   break;
        }


    },
    checkUserPermission(){
      this.$refs.restPwd.validate(valid=>{
        if(valid){

            this.checkUser()

          }
        })
    },
   async checkUser(){
     this.loadingpwd=true
        const url="/AppUser/authentication"
        try {

          const res= await sendPostByKeyValue(url,{workNumber:this.resetModel.workNumber,idCard:this.resetModel.idCard})
          if(res?.code==200){
            setTimeout(() => {
              this.$message({type:'success',message:"身份验证成功,可以修改密码!"})
              this.step=2
              this.userInfo=res.data
                this.loadingpwd=false
            }, 1200);
          }
        } catch (error) {
          this.loadingpwd=false
            this.$message({type:"error",message:"身份验证错误,请确认账号/工号是否正确!"})
        }
    },
    upPwd(){
         this.$refs.restPwd.validate(async valid=>{

            if(valid){
              this.loadingpwd=true
              const url="/AppUser/updatePassword"
              const data={
                userId:this.userInfo.userId,
                newPassword:this.resetModel.nwepwd
              }
              try {
                const res =await  sendPostByKeyValue(url,data)
                if(res&&res.code==200){
                  setTimeout(() => {
                     this.$message({type:"success",message:"修改密码成功,请重新登录!"})
                     this.loadingpwd=false
                     this.changePwd=false
                     this.step=1
                   }, 1200);
                }

              } catch (error) {
                  this.loadingpwd=false
                  this.$message({type:"error",message:"修改密码失败!"})
              }
            }
         })
    },
    returnLogin(){
      this.changePwd=false
      this.$refs.restPwd.clearValidate()
      this.$refs.loginForm.clearValidate()
    }
  }
};
</script>

<style>

  .resetPwd input {
    padding-left: 20px !important ;
  }
</style>
<style scoped>
  .blod{
    font-weight: 600;
    font-size: 1rem;
  }

</style>

<style>
  /*取消微软浏览器的密码小眼睛样式*/
  input[type="password"]::-ms-reveal {
    display: none;
  }
</style>

