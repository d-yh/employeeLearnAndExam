<template>
  <div class="bg_gray w-100 h-100 px-4 py-3 vstack">
    <el-tag
      class="w-100 d-flex align-items-center px-3 rounded-4"
      style="height:40px"
      closable
      v-if="onlineInfo.testPrompt&&tag"
      @close="tag=false"
      type="danger">
      <div class="fs-6 text-center col">
        {{onlineInfo.testPrompt}}
        <router-link to="/examinationEvaluating/my_exam">
          <el-link type="danger" :underline="false" class="text-decoration-underline fs-6" style="bottom:2px">去考试</el-link>
        </router-link>
      </div>
    </el-tag>
    <el-row type="flex" align="middle" justify="space-between" class="py-3">
      <h4>在线时长：<span class="fw-bold">{{ onlineInfo.onlineTime }}分钟</span></h4>
      <!-- 搜索框 -->
      <el-input
        placeholder="搜索一级分类"
        class="input_outsid_card rounded-3"
        v-model="keyword"
        @input="getClassificationOne"
        style="width:300px"
        prefix-icon="ri-search-line">
      </el-input>
    </el-row>
    <el-row type="flex" class="col align-items-start p-2 h-75">
      <div class="col bg-white rounded-4 overflow-hidden me-3 py-3">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="traning_tab">
          <el-tab-pane v-for="classificationOne in classificationOneList" :key="classificationOne.professionId" :label="classificationOne.name" :name=" classificationOne.professionId.toString()">
            <el-row type="flex" class="flex-wrap bg_lightgray p-3 tab_items">
              <el-button @click="searchTraining(undefined)" size="medium" round :class="'m-1 bg_gray '+(classificationTwoId===undefined&&'active')">全部</el-button>
              <el-button v-for="classificationTwo in classificationTwoList" :key="classificationTwo.professionId" size="medium" round
                         @click="searchTraining(classificationTwo.professionId)"
                         :class="'m-1 bg_gray '+(classificationTwoId===classificationTwo.professionId&&'active')"  >{{classificationTwo.name}}</el-button>
            </el-row>
            <el-row :gutter="30" class="py-3 px-4">
              <el-col v-for="training in  trainingList" :key="training.trainingId" :span="6" class="overflow-hidden">
                <router-link :to="{path:'/examinationEvaluating/course_info',query:{trainingId:training.trainingId}}">
                  <el-link class="ratio ratio-16x9" :underline="false">
                    <el-image :src="training.cover" fit="cover" class="bg_gray rounded-4 overflow-hidden w-100 h-100"></el-image>
                  </el-link>
                  <el-link :underline="false" class="d-block mt-2 text-truncate px-1 fs-6">{{training.name}}</el-link>
                </router-link>
                <div class="text_lightgray px-1 fs_sm mt-1">共{{ training.classCount }}节</div>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="bg-white rounded-4 p-2 h-75 scroll_bar" style="width:300px">
        <el-row type="flex" align="middle" justify="space-between" class="py-2">
          <div class="fw-bold px-3">公告</div>
          <el-button class="border-0 ps-3 pe-2" round size="medium" @click.native="getTrainingMessageHistory">历史公告 <i class="ri-arrow-right-s-line"></i></el-button>
        </el-row>
        <el-scrollbar class="column py-4">
          <p>{{trainingMessage.title}}</p>
          <p v-html="trainingMessage.content" class="px-2"></p>
        </el-scrollbar>
      </div>
    </el-row>

    <!-- 历史公告 -->
    <el-dialog
      :modal-append-to-body="false"
      width="800px"
      :visible.sync="historyPA"
      top="0"
      :append-to-body="true"
      custom-class="rounded-4"
    >
      <el-tabs v-model="showTab">
        <el-tab-pane @click="showTab='first'" label="历史公告" name="first" class="h-100 py-2">
          <el-scrollbar class="column rounded-4">
              <p style="cursor: pointer" @click="showMessageDetail(item.content)" class="px-3 py-1" v-for="item in  trainingMessageHistory" :key="item.policyConfigId">{{item.title}}</p>
            <pagenation
              class="p-3  border-top border-light"
              :total="total"
              :auto-scroll="false"
              :pageSizes="[20, 40, 60, 80,100]"
              :page.sync="serverQuery.page"
              :limit.sync="serverQuery.size"
              @pagination="getTrainingMessageHistory"
            />
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane v-if="showTab==='second'" label="公告详情" name="second" class="h-100 py-2">
          <el-scrollbar class="column rounded-4">
            <p v-html="historyDetail" class="p-2"></p>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>



<script>
import {sendPost, sendPostByKeyValue} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
export default {
  components:{
    Pagenation
  },
  data() {
    //页面数据容器
    return {
      tag: true,
      onlineInfo: {},
      activeName: 'second',
      historyPA: false,
      classificationOneList:[],
      classificationOneId:undefined,
      classificationTwoList:[],
      classificationTwoId:undefined,
      trainingList:[],
      keyword:"",
      trainingMessage:{},
      trainingMessageHistory:[],
      total:0,
      serverQuery:{
        page:1,
        size:20
      },
      historyDetail:undefined,
      showTab:"first"
    };
  },
  created() {
    this.getOnlineInfo()
    this.getClassificationOne()
    this.getTrainingMessage()
  },
  //监听
  watch: {
  },

  //方法
  methods: {
    handleClick(tab,event){
      this.activeName = this.classificationOneList[tab.index].professionId.toString()
      this.classificationOneId = this.classificationOneList[tab.index].professionId
      this.getClassificationTwo()
    },
    async getOnlineInfo(){
      const url = "/AppTraining/selectOnlineTime"
      const response = await sendPost(url)
      if(response?.code === 200){
        this.onlineInfo = response.data
      }
    },
    async getClassificationOne(){
      const url = "/AppTraining/getAllClassificationOne"
      const response = await sendPostByKeyValue(url,{keyword:this.keyword})
      if(response?.code === 200){
        this.classificationOneList = response.data
        this.activeName =  this.classificationOneList[0].professionId.toString()
        this.classificationOneId= this.classificationOneList[0].professionId
        await this.getClassificationTwo()
      }
    },
    async getClassificationTwo(){
      const url = "/AppTraining/getAllClassificationTwo"
      const response = await sendPostByKeyValue(url,{professionId:this.classificationOneId})
      if(response?.code === 200){
        this.classificationTwoList = response.data
        this.classificationTwoId = undefined
        await this.getAllTraining()
      }
    },
    async getAllTraining(){
      const url = "/AppTraining/getAllTraining"
      const response = await sendPostByKeyValue(url,{professionId:this.classificationTwoId??this.classificationOneId,selectType:this.classificationTwoId?2  :1})
      if(response?.code === 200){
        this.trainingList = response.data
      }
    },
    searchTraining(id){
      this.classificationTwoId = id;
      this.getAllTraining()
    },
    async getTrainingMessage(){
      const url = "/AppTraining/getTrainingMessage"
      const response = await sendPost(url)
      if(response?.code === 200)
      {
        this.trainingMessage = response.data
      }
    },
    async getTrainingMessageHistory(){
      const url = "/AppTraining/getAllTrainingMessage"
      const response = await sendPostByKeyValue(url,this.serverQuery)
      if(response?.code === 200)
      {
        this.total = response.data.list.length
        this.trainingMessageHistory = response.data.list
        this.historyPA=true
      }
    },
    showMessageDetail(content){
      this.showTab='second'
      this.historyDetail=content
    }
  }
};
</script>

<style scoped>
</style>
