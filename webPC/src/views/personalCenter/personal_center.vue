<template>
  <div class="position-relative w-100 h-100">
    <div class="bg_peronal_center"></div>
    <div :class="{'fixed-header':fixedHeader}">
      <navbar />
    </div>
    <div class="page_container min-vh-100 d-flex">
      <div class="personal_nav me-3">
        <div class="py-4">
          <div class="card border-0 rounded-4 align-items-center px-4 py-2">
            <el-avatar class="mt-4" :size="100" :src="userInfo.photo" fit="cover"></el-avatar>
            <h3 class="mt-3 mb-0 fw-bold">{{ userInfo.nickname }}</h3>
            <div class="fs_sm my-2 rounded-pill bg_lightgray border px-3">{{ userInfo.workType }}</div>
            <div class="text_gray fs_sm mt-3">专业：<span>{{ userInfo.professionName }}</span></div>
            <div class="text_gray fs_sm mt-1">作业层等级：<span>{{userInfo.workCodeName}}</span></div>
            <el-button class="my-3" icon="ri-pencil-fill me-1" round  @click="dialogVisible = true">查看个人资料</el-button>
          </div>
          <div class="card border-0 mt-3">
            <ul class="nav gap-1">
              <li v-if="permissions.includes('2081')" class="nav-item">
                <router-link :to="{name:'personalTraining'}">
                  <i class="ri-booklet-line"></i>
                  <span class="ms-2">我的培训</span>
                </router-link>
              </li>
              <li v-if="permissions.includes('2082')" class="nav-item">
                <router-link :to="{name:'personalExam'}">
                  <i class="ri-file-list-3-line"></i>
                  <span class="ms-2">我的考试</span>
                </router-link>
              </li >
              <li v-if="permissions.includes('2080')" class="nav-item">
                <router-link :to="{name:'personalPost'}">
                  <i class="ri-file-copy-2-line"></i>
                  <span class="ms-2">我的贴子</span>
                </router-link>
              </li>
              <li v-if="permissions.includes('2083')" class="nav-item">
                <router-link :to="{name:'personalComment'}">
                  <i class="ri-message-2-line"></i>
                  <span class="ms-2">我的评论</span>
                </router-link>
              </li>
              <li v-if="permissions.includes('2084')" class="nav-item">
                <router-link :to="{name:'personalFavorite'}">
                  <i class="ri-heart-line"></i>
                  <span class="ms-2">我的收藏</span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="personanl_content col">
          <router-view />
      </div>
    </div>

    <el-dialog :visible.sync="dialogVisible" width="600px" top="0" :append-to-body="true" custom-class="rounded-4">
      <el-scrollbar class="column rounded-4">
        <div class="mx-auto py-5" style="width: 420px">
          <el-form label-width="110px">
          <p class="fw-bold text-center fs-6 py-2">基础信息</p>
          <el-form-item label="姓名" prop="name">
            <el-input disabled class="rounded-2 pe-5" v-model="userInfo.nickname"></el-input>
          </el-form-item>
          <el-form-item label="性别" prop="resource">
            <el-radio-group disabled class=" pe-5" v-model="userInfo.gender">
              <el-radio :label="0">男</el-radio>
              <el-radio :label="1">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="身份证" prop="age">
            <el-input disabled class="rounded-2 pe-5" v-model="userInfo.idCard"></el-input>
          </el-form-item>
          <el-form-item label="民族" prop="region">
            <el-select disabled class="rounded-2 w-100 pe-5" v-model="userInfo.national" >
            </el-select>
          </el-form-item>
          <p class="fw-bold text-center fs-6 py-2">岗位信息</p>
          <el-form-item label="作业层等级" prop="region">
            <el-select disabled class="rounded-2 w-100 pe-5" v-model="userInfo.workCodeName">
            </el-select>
          </el-form-item>
          </el-form>
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script>
import {Navbar} from '@/layout/components'
import {sendGet, sendPost} from "@/utils/httpUtils";
import {getPermissionList} from "@/api/user";
export default {
  components: {
    Navbar
  },
  data () {
    return {
      dialogVisible: false,
      userInfo:{},
      permissions:[]
    }
  },
  computed: {
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
  },
  mounted() {
    this.getUserInfo()
    this.getPermission()
  },
  methods: {

   async getPermission(){
     const url = "/AppUser/myAppPermission"
     const result = await sendPost(url)
     if(result?.code === 200){
       this.permissions = result.data.map(permission=>permission.permissionCode)
     }
   },
   async getUserInfo()
    {
      const url =  "/AppMySelf/getAppMySelfInfo"
      const response =  await sendGet(url);
      if(response?.code === 200)
      {
        const workTypeList = {0:"内部员工",1:"外部员工",2:"管理员"}
        this.userInfo = response.data
        this.userInfo.workType = workTypeList[this.userInfo.workType]
      }
    }

  }
}
</script>
