<template>
  <div class="d-flex w-100 h-100">
    <div class="sticky_left bg-white  d-flex flex-column " style="width:450px;border-right:1px solid #f3f3f3">
      <el-row class="p-3">
        <el-col :span="24">
          <el-input
            placeholder="搜索"
            class="mb-2 rounded-3 input_inside_card"
            prefix-icon="ri-search-line" v-model="serverQuery.keyword" @input="fetchData">
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-select v-model="serverQuery.country" @change="fetchData" filterable clearable class="rounded-3 form-group transparent" placeholder="选择国家" style="width:120px">
            <el-option
              v-for="item in countryList"
              :key="item.value"
              :label="item.label"
              :value="item.label">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-select v-model="serverQuery.projectPowerId" @change="fetchData" clearable class="rounded-3 form-group transparent" placeholder="选择项目" style="width:120px">
            <el-option
              v-for="item in projectPowerOptions"
              :key="item.projectPowerId"
              :label="item.name"
              :value="item.projectPowerId">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row class="w-100 left_bar">
        <el-table :data="tableData"  @row-click="showCamera" :show-header="false"  :highlight-current-row="true" row-class-name="left_bar_items">
          <el-table-column  align="left">
            <template scope="scope">
              <div class="fw-bold fs-5 my-1">{{ scope.row.name }}</div>
              <el-row  type="flex" class="text_gray flex-wrap">
                <span class="me-2">{{ scope.row.address }}</span>
                <span>{{ scope.row.project }}</span>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <pagenation
          class="p-3  border-top border-light"
          :total="tableData.length"
          :auto-scroll="false"
          :pageSizes="[20, 40, 60, 80,100]"
          :page.sync="serverQuery.page"
          :limit.sync="serverQuery.size"
          @pagination="fetchData"
        />
      </el-row>
    </div>
    <div class="bg_lightgray col scroll_bar ">
      <div style="padding-bottom: 80px" class=" pe-5 ps-4 vstack h-100" v-show="cameraDetail.name">
        <!-- 摄像头信息 -->
        <div class="px-2 pb-2">
            <h3 class="mt-3">{{ cameraDetail.name }}</h3>
            <el-row type="flex" class="text_gray">
              <i class="ri-map-pin-2-fill me-1"></i>
              <div class="me-4">{{ cameraDetail.country }}</div>
              <div class="me-4">项目：{{ cameraDetail.projectName }}</div>
              <!-- <el-date-picker
                v-if="permissions.includes('2061')"
                class="me-4"
                size="mini"
                v-model="recDate"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              >
              </el-date-picker> -->
              <el-button v-if="permissions.includes('2061')" type="primary" class="el-icon-video-play" size="small" @click="recClick" >回放</el-button>
            </el-row>
        </div>
        <el-row type="flex" align="middle" class="col h-75">
          <!-- 监控视频 -->
          <div class="col rounded-4 bg-black h-100  hstack me-3">
              <div class="w-100" id="video-container"></div>

              <!-- <iframe
                :src=cameraUrl
                width="100%"
                height="100%"
                id="ysOpenDevice"
                allowfullscreen
              >
              </iframe> -->
          </div>


          <div class="p-3" style="width:320px;height: calc(100vh - 210px);" >
            <div class="card border-0 w-100 h-100 p-3">
              <!-- 项目互动 -->
              <el-row type="flex" class="flex-column h-100">
                <el-scrollbar ref="chatList" class="column col h-100">
                  <div v-if="interactive.length<chatTotal" class="clickMore" style="margin-top: 10px">
                <span @click="getMoreChat">
                 点击加载更多<span class="el-icon-more"></span>
                </span>
                  </div>
                  <div class="px-1 py-2" style="padding:0.5rem;!important" v-for="(item,index) in  interactive" :key="index">
                    <div>
                      <div style="color: #747474">
                        <a @click="addReplyContent(item)">{{item.nickname}}</a><span class="mx-2">{{item.createTime}}</span>
                      </div>
                      <div>
                        <span v-if="item.replyUserName">&nbsp;&nbsp;回复&nbsp;&nbsp;{{item.replyUserName}}：</span>{{item.content}}
                      </div>
                    </div>
                  </div>
                </el-scrollbar>
                <el-row v-if="permissions.includes('2060')" type="flex" class="mt-1">
                  <el-input @keydown.native.delete="resetReply" class="col rounded-3" clearable v-model="content"   :placeholder="replyPlaceholder">
                    <el-button slot="append" size="medium" class="btn" :disabled="hasContent" @click="sendInteractive">发送</el-button>
                  </el-input>
                </el-row>
              </el-row>
            </div>
          </div>
        </el-row>
      </div>
    </div>
  </div>
</template>



<script>
import countryList from "@/utils/country";
import {sendPost, sendPostByBody, sendPostByKeyValue} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
import {dateFormat} from "@/utils/custom";
import  EZUIKit from 'ezuikit-js';

export default {
  components:{
    Pagenation,
    EZUIKit
  },
  data() {

    //页面数据容器
    return {
      countryList: countryList,
      projectPowerOptions:[],
      serverQuery:{
        page:1,
        size:20,
        country:undefined,
        projectPowerId:undefined,
        keyword:undefined
      },
      tableData: [],
      cameraDetail:{},
      interactive:[],
      chatTotal:0,
      chatQuery:{
        cameraId:undefined,
        page:1,
        size:20
      },
      loading:false,
      content:"",
      cameraUrl: null,
      replyUser:{
        replyUserId:undefined,
        replyUserName:undefined
      },
      replyPlaceholder:"发表互动",
      permissions:[],
      recDate:[],
      commonUrl:"https://open.ys7.com/jssdk/theme.html?url=ezopen://open.ys7.com/",

      accessToken: "at.avq1bex55eflmxpv29wm71xv8le6baxi-7ljactl8iu-0pqvf6u-aqgzgagyb",//at.d159nx99bkud6vut33ozkugt7kh8ehgw-7lj9y2kjl5-19w2n6a-pee2xvdot
      videoUrl: "ezopen://open.ezviz.com/K46872837/1.live",//ezopen://open.ys7.com/E51089892/1.live
      player:{},
      domain:"https://isgpopen.ezvizlife.com",

    };
  },

  //监听
  watch: {
  },
  mounted(){
    this.selectAllProjectPower()
    this.fetchData()
    this.getPermission()

    this.player = new EZUIKit.EZUIKitPlayer({
      id: 'video-container', // 视频容器ID
      accessToken: this.accessToken,
      url: this.videoUrl,
      audio:0,
      // template:"simple",
      env:{domain:this.domain}
    })

  },
  computed:{
    hasContent(){
      return this.content?.trim().length===0
    }
  },
  //方法
  methods: {
    async getPermission(){
      const url = "/AppUser/myAppPermission"
      const result = await sendPost(url)
      if(result?.code === 200){
        this.permissions = result.data.map(permission=>permission.permissionCode)
      }
    },
    async fetchData(){
      const url="/AppCamera/getAllCamera"
      const res = await sendPostByKeyValue(url,this.serverQuery)
      if(res&&res.code===200){
        this.tableData=res.data.list
      }
    },
    async selectAllProjectPower() {
      const url = "/AppUser/selectAllProjectPower";
      const res =await sendPostByKeyValue(url,null)
      if (res&&res.code===200) {
        this.total = res.data.count
        this.projectPowerOptions = res.data;
      }
    },
    async showCamera(row, column, event){
      this.cameraDetail = row
      this.chatQuery.cameraId = this.cameraDetail.cameraId
      const url = "/AppCamera/cameraDetail";
      const res =await sendPostByKeyValue(url,this.cameraDetail)
      if (res&&res.code===200) {
        this.cameraDetail.deviceSerial = res.data.deviceSerial
        this.cameraDetail.accessToken = res.data.accessToken
        this.cameraUrl =this.commonUrl+res.data.deviceSerial+"/1.live&accessToken="+res.data.accessToken;

        this.accessToken = res.data.accessToken;
          this.videoUrl = res.data.videoUrl;
          this.domain = res.data.domain;
           console.log("112_____"+res.data.domain)
           console.log("113_____"+res.data.accessToken)
           console.log("114_____"+res.data.videoUrl)

          this.player.stop()
          .then(()=>{
            this.player.play({url:res.data.videoUrl,accessToken: res.data.accessToken,audio:0, env:{domain:res.data.domain}});
          });
      }
      await this.getInteractive()
    },
    async getInteractive(){
      const url = "/AppCamera/getAllCameraInteractive";
      const res =await sendPostByKeyValue(url,this.chatQuery)
      if (res&&res.code===200) {
        this.chatTotal = res.data.total
        this.interactive.unshift(...res.data.list.reverse());
        this.$nextTick(()=>{
          if(this.chatQuery.page === 1)this.$refs.chatList.wrap.scrollTop = this.$refs.chatList.wrap.scrollHeight
        })
      }
    },
    async loadInteractive(){
      this.loading = true
      this.getInteractive().then(()=>this.loading = false)
    },
    async sendInteractive(){
      const url = "/AppCamera/saveCameraInteractive";
      const res =await sendPostByBody(url,{cameraId:this.cameraDetail.cameraId,content:this.content,...this.replyUser})
      if (res&&res.code===200) {
        this.content = ""
        this.replyUser = {
          replyUserId:undefined,
          replyUserName:undefined
        }
        this.replyPlaceholder = "发表互动"
        this.interactive = []
        this.chatQuery.page = 1
        await this.getInteractive()
      }
    },
    async getMoreChat(){
      this.chatQuery.page += 1
      await this.getInteractive()
    },
    addReplyContent(item){
      this.replyUser={
        replyUserId:item.userId,
        replyUserName:item.nickname
      }
      this.replyPlaceholder = "回复"+item.nickname
    },
    resetReply(){
      if(!this.content){
        this.replyUser={
          replyUserId:undefined,
          replyUserName:undefined
        }
        this.replyPlaceholder = "发表互动"
      }
    },
    recClick(){
      // const startTime = dateFormat(this.recDate[0]).replaceAll("-","").replaceAll(" ","").replaceAll(":","")
      // const endTime = dateFormat(this.recDate[1]).replaceAll("-","").replaceAll(" ","").replaceAll(":","")
      this.cameraUrl=this.commonUrl+this.cameraDetail.deviceSerial+"/1.rec&accessToken="+this.cameraDetail.accessToken+"&id=ysopen";
    }
  }
};
</script>

<style scoped>
.clickMore{
  text-align: center;
  margin-bottom: 16px;
  cursor: pointer;
}
</style>
