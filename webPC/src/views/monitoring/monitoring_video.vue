<template>
<div class="w-100 bg_lightgray">
  <div :class="{'fixed-header':fixedHeader}">
    <navbar />
  </div>
  <div class="page_container app-main">
    <div class="vstack content_height py-4">
      <el-breadcrumb separator-class="el-icon-arrow-right fs_sm" class="fs-6 mb-4">
        <el-breadcrumb-item :to="{ path: '/' }" class="text_gray">监控</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/' }" class="text_gray">摄像头1</el-breadcrumb-item>
        <el-breadcrumb-item>VIDEO_20211214_093904.mp4</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row type="flex" align="middle" class="col overflow-hidden">
        <div class="col rounded-4 bg-dark h-100 vstack me-3 overflow-hidden">
          <el-row type="flex" align="middle" class="text_lightgray fs_sm px-3 py-2">
            <div class="text-white fs-6">VIDEO_20211214_093904.mp4</div>
            <div class="text-white-50 mx-3">2021-12-12 09:39:04</div>
            <!-- 摄像头信息 -->
            <div class="ms-auto ">摄像头: <span>名称</span></div>
            <div class="mx-4">定位: <span>中国</span></div>
            <div class="">项目: <span>项目名称</span></div>
          </el-row>
          <!-- 监控视频 -->
          <video src="" class="w-100"></video>
          <!-- 互动信息 -->
          <div class="col overflow-hidden">
            <el-scrollbar class="h-100 w-100 column bg-dark">
              <div class="px-4 py-3">
                <el-row type="flex" class="my-2" align="middle">
                  <div class="text-white text-opacity-75"><span>用户名</span>：</div>
                  <div class="text-light">互动内容</div>
                </el-row>
                <el-row type="flex" class="my-2" align="middle">
                  <div class="text-white text-opacity-75"><span>用户名</span>：</div>
                  <div class="text-light">互动内容</div>
                </el-row>
              </div>
            </el-scrollbar>
          </div>
        </div>
        <!-- 回放列表 -->
        <div class="card border-0 h-100" style="width:360px;box-shadow:0 0 5px rgba(0,0,0,.03)">
          <el-date-picker
            v-model="value1"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="position-relative rounded-3 border-0 w-100 bg-transparent px-4" style="top:10px">
          </el-date-picker>
          <el-scrollbar class="column col overflow-hidden">
            <el-table :data="tableData" class="w-100 h-100 left_bar py-3" :show-header="false" :highlight-current-row="true" row-class-name="left_bar_items">
              <el-table-column align="left">
                <template scope="scope">
                  <div class="fw-bold fs-6 my-1">{{ scope.row.name }}</div>
                  <div class="me-2 text_lightgray">{{ scope.row.time }}</div>
                </template>
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>
      </el-row>
    </div>
    
    <div class="px-5 mt-5">
      
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
      tableData: [{
          name: 'VIDEO_20211214_093904.mp4',
          time: '2021-12-12 09:39:04'
        },{
          name: 'VIDEO_20211214_093904.mp4',
          time: '2021-12-12 09:39:04'
        },{
          name: 'VIDEO_20211214_093904.mp4',
          time: '2021-12-12 09:39:04'
        }],
      profilePhotoUrl: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
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

<style scoped>
</style>
