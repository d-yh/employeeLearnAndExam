<template>
<div>
  <div :class="{'fixed-header':fixedHeader}">
    <navbar />
  </div>
  <div class="bg_lightgray mg-vh-100 app-main">
    <div class="py-3 page_container">
      <el-carousel class="rounded-4 home_carousel">
        <el-carousel-item v-for="item in carousel_image" :key="item"></el-carousel-item>
      </el-carousel>
    </div>
    <div class="page_container">
      <el-row type="flex" :gutter="30" class="flex-wrap">
        <el-col :span="3" class="p-2 home_tag">
          <a class="w-100 p-4">
            <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-map-pin-time-fill"></i></div></div>
            <div class="fw-bold fs-5">项目进度</div>
          </a>
        </el-col>
        <el-col :span="3" class="p-2 home_tag">
          <a class="w-100 p-4">
            <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-slideshow-3-fill"></i></div></div>
            <div class="fw-bold fs-5">监控</div>
          </a>
        </el-col>
        <el-col :span="3" class="p-2 home_tag">
          <a class="w-100 p-4">
            <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-calendar-fill"></i></div></div>
            <div class="fw-bold fs-5">站班</div>
          </a>
        </el-col>
        <el-col :span="3" class="p-2 home_tag">
          <a class="w-100 p-4">
            <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-parent-fill"></i></div></div>
            <div class="fw-bold fs-5">人力管理</div>
          </a>
        </el-col>
        <el-col :span="3" class="p-2 home_tag">
          <a class="w-100 p-4">
            <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-bar-chart-2-fill"></i></div></div>
            <div class="fw-bold fs-5">数据统计</div>
          </a>
        </el-col>
        <el-col :span="3" class="p-2 home_tag">
          <a class="w-100 p-4">
            <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-bookmark-3-fill"></i></div></div>
            <div class="fw-bold fs-5">员工培训</div>
          </a>
        </el-col>
        <el-col :span="3" class="p-2 home_tag">
          <a class="w-100 p-4">
            <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-pen-nib-fill"></i></div></div>
            <div class="fw-bold fs-5">考试测评</div>
          </a>
        </el-col>
        <el-col :span="3" class="p-2 home_tag">
          <a class="w-100 p-4">
            <div class="icon_container m-2"><div class="home_tag_icon"><i class="center ri-chat-quote-fill"></i></div></div>
            <div class="fw-bold fs-5">论坛</div>
          </a>
        </el-col>
      </el-row>
    </div>

  <div style="background-image:linear-gradient(180deg,transparent,#f2f6f7 500px)">
    <div class="d-flex py-5 page_container">
      <div class="col me-4 overflow-hidden">
        <h4 class="px-1 mb-3">精选贴子</h4>
        <div class="w-100 card list-group border-0 rounded-4">

          <div class="list-group-item p-4">
            <el-link :underline="false" class="fs-5 fw-bold mb-2">贴子标题</el-link>
            <div class="d-flex">
              <el-link :underline="false">
                <el-image :src="url" :fit="fit" class="post_image rounded-3 align-middle me-3"></el-image>
              </el-link>
              <div class="col overflow-hidden d-flex flex-column">
                <div class="col">
                  <el-link :underline="false" class="text_gray">贴子内容</el-link>
                </div>
                <el-row type="flex" class="text_lightgray mt-4">
                  <div class="me-3 d-flex align-center">
                    <i class="ri-chat-2-fill"></i>
                    <span class="px-1">123</span>
                  </div>
                  <div class="me-3 d-flex align-center">
                    <i class="ri-eye-fill"></i>
                    <span class="px-1">123</span>
                  </div>
                  <div class="me-3">锅炉区</div>
                  <el-link :underline="false">作者：名字</el-link>
                  <div class="ms-auto">2020-11-11</div>
                </el-row>
              </div>
            </div>
          </div>
          <div class="list-group-item p-4">
            <el-link :underline="false" class="fs-5 fw-bold mb-2 text-truncate d-block">贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题</el-link>
            <div class="d-flex">
              <el-link :underline="false">
                <el-image :src="url" :fit="fit" class="post_image rounded-3 align-middle me-3"></el-image>
              </el-link>
              <div class="col overflow-hidden d-flex flex-column">
                <div class="col">
                  <el-link :underline="false" class="text_gray text_truncate_2">贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容</el-link>
                </div>
                <el-row type="flex" class="text_lightgray mt-4">
                  <div class="me-3 d-flex align-center">
                    <i class="ri-chat-2-fill"></i>
                    <span class="px-1">123</span>
                  </div>
                  <div class="me-3 d-flex align-center">
                    <i class="ri-eye-fill"></i>
                    <span class="px-1">123</span>
                  </div>
                  <div class="me-3">锅炉区</div>
                  <el-link :underline="false">作者：名字</el-link>
                  <div class="ms-auto">2020-11-11</div>
                </el-row>
              </div>
            </div>
          </div>
          <div class="list-group-item p-4">
            <el-link :underline="false" class="fs-5 fw-bold mb-2 text-truncate d-block">贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题贴子标题</el-link>
            <div class="d-flex">
              <el-link :underline="false">
              </el-link>
              <div class="col overflow-hidden d-flex flex-column">
                <div class="col">
                  <el-link :underline="false" class="text_gray text_truncate_2">贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容贴子内容</el-link>
                </div>
                <el-row type="flex" class="text_lightgray mt-4">
                  <div class="me-3 d-flex align-center">
                    <i class="ri-chat-2-fill"></i>
                    <span class="px-1">123</span>
                  </div>
                  <div class="me-3 d-flex align-center">
                    <i class="ri-eye-fill"></i>
                    <span class="px-1">123</span>
                  </div>
                  <div class="me-3">锅炉区</div>
                  <el-link :underline="false">作者：名字</el-link>
                  <div class="ms-auto">2020-11-11</div>
                </el-row>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div style="width:300px">
        <h4>课程推荐</h4>
        <a class="ratio ratio-16x9 courses_recommend rounded-4 mt-3">
          <el-image :src="url" :fit="fit" class="center w-100 h-100"></el-image>
          <div class="courses_cover text-truncate">课程名字</div>
        </a>
        <a class="ratio ratio-16x9 courses_recommend rounded-4 mt-3">
          <el-image :src="url" :fit="fit" class="center w-100 h-100"></el-image>
          <div class="courses_cover text-truncate">课程名字课程名字课程名字课程名字课程名字</div>
        </a>
      </div>
    </div>
  </div>
  </div>
</div>

</template>

<script>
import {Navbar} from '@/layout/components'
export default {
  components: {
    Navbar
  },
  data() {

    //页面数据容器
    return {
      carousel_image:[
        {},
        {}
      ],
      fits:['cover'],
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
    };
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


