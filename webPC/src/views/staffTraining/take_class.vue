<template>
  <div class="bg_lightgray w-100 h-100 scroll_bar" @scroll="scrollEvent" >
    <div class="page_container">

      <el-breadcrumb separator-class="el-icon-arrow-right fs_sm" class="fs-6 p-4">
        <el-breadcrumb-item :to="{ path: '/staffTraining/staff_training' }" class="text_gray">员工培训</el-breadcrumb-item>
        <el-breadcrumb-item>{{ trainingDetail.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row type="flex">
        <el-col  :span="18" class="pb-3">
          <!-- 文本 -->
          <div class="w-100 bg-white rounded-4 p-4" v-if="chapterDetail.suffix==='pdf'">
            <pdf
              v-for="i in numPages"
              :ref="chapterDetail.suffix"
              :page="i"
              :key="i"
              :src="chapterDetail.fileUrl"
            >
            </pdf>
          </div>
          <!-- 视频 -->
          <div class="w-100 bg-dark rounded-4 hstack" style="height:calc(100vh - 170px)" v-if="chapterDetail.suffix==='mp4'">
            <video @timeupdate="setContinueTime"  controls controlsList="nodownload noplaybackrate"  oncontextmenu = "return false" disablePictureInPicture="true" @playing="addTotalTime" @pause="pauseTotalTime"  id="video" @ended="unLockChapter" :src="chapterDetail.fileUrl" class="w-100 h-100"></video>
          </div>
        </el-col>
        <el-col :span="6" class="position-sticky end-0" style="top:10px;height:calc(100vh - 90px)">
          <el-scrollbar class="h-100 w-100 column">
            <el-collapse v-model="allItem" @change="changeCatalog" class="course_catalog border-0">
              <el-collapse-item v-for="(chapter,indexChapter) in trainingDetail.chapterExtendList" :key="chapter.chapterId" :name="chapter.chapterId.toString()">
                <template slot="title">
                  <i class="header-icon ri-lock-2-fill d-none"></i>第{{toChinesNum(indexChapter+1)}}章  {{ chapter.chapterName }}
                </template>
                <el-button class="load_detail" ref="loadDetail" v-for="(cc,ccIndex) in chapter.children" @click="loadDetail(cc.chapterId)" :key="cc.chapterId" :disabled="cc.isUnlock!==1" :icon="cc.isUnlock!==1?'ri-lock-2-fill':''">
                  第{{toChinesNum(ccIndex+1)}}节  {{ cc.chapterName }}
                </el-button>
              </el-collapse-item>
            </el-collapse>
          </el-scrollbar>
        </el-col>
      </el-row>
    </div>
  </div>
</template>



<script>
import {sendPost, sendPostByKeyValue} from "@/utils/httpUtils";
import pdf from 'vue-pdf'
export default {
  components:{
    pdf
  },
  data() {
    //页面数据容器
    return {
      allItem:[],
      trainingDetail:{},
      trainingId:undefined,
      chapterDetail:{},
      numPages:0,
      timer:null,
      totalTime:0,
      timerTotal:undefined,
      playTime:0,
      chapterUserId:undefined
    };
  },

  //监听
  watch: {

  },
  mounted() {
    this.trainingId =this.$route.query.trainingId
    this.getDetail()
    this.timer = setInterval(()=>{
      this.addOnlineTime()
    },60000)
  },
  //方法
  methods: {
    setContinueTime(e){
      let videoCurrent = document.getElementById('video')
      let currentTime = videoCurrent.currentTime
      if(this.playTime<currentTime)this.saveTimeLine(currentTime.toString().split('.')[0])
    },
    async saveTimeLine(time){
      const url ="/AppTraining/setContinuationTime"
      await sendPostByKeyValue(url,{chapterUserId:this.chapterUserId,continuation:time * 1000})
      this.playTime = time
    },
    async addOnlineTime()
    {
      const url ="/AppTraining/increaseOnlineTime"
      await sendPostByKeyValue(url,{onlineTime:1})
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    changeCatalog(val) {
      console.log(val);
    },
    async getDetail()
    {
      const url = "/AppTraining/getAllTrainingChapter"
      const response = await sendPostByKeyValue(url,{trainingId:this.trainingId})
      if(response?.code === 200)
      {
        this.trainingDetail = response.data
        this.limitTime = this.trainingDetail.intervalTime
        this.allItem=[]
        response.data.chapterExtendList.forEach((item,index)=>this.allItem.push(item.chapterId.toString()))
        const chapterId = localStorage.getItem('course_item')
        this.loadDetail( Number(chapterId))
      }
    },
    loadDetail(chapterId)
    {
      clearInterval(this.timerTotal)
      this.trainingDetail.chapterExtendList.forEach(item=>{
        item.children.forEach(i=>{
          if(i.chapterId === chapterId){
            this.chapterDetail = i
          }
        })
      })
      if(this.chapterDetail.suffix === 'pdf')
      {
        this.addTotalTime()
        let loadingTask = pdf.createLoadingTask(this.chapterDetail.fileUrl)
        loadingTask.promise.then(pdf => {
          this.numPages = pdf.numPages
        }).catch(err => {
          console.error('pdf 加载失败', err);
        })
      }
      else
      {

        this.$nextTick(()=>{
          this.chapterUserId = this.chapterDetail.chapterUserId
          let video = document.getElementById('video')
          video.currentTime = Number(this.chapterDetail.continuation??0)/1000
        })

      }

      localStorage.setItem('course_item', chapterId)
    },
    scrollEvent(e)
    {
      const {scrollTop,clientHeight,scrollHeight} = e.target
      if(scrollTop >= scrollHeight-1.5*clientHeight&&this.chapterDetail.suffix==='pdf'){
        this.unLockChapter()
      }
    },
    unLockChapter(){
      const url = "/AppTraining/unlockChapter"
      sendPostByKeyValue(url,{chapterId:this.chapterDetail.chapterId}).then(res=>{
        if(res.code === 200)this.getDetail()
      }).catch(e=>{})
    },
    async alterAntiCheating(){
      let video = document.getElementById("video")
      this.chapterDetail.suffix==='mp4'&&video.pause()
      const url = "/AppTraining/getAntiCheating"
      const response = await sendPost(url)
      if(response?.code===200)
      {
        const question = response.data
        this.$prompt("<h5 style='text-align: center'>"+question.note+":"+question.topic+"</h5>", '防作弊检测', {
          confirmButtonText: '确定',
          showCancelButton:false,
          showClose:false,
          inputValidator:(value)=>{
            if(value !== question.answer)return "答案错误"
          },
          inputErrorMessage: '答案错误',
          closeOnClickModal:false,
          dangerouslyUseHTMLString:true
        }).then(({ value }) => {
          this.$message({
            type: 'success',
            message: '输入正确 '
          });
          this.chapterDetail.suffix==='mp4'&&video.play()
          this.addTotalTime()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
      }
    },
    toChinesNum(num) {
      let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
      let unit = ["", "十", "百", "千", "万"];
      num = parseInt(num);
      let getWan = (temp) => {
        let strArr = temp.toString().split("").reverse();
        let newNum = "";
        for (var i = 0; i < strArr.length; i++) {
          newNum = (i === 0 && strArr[i] === 0 ? "" : (i > 0 && strArr[i] === 0 && strArr[i - 1] === 0 ? "" : changeNum[strArr[i]] + (strArr[i] === 0 ? unit[0] : unit[i]))) + newNum;
        }
        return newNum;
      }
      let overWan = Math.floor(num / 10000);
      let noWan = num % 10000;
      if (noWan.toString().length < 4) noWan = "0" + noWan;
      return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
    },
    addTotalTime(){
      clearInterval(this.timerTotal)
      this.timerTotal = setInterval(async ()=>{
        this.totalTime+=1000;
        if(this.totalTime >= this.trainingDetail.intervalTime*60000){
          this.totalTime = 0
          clearInterval(this.timerTotal)
          await this.alterAntiCheating()
        }
      },1000)
    },
    pauseTotalTime(){
      clearInterval(this.timerTotal)
    }
  },
  destroyed() {
    clearInterval(this.timer)
    clearInterval(this.timerTotal)
    window.removeEventListener('popstate', this.checkLeaveWindow)
  },

};
</script>

<style scoped>
video::-webkit-media-controls-timeline{
  display: none;
}
</style>
