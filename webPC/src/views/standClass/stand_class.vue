<template>
  <div class="w-100 h-100 px-5 py-3 vstack bg-white">
    <el-row type="flex" class="mt-2">
      <el-button class="btn-primary mx-2" v-if="permissions.includes('2070')" round @click.native="uploadClass=true;isNewStand=true">上传</el-button>
      <el-checkbox v-model="checked" @change="getSelfData" label="只看我的" border class="rounded-pill mx-2 ps-3"></el-checkbox>
      <!-- 搜索 -->
      <el-input
        placeholder="搜索关键词"
        v-model="serverQuery.keyword"
        @input="changeKeyWord"
        class="input_inside_card rounded-3 ms-auto"
        style="width:240px"
        prefix-icon="ri-search-line">
      </el-input>
    </el-row>

    <el-divider class="bg_gray mb-0"></el-divider>

    <el-row :gutter="30" class="col overflow-hidden">
      <el-col :span="18" class="h-100 vstack">
        <!--下拉选择-->
        <el-row type="flex" align="middle" class="form-group border-bottom border-light" style="height:68px">
          <el-select v-model="serverQuery.country" @change="changeCountry" filterable clearable style="width: 200px;" class="me-3 rounded-3" placeholder="选择国家">
                  <el-option
                    v-for="item in contryList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.label">
                  </el-option>
           </el-select>
           <el-select v-model="serverQuery.projectName" @change="changeProject" filterable clearable style="width: 200px;" class="me-3 rounded-3" placeholder="选择项目">
                  <el-option
                    v-for="item in projectPowerOptions"
                    :key="item.projectPowerId"
                    :label="item.name"
                    :value="item.name">
                  </el-option>
             </el-select>
           <el-cascader
                  style="width: 200px;"
                  class="me-3 rounded-3"
                  v-model="serverQuery.professionEchoConfirm"
                  filterable
                  clearable
                   @change="changeProfession"
                  placeholder="选择专业"
                  :options="optionsProfession"
                  :props="{ expandTrigger: 'hover' }"
                  >
                </el-cascader>
          <el-date-picker
            :editable="false"
            v-model="timeRange"
            @change="changeTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="ms-auto rounded-3">
          </el-date-picker>
        </el-row>

        <!-- 员工列表 -->
        <el-scrollbar class="col column">
          <el-table :data="tableData" highlight-current-row @row-click="showStandDetail" class="w-100 h-100">
            <el-table-column align="center" prop="projectName" label="项目"></el-table-column>
            <el-table-column align="center" prop="nickname" label="上传人员"></el-table-column>
            <el-table-column align="center" prop="professionName" label="专业"></el-table-column>
            <el-table-column align="center" prop="country" label="国家"></el-table-column>
            <el-table-column align="center"  label="时间">
              <template  scope="{row}">
                  {{row.createTime}}
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>
        <pagenation
          class="p-3  border-top border-light"
          :total="total"
          :auto-scroll="false"
          :pageSizes="[20, 40, 60, 80,100]"
          :page.sync="serverQuery.page"
          :limit.sync="serverQuery.size"
          @pagination="fetchData"
        />
      </el-col>

      <el-col :span="6" class="h-100 vstack" style="min-width:300px">
        <el-row  type="flex" align="middle" class="px-1" style="height:68px">
          <el-button v-if="user.userId&&showDetail.userId === user.userId" class="bg_gray" size="medium" :disabled="!showDetail.projectName" @click.native="uploadClass=true;isNewStand=false" round>编辑</el-button>
          <el-button v-if="user.userId&&showDetail.userId === user.userId" class="bg_gray" size="medium" :disabled="!showDetail.projectName" @click="deleteStand" round>删除</el-button>
          <el-button v-if="showDetail.userId&&permissions.includes('2071')" class="ms-auto btn-primary" size="medium" :disabled="!showDetail.projectName" round @click.native="instruct=true">批示</el-button>
        </el-row>
        <div class="bg_gray rounded-4 col scroll_bar">
          <div class="p-4"  v-show="showDetail.projectName">
            <el-row type="flex" :gutter="30" class="flex-wrap" align="middle">
              <h5 class="fw-bold mx-3 mb-0 w-100">{{showDetail.projectName}}</h5>
              <div class="text_gray mx-3 fs_sm mt-2">负责人：{{showDetail.nickname}}</div>
              <div class="text_gray mx-3 fs_sm mt-2"><i class="ri-map-pin-2-line"></i>{{showDetail.country}}</div>
            </el-row>
            <div class="mt-2">上传：{{showDetail.nickname}} · {{ showDetail.userPermission }}</div>
            <!-- 视频&音频 -->
            <video-player
              v-if="showDetail.fileType===0"
              class="video-player"
              ref="videoPlayer"
              name="videoPlayer"
              id="video"
              :playsinline="true"
              :options="playerOptions"
              @waiting="onPlayerWaiting($event)"
              @ready = "playerReadied"
            ></video-player>
            <aplayer
              v-if="showDetail.fileType===1"
              :music="musics[0]"
              :list="musics"
              :showlrc="false"
            ></aplayer>
            <el-divider class="bg_deepgray my-3"></el-divider>
            <div class="fw-bold">批示</div>
            <ul>
              <li  v-for="item in showDetail.standClassInstructionsList" :key="item.standClassInstructionsId" style="background-color: #FFFFFF;padding: 5px;margin-bottom: 5px;margin-top: 5px">
                  <el-row type="flex" justify="between">
                    <el-col>
                      <p class="mt-2 lh-base">{{ item.content }}</p>
                    </el-col>
                    <el-row type="flex" v-if="item.userId === user.userId">
                      <div class="col" style="margin-right: 10px">
                        <el-button class=" bg_gray" size="medium" @click.native="editInstruct(item)">编辑</el-button>
                      </div>
                      <div class="col">
                        <el-button type="danger" size="medium" @click.native="delInstruct(item.standClassInstructionsId)">删除</el-button>
                      </div>
                    </el-row>
                  </el-row>

                  <el-row >
                    <el-col :span="12">
                      <div>{{item.name}}</div>
                    </el-col>
                    <el-col :span="12">
                      <div>{{item.createTime}}</div>
                    </el-col>
                  </el-row>
              </li>
            </ul>

          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 上传站班弹窗 -->
    <el-dialog
      @close="clearFile"
      width="600px"
      :visible.sync="uploadClass"
      top="0"
      :append-to-body="true"
      custom-class="rounded-4"

    >
    <el-scrollbar class="column rounded-4">
      <div class="p-5">
        <el-upload
          accept=".mp4,.mp3"
          :limit="1"
          ref="upload"
          class="w-100"
          drag
          :action="baseImgURL+'/api/file/fileUpload'"
          :headers="headers"
          :before-upload="checkUpload"
          name="file"
          :on-success="uploadSuccess"
          :on-error="uploadError">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible" top="0" :append-to-body="true" class="image_dialog">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </div>
    </el-scrollbar>
    <div slot="footer" class="pb-3">
      <el-button type="primary" :disabled="!canSaveStand" class="rounded-3 mx-auto btn-primary" @click="saveStand" style="width:300px">提交</el-button>
    </div>
  </el-dialog>

    <!-- 批示弹窗 -->
    <el-dialog
      width="600px"
      :visible.sync="instruct"
      top="0"
      :append-to-body="true"
      custom-class="rounded-4"
    >
    <div class="p-5 h-100">
      <el-scrollbar class="textarea_container rounded-3 border bg_lightgray h-100">
        <el-input placeholder="批示内容" type="textarea" :autosize="{minRows: 30}" resize="none" v-model="textarea">
        </el-input>
      </el-scrollbar>
    </div>
    <div slot="footer" class="pb-3">
      <el-button type="primary" class="rounded-3 mx-auto btn-primary" :disabled="checkInstruct" @click="addInstruct"  style="width:300px">提交</el-button>
    </div>
  </el-dialog>
  </div>
</template>



<script>
import {
  sendGet,
  sendPostByKeyValue,
  sendPostByJson,
  sendPost,
  sendPostByFormData,
  sendPostByBody
} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
import countryList from "@/utils/country"
import { videoPlayer } from "vue-video-player";
import "video.js/dist/video-js.css";
import "vue-video-player/src/custom-theme.css";
import  aplayer from 'vue-aplayer'
import {getPermissionList} from "@/api/user";
import store from "@/store";
import {dateFormat} from "@/utils/custom";
export default {
  components:{
    Pagenation,
    videoPlayer,
    aplayer
  },
  data() {

    //页面数据容器
    return {
       //类别查询
      workTypeOptions: [
        //{ value: null, label: '全部类型'},
        { value: 0, label: '正式员工' },
        { value: 1, label: '外包员工' },
      ],
      baseImgURL:"",
      headers:{},
      contryList: countryList,
      projectPowerOptions:[],
      optionsProfession:[],
      checked:false,
      uploadClass:false,
      instruct:false,
      serverQuery:{
        page:1,
        size:20,
        country:undefined,
        projectPowerId:undefined,
        professionId:undefined,
        proProfessionId:undefined,
        projectName:undefined,
        professionEchoConfirm:[],
        keyword:undefined,
        startTime:undefined,
        endTime:undefined
      },
      total:0,
      tableData:[],
      tableHeight:window.innerHeight - 300 +"px",
      dialogVisible:false,
      dialogImageUrl:false,
      textarea:undefined,
      file: {},
      canSaveStand:false,
      showDetail:{},
      playerOptions: {
        playbackRates: [0.5, 1.0, 1.5, 2.0], // 可选的播放速度
        autoplay: false, // 如果为true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 是否视频一结束就重新开始。
        preload: "auto", // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: "zh-CN",
        aspectRatio: "16:9", // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [
          {
            type: "video/mp4", // 类型
            src:"" // url地址
          }
        ],
        poster: "", // 封面地址
        notSupportedMessage: "此视频暂无法播放，请稍后再试", // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true, // 当前时间和持续时间的分隔符
          durationDisplay: true, // 显示持续时间
          remainingTimeDisplay: false, // 是否显示剩余时间功能
          fullscreenToggle: true // 是否显示全屏按钮
        },
      },
      musics:[],
      isNewStand:false,
      user: {},
      permissions:[],
      timeRange:[],
      instructId:undefined,
    };
  },

  //监听
  watch: {

  },
    mounted(){

      this.selectAllProjectPower()
      this.getCascadeParam()
      this.fetchData()
      this.baseImgURL = process.env.VUE_APP_BASE_IMG;
      this.headers = {
        Token: this.$store.state.user.token,
      };
      this.user = this.$store.state.user.userInfo
      this.getPermission()
    },
  computed:{
    checkInstruct(element, rect) {
      return !this.textarea||this.textarea.trim().length===0
    },
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
    //获取项目选择
    async selectAllProjectPower() {
      const url = "/AppUser/selectAllProjectPower";
      const response =await sendPostByKeyValue(url,null)
      if (response) {

        this.projectPowerOptions = response.data;
      }
    },
      //获取专业级联
    async getCascadeParam() {
      const url = "/AppUser/getCascadeParam";
      const response =await sendPostByKeyValue(url,null)
      if (response) {
        this.optionsProfession = response.data;
      }
    },
    changeTime(){
      if(this.timeRange){
        this.serverQuery.startTime =dateFormat(this.timeRange[0],false)
        this.serverQuery.endTime = dateFormat(this.timeRange[1],false)
      }else {
        this.serverQuery.startTime = undefined
        this.serverQuery.endTime = undefined
      }
      this.fetchData()
    },
   async fetchData(){
      const url="/AppStandClass/getAllStandClass"
      const res = await sendPostByKeyValue(url,this.serverQuery)
      if(res&&res.code===200){
        this.tableData=res.data.list
        this.total=res.data.total
      }
    },
    changeCountry(v){
       this.fetchData()
    },
    changeProject(v){
      this.fetchData()
    },
    changeProfession(v){

      if(this.serverQuery.professionEchoConfirm.length>0){
        this.serverQuery.proProfessionId=this.serverQuery.professionEchoConfirm[0]
        this.serverQuery.professionId=this.serverQuery.professionEchoConfirm[1]
      }else{
        this.serverQuery.proProfessionId=undefined
        this.serverQuery.professionId=undefined

      }
      this.fetchData()
    },
    changeKeyWord(){
      this.fetchData()
    },
    uploadSuccess(response, file, fileList) {
      if (response) {
        this.file.fileUrl = response.data.fileUrl;
        this.file.fileType = response.data.fileType.includes("video")?0:1
        this.canSaveStand = true
      }
    },
    uploadError(err, file, fileList) {
      this.$message({
        message: "上传失败",
        type: "error",
      });
    },
   async saveStand(){
     if(this.isNewStand){
       const url="/AppStandClass/saveStandClass"
       const res = await sendPostByBody(url,this.file)
       if(res&&res.code===200){
         this.$message({
           message: "保存成功",
           type: "success",
         });
         this.uploadClass = false
         this.canSaveStand = false
         await this.fetchData()
       }
     }
     else
     {
       let url="/AppStandClass/updateStandClass"
       let res = await sendPostByKeyValue(url,{standClassId:this.showDetail.standClassId,...this.file})
       if(res&&res.code===200){
         this.$message({
           message: "保存成功",
           type: "success",
         });
         this.uploadClass = false
         this.canSaveStand = false
         await this.fetchData()
         await this.refreshDetail()
       }
     }
    },
    clearFile(){
      this.$refs.upload.clearFiles()
    },
    getSelfData(){
      this.serverQuery.userId = this.checked?this.$store.state.user.userInfo.userId:""
      this.fetchData()
    },
    checkUpload(file){
      if (!file.type.includes("video")&&!file.type.includes("audio")) {
        this.$message.error('格式错误');
        return false;
      }
      const limitSize=1024*1024*100
      if(file.size>limitSize)
      {
        this.$message.error('请选择100m以内文件');
        return  false
      }
    },
    async showStandDetail(row, column, event){
      this.showDetail = row
      if(row.fileType === 0)
      {
        this.playerOptions.sources[0].src=row.fileUrl
      }
      else
      {
        this.musics[0] = {title: "站班音频",artist:row.nickname, url:row.fileUrl}
      }
      await this.refreshDetail()
    },

    // DOM元素上的readyState更改导致播放停止
    onPlayerWaiting(player) {
      let time = localStorage.getItem("cacheTime")
      if(player.cache_.currentTime - Number(time) > 0.1){
        this.current = Number(time)
        this.playerReadied(player)
      }else{
        this.current = player.cache_.currentTime
      }
    },

    //将侦听器绑定到组件的就绪状态。与事件监听器的不同之处在于，如果ready事件已经发生，它将立即触发该函数。。
    playerReadied(player) {
      // console.log('example player 1 readied', player);
      player.currentTime(this.current)
    },
    deleteStand(){
      this.$confirm("确定要删除该记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            const url="/AppStandClass/delete"
            const res = await sendPostByKeyValue(url,{standClassId:this.showDetail.standClassId})
            if(res&&res.code===200){
              this.$message({
                message: "删除成功",
                type: "success",
              });
              this.showDetail={}
              await this.fetchData()
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
    },
    async addInstruct(){
      const url=this.instructId?"/AppStandClass/updateStandClassInstructions":'/AppStandClass/addStandClassInstructions'
      const res = await sendPostByKeyValue(url,{standClassInstructionsId:this.instructId,standClassId:this.showDetail.standClassId,content:this.textarea})
      if(res&&res.code===200){
        this.$message({
          message: "保存成功",
          type: "success",
        });
        this.instruct = false
        this.textarea = ""
        this.instructId = undefined
        await this.refreshDetail()
      }
    },
   async refreshDetail(){
      const url="/AppStandClass/standClassDetail"
      const res = await sendPostByKeyValue(url,this.showDetail)
      if(res&&res.code===200) {
        this.showDetail = res.data
      }
    },
    editInstruct(instruct){
      this.textarea = instruct.content
      this.instructId = instruct.standClassInstructionsId
      this.instruct = true
    },
    delInstruct(id){
      this.$confirm("确定要删除该批示?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            const url="/AppStandClass/deleteStandClassInstructions"
            const res = await sendPostByKeyValue(url,{standClassInstructionsId:id})
            if(res&&res.code===200) {
              this.$message({
                message: "删除成功",
                type: "success",
              });
              await this.refreshDetail()
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
  }
};
</script>

<style scoped>

.vjs-custom-skin > .video-js .vjs-big-play-button {
  background-color: rgba(0,0,0,0.45);
  font-size: 3.0em;
  /* border-radius: 50%; */
  height: 1.5em !important;
  line-height:1.5em !important;
  margin-top: -1em !important;
}
</style>
