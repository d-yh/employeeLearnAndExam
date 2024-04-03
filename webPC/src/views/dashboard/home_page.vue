<template>
<div>
  <div :class="{'fixed-header':fixedHeader}">
    <navbar />
  </div>
  <div class="bg_lightgray mg-vh-100 app-main">
    <div class="py-3 page_container">
      <el-row type="flex" :gutter="30" class="flex-wrap">
        <el-col :span="18" class="p-2 home_tag">
          <el-carousel class="rounded-4 home_carousel">
            <el-carousel-item v-for="item in carousel_image" :key="item.bannerId">
              <img :src="item.photo" alt="" height="300"/>
            </el-carousel-item>
          </el-carousel>

        <el-row type="flex" :gutter="30" class="flex-wrap">
          <el-col :span="8" class="p-2 home_tag">
            <router-link to="/manpower_resource/manpower_resource">
              <a class="w-100 p-4">
                  <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-parent-fill"></i></div></div>
                  <div class="fw-bold fs-5">人力管理</div>
              </a>
            </router-link>
          </el-col>
          
          <el-col :span="8" class="p-2 home_tag">
            <router-link to="/staffTraining/staff_training">
              <a class="w-100 p-4">
                  <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-bookmark-3-fill"></i></div></div>
                  <div class="fw-bold fs-5">员工培训</div>
              </a>
            </router-link>
          </el-col>
          <el-col :span="8" class="p-2 home_tag">
            <router-link to="/examinationEvaluating/my_exam">
              <a class="w-100 p-4">
                  <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-pen-nib-fill"></i></div></div>
                  <div class="fw-bold fs-5">考试测评</div>
              </a>
            </router-link>
          </el-col>

        </el-row>
        <el-row type="flex" :gutter="30" class="flex-wrap">
          <div style="background-image:linear-gradient(180deg,transparent,#f2f6f7 500px)">
            <div class="d-flex py-5 page_container">
              <div class="col me-4 overflow-hidden">
                <h4 class="px-1 mb-3">精选贴子</h4>
                <div class="w-100 card list-group border-0 rounded-4">
                </div>
              </div>
            </div>
          </div>
        </el-row>
      </el-col>

        <el-col :span="6" class="p-2 home_tag">
            <router-link v-for="item in recommendedList" :key="item.trainingId" :to="{path:'/examinationEvaluating/course_info',query:{trainingId:item.trainingId}}">
              <a  class="ratio ratio-16x9 courses_recommend rounded-4 mt-3">
                <el-image :src="item.cover"  class="center w-100 h-100"></el-image>
                <div class="courses_cover text-truncate">{{ item.name }}</div>
              </a>
            </router-link>
        </el-col>
    </el-row>

    

    </div>


    

  
  </div>
</div>

</template>

<script>
import {Navbar} from '@/layout/components'
import {sendGet, sendPost, sendPostByKeyValue} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
export default {
  components: {
    Navbar,
    Pagenation
  },
  data() {

    //页面数据容器
    return {
      carousel_image:[],
      fits:['cover'],
      total:0,
      serverQuery:{
        page:1,
        size:20
      },
      selectionLink:"/examinationEvaluating/forum_info",
      recommendedList:[]
    };
  },
  mounted() {
    this.getRecommended()
    this.getBanner()
    this.getSelection()
  },
  //监听
  watch: {
  },

  computed: {
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
  },
  //方法
  methods: {
    async getBanner() {
      const url = "/HomePage/getBannerOfWeb"
      const response =  await sendPost(url);
      if(response?.code === 200){
        this.carousel_image = response.data
      }
    },
    
    async getRecommended(){
      const url ="/HomePage/trainingRecommended"
      const response = await sendPost(url);
      if(response?.code === 200 ){
        this.recommendedList=response.data
      }
    }
  }
};
</script>
<style>
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
     background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
     background-color: #d3dce6;
  }
</style>


