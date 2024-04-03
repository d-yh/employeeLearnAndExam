<template>
  <div class="bg_gray w-100">
    <div class="container py-4">
      <div class="bg-white rounded-4 overflow-hidden">
        <el-image fit="cover" :src="require('/public/static/images/bg_forum.jpg')" class="w-100" style="height:180px"></el-image>
        <el-row type="flex" class="px-5">
          <el-avatar :size="120" :src="userInfo.photo"  class="border border-white border-2 position-relative" style="top:-2rem;border-radius:1rem"></el-avatar>
          <div class="ms-3">
            <h3 class="fw-bold mt-2">{{ userInfo.nickname }}</h3>
            <div class="text_gray">发贴：{{ total }}</div>
          </div>
        </el-row>
        <div class="px-5">
          <h4 class="mt-3">他的贴子</h4>
          <div class="w-100 list-group border-0">
            <div class="list-group-item px-0 py-4" v-for="bbs in bbsList" :key="bbs.bbsId">
              <router-link :to="{path:link,query:{bbsId:bbs.bbsId}}">
                <el-link :underline="false" class="fs-5 fw-bold mb-2 text-truncate d-block">{{ bbs.title }}</el-link>
              </router-link>
              <div class="d-flex">
                <router-link v-if="bbs.picture" :to="{path:link,query:{bbsId:bbs.bbsId}}">
                  <el-link :underline="false">
                    <el-image :src="bbs.picture.split(',')[0]"  class="post_image rounded-3 align-middle me-3"></el-image>
                  </el-link>
                </router-link>
                <div class="col overflow-hidden d-flex flex-column">
                  <div class="col">
                    <router-link :to="{path:link,query:{bbsId:bbs.bbsId}}">
                      <el-link :underline="false" class="text_gray text_truncate_2">{{bbs.content}}</el-link>
                    </router-link>
                  </div>
                  <el-row type="flex" class="text_lightgray mt-4">
                    <div class="me-3 d-flex align-center">
                      <i class="ri-chat-2-fill"></i>
                      <span class="px-1">{{ bbs.commentsCount }}</span>
                    </div>
                    <div class="me-3 d-flex align-center">
                      <i class="ri-eye-fill"></i>
                      <span class="px-1">{{ bbs.views }}</span>
                    </div>
                    <div>{{ bbs.code }}</div>
                    <div class="ms-auto">{{ bbs.createTime }}</div>
                  </el-row>
                </div>
              </div>
            </div>
            <pagenation
              class="p-3  border-top border-light"
              :total="total"
              :auto-scroll="false"
              :pageSizes="[20, 40, 60, 80,100]"
              :page.sync="serverQuery.page"
              :limit.sync="serverQuery.size"
              @pagination="getBbsList"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import {sendPostByKeyValue} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
export default {
  components:{
    Pagenation
  },
  data() {
    //页面数据容器
    return {
      profilePhotoUrl: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
      textarea: '',
      textarea2: '回复 用户名：',
      bbsList:[],
      total:0,
      link:'/examinationEvaluating/forum_info',
      serverQuery:{
        page:1,
        size:20,
        userId:undefined
      },
      userInfo:{}
    };
  },
  mounted() {
    this.userId = this.$route.query.userId
    this.getUserInfo()
    this.getBbsList()
  },
  //监听
  watch: {
  },

  //方法
  methods: {
    async getUserInfo(){
      const url = "/AppUser/getUserInfo"
      const response= await  sendPostByKeyValue(url,{userId:this.userId})
      if(response?.code === 200){
        this.userInfo = response.data
      }
    },
    async getBbsList(){
      const url="/AppBbs/getUserBbs"
      this.serverQuery.userId = this.userId
      const response= await  sendPostByKeyValue(url,this.serverQuery)
      if(response?.code === 200){
        this.total = response.data.total
        this.bbsList = response.data.list
      }
    }
  }
};
</script>

<style scoped>
</style>
