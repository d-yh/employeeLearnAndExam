<template>
<div class="d-flex w-100 h-100 scroll_bar" >
  <div class="sticky_left bg-white" style="width:300px;border-right:1px solid #f3f3f3;top:0">
    <div class="p-3 vstack">
      <el-input
        placeholder="搜索项目"
         v-model="query.keyword"
         @input="inputKey"
        class="mb-2 rounded-3 input_inside_card"
        prefix-icon="ri-search-line">
      </el-input>

      <el-select clearable v-model="query.country"   filterable class="rounded-3 form-group transparent" @change="selectCountry" placeholder="选择国家" style="width:180px">
        <el-option
          v-for="item in countryList"
          :key="item.value"
          :label="item.label"
          :value="item.label">
        </el-option>
      </el-select>
      <el-select clearable v-model="query.type" filterable class="rounded-3 form-group transparent" @change="selectCountry" placeholder="选择类型" style="width:180px">
        <el-option
          v-for="item in typeList"
          :key="item.value"
          :label="item.value"
          :value="item.key">
        </el-option>
      </el-select>
    </div>

    <el-table :data="projectList" class="w-100 left_bar" :height="tableHeight"  :show-header="false" :highlight-current-row="true" row-class-name="left_bar_items">
      <el-table-column align="left">
        <template scope="{row}">
          <div @click="clicktItem(row)">
          <el-row  type="flex">
            <el-col class="fw-bold fs-5 my-1">{{row.name }}</el-col>
            <el-col class="my-1" style="line-height: 2">{{row.type===0?'维护类':'安装类'}}</el-col>
          </el-row>
          <div>{{ row.country }}</div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <div v-if="clickRowId" class="bg_gray col">
    <div class="d-flex ">
      <div class="col ps-3 ">
        <div class="card border-0 px-4 my-3 overflow-hidden ">
          <!-- 项目信息 -->
          <div class="rounded-3 bg_gray p-3 mt-4">
            <h3><span  v-text="projectItemDetail.name"></span></h3>
            <el-row type="flex" class="" v-if="projectItemDetail&&projectItemDetail.headUserName">
              <div class="me-4">负责人：<span v-text="projectItemDetail.headUserName"></span></div>
              <i class="ri-map-pin-2-fill me-1"></i>
              <div class=""><span v-text="projectItemDetail.country"></span></div>
            </el-row>
          </div>
          <!-- 项目说明 -->
          <div class="fw-bold mt-4">项目说明</div>
          <div class="bottom_cover">
            <b-collapse class="mt-3 content_box" id="progressDescription">
              <div>
                   <div  v-html="projectItemDetail.instructions"></div>
              </div>
               <div >&nbsp;&nbsp;
                  <div v-text="projectItemDetail.introduction"></div>
                </div>
            </b-collapse >
            <el-link v-b-toggle.progressDescription :underline="false" class="click_btn" v-if="clickRowId">
              <el-row type="flex" align="middle" class="mb-3">
                <span class="when-open">收起</span>
                <span class="when-closed">点击查看全部</span>
                <i class="ri-arrow-down-s-line fs-4"></i>
              </el-row>
            </el-link>
          </div>
        </div>
        <div class="card border-0 px-4 my-3">
          <!-- 项目进度计划 -->
          <el-row type="flex" align="middle" class="py-3">
            <div class="fw-bold col">项目进度计划</div>
            <el-button v-if="permissions.includes('2050')" class="btn btn-primary py-2 px-4" icon="ri-draft-fill me-2" round  @click.native="addNewPlan">新增进度计划</el-button>
          </el-row>
          <el-timeline class="mt-4 pe-2">
            <el-timeline-item
              v-for="(item, index) in timeLines"
              :key="index"
              type="primary"
              color="#1F67AE"

              :timestamp="item.createTime"
              placement="top">
              <el-row align="middle" type="flex">
                <div class="fs-5 fw-bold text-start">{{item.title}}</div>
                <el-row type="flex" class="ms-auto">
                  <el-button class="bg_gray border-0" icon="ri-pencil-fill fs-5" size="mini"  v-if="index===0&&item.updateState===1&&permissions.includes('2051')" circle @click.native="updatePlan(item)"></el-button>
                  <el-button class="bg_gray border-0" icon="ri-delete-bin-4-fill fs-5" v-if="index===0&&item.updateState===1&&permissions.includes('2052')" size="mini" circle @click="deletePlan(item.projectReportId)"></el-button>
                </el-row>
              </el-row>
              <el-row type="flex" class="text_gray">
                <div class="me-3">发布：{{item.nickname}}</div>
                <div class="me-3">角色：{{item.userPermission}}</div>
                <div class="me-3" v-if="item.state===0">状态：未启动</div>
                <div class="me-3" v-else-if="item.state===1">状态：正常</div>
                <div class="me-3" v-else-if="item.state===2">状态：完成</div>
                <div class="me-3" v-else-if="item.state===3">状态：延期</div>
              </el-row>
              <div class="mt-2 fs-6">内容:&nbsp;&nbsp;<span>{{item.content}}</span> </div>
              <el-row :gutter="16" class="mt-1">
                <el-col style="width:25%" class="my-1" v-for="(imgs,i) in item.fileList" :key="i">
                  <el-image
                    class="rounded-3 overflow-hidden"
                    :src="imgs"
                    fit="contain">
                  </el-image>
                </el-col>

              </el-row>
            </el-timeline-item>
          </el-timeline>
          <div class="clickMore">
            <span @click="getMore" v-if="page<totolPages">
             点击加载更多<span class="el-icon-more"></span>
            </span>

          </div>
        </div>
      </div>
      <div class="p-3 sticky_right" style="width:320px;top:0" >
        <div class="card border-0 w-100 h-100 p-3">
          <!-- 项目互动 -->
          <el-row type="flex" class="flex-column h-100">
            <div class="fw-bold px-1">项目互动</div>
            <el-scrollbar ref="chatList" class="column col h-100">
              <div v-if="interactiveInfoList.length<chatTotal" class="clickMore" style="margin-top: 10px">
                <span @click="getMoreChat">
                 点击加载更多<span class="el-icon-more"></span>
                </span>
              </div>
              <div class="px-1 py-2" style="padding:0.5rem;!important" v-for="(item,index) in  interactiveInfoList" :key="index">
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
            <el-row v-if="permissions.includes('2053')" type="flex" class="mt-1">
              <el-input @keydown.native.delete="resetReply" class="col rounded-3" clearable v-model="replayInfo.content"   :placeholder="replyPlaceholder">
                 <el-button slot="append" size="medium" class="btn" :disabled="!replayInfo.content" @click="sendMsg">发送</el-button>
              </el-input>
            </el-row>
          </el-row>
        </div>
      </div>
    </div>
  </div>

    <!-- 发布进度计划 -->
    <el-dialog
      width="600px"
      :visible.sync="progressPlan"
      top="0"
   :append-to-body="true"
      :before-close="clearFile"
      custom-class="rounded-4"
    >
    <el-scrollbar class="column rounded-4">
      <div class="p-5">
        <el-form :model="progressModel" ref="progressPlanRef" :rules="rules">
          <el-form-item prop="state">

          <el-select placeholder="选择项目状态" v-model="progressModel.state"  class="rounded-3 w-100">
            <el-option
                v-for="item in states"
                :key="item.key"
                :label="item.value"
                :value="item.key">
              </el-option>
          </el-select>
          </el-form-item>
          <el-form-item prop="name" >

          <el-input placeholder="进度标题"  v-model="progressModel.name" class="rounded-3 mt-3"></el-input>
          </el-form-item>
          <el-scrollbar class="textarea_container rounded-3 border bg_lightgray mt-3" style="height:280px">
            <el-input placeholder="进度内容" type="textarea" v-model="progressModel.content" :autosize="{minRows: 11}" resize="none">
            </el-input>
          </el-scrollbar>
        </el-form>
        <div class="fs-6 fw-bold mt-4">上传图片</div>
        <el-upload
          ref="upload"
          class="mt-3"
          :action="baseImgURL+'/api/file/fileUpload'"
          :headers="headers"
          list-type="picture-card"
          :before-upload="checkUpload"
          :on-remove="handleRemove"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          multiple>
          <i slot="default" class="el-icon-plus"></i>
          <div slot="file" slot-scope="{file}">
            <el-image
              class="el-upload-list__item-thumbnail"
              :src="file.url" alt=""
              :preview-src-list="[dialogImageUrl]"
              ref="uploadPreview"
            />
            <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                  >
                    <i class="el-icon-zoom-in"></i>
                  </span>

                  <span
                    v-if="!disabled"
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
          </div>
        </el-upload>

      </div>
    </el-scrollbar>
    <div slot="footer" class="pb-3">
      <el-button type="primary" :loading="loading" :disabled="!progressModel.state||!progressModel.name||!progressModel.content" class="rounded-3 mx-auto btn-primary" style="width:300px" @click="savePlan">发布</el-button>
    </div>
  </el-dialog>
</div>
</template>



<script>
import countryList from '@/utils/country'
import { sendPost, sendPostByJson, sendPostByKeyValue } from '@/utils/httpUtils';
import { getUserInfo } from '@/utils/auth';
import {dateFormat} from "@/utils/custom";
import {getPermissionList} from "@/api/user";
export default {
  data() {

    //页面数据容器
    return {
      loading:false,
      countryList,
      query:{
        country:undefined,
        keyword:undefined,
        size:1000,
        type:undefined
      },
      tableHeight:window.innerHeight-210+'px',
      projectList:[],
      clickRowId:undefined,
      projectItemDetail:{},
      interactiveInfoList:[],
      replayText:'',
      replayInfo:{
        content:"",
        projectPowerId:undefined,
        replyUserId:undefined,
        replyUserName:undefined,
        createTime:undefined,
        userId:undefined
        },
        page:1,
        totolPages:0,
        timeLines:[],
        progressModel:{
          state:undefined,
          name:undefined,
          content:undefined,
          imgs:undefined,
          projectReportId:undefined,
        },
        rules:{
          name:[   { required: true, message: '请填写标题', trigger: 'blur' }],
          state:[   { required: true, message: '请选择状态', trigger: 'change' }]
        },
        baseImgURL:"",
        fileList:[],

      progressPlan:false,
      textarea: '',
      dialogVisible:false,
      dialogImageUrl:"",
      states:[
        {key:1,value:"正常"},
        {key:2,value:"完成"},
        {key:3,value:"延期"}
      ],
      headers:{},
      chatTotal:0,
      chatQuery:{
        projectPowerId:undefined,
        page:1,
        size:20
      },
      replyUser:{
        replyUserId:undefined,
        replyUserName:undefined
      },
      replyPlaceholder:"发表互动",
      permissions:[],
      disabled: false,
      tempPicList:[],
      typeList:[
        {key:0,value:"维护类"},
        {key:1,value:"安装类"},
      ]
    };
  },

  //监听
  watch: {

  },
  created(){
    this.fetchProjectList()
     this.baseImgURL = process.env.VUE_APP_BASE_IMG;
      this.headers = {
        Token: this.$store.state.user.token,
      };
    this.getPermission()
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
   async fetchProjectList(){
      const url="/AppProject/getAllProject"
      const res= await sendPostByKeyValue(url,this.query)
      if(res&&res.code===200){
        this.projectList=res.data.list
      }
    },
    selectCountry(v){
       console.log(this.query)
       this.fetchProjectList()
    },
    inputKey(){
      console.log(this.query)
      this.fetchProjectList()
    },
    clicktItem(row){
      this.clickRowId=row.projectPowerId

      this.getProjectDetail(row.projectPowerId)
      this.chatQuery.projectPowerId = row.projectPowerId
      this.interactiveInfoList=[]
      this.getInteractiveList()
      this.getProjectPlans(row.projectPowerId)
    },
    async getProjectDetail(id){
      const url="/AppProject/projectDetail"
      const res= await sendPostByKeyValue(url,{projectPowerId:id})
      if(res&&res.code===200){
        this.projectItemDetail=res.data
      }
    },
    async getInteractiveList(){
      const url="/AppProject/getAllProjectInteractive"
      const res= await sendPostByKeyValue(url,this.chatQuery)
      if(res&&res.code===200){
        this.chatTotal = res.data.total
        this.interactiveInfoList.unshift(...res.data.list.reverse())
        this.$nextTick(()=>{
          if(this.chatQuery.page === 1)this.$refs.chatList.wrap.scrollTop = this.$refs.chatList.wrap.scrollHeight
        })
      }
    },
    sendReplay(){

      this.sendMsg()
    },
    async sendMsg(){


      const url="/AppProject/saveProjectInteractive"

      let data={
          "content": this.replayInfo.content,
          "createTime": dateFormat(),

          "projectPowerId": this.clickRowId,
          ...this.replyUser,
          "userId": getUserInfo().userId,
          projectInteractive:{
              "content":  this.replayInfo.content,
              "createTime": dateFormat(),

              "projectPowerId": this.clickRowId,
              "replyUserId": undefined,
              "replyUserName": undefined,
              "userId": getUserInfo().userId,
          }
      }
      const res= await sendPostByJson(url,data)
      if(res&&res.code===200){
        this.$message({type:"success",message:"发表互动成功!"})
        this.interactiveInfoList = []
        this.chatQuery.page = 1
        await this.getInteractiveList()
        this.replayInfo.content=""
        this.replyUser = {
          replyUserId:undefined,
          replyUserName:undefined
        }
        this.replyPlaceholder = "发表互动"
      }
    },
    //项目进度计划
     async getProjectPlans(id){
        const url="/AppProject/getAllProjectReport"
        const res= await sendPostByKeyValue(url,{projectPowerId:id,size:10,page:this.page})
        if(res&&res.code===200){
           res.data.list.forEach(v=>{
            let date=new Date(v.createTime)
            v.createTime=`${date.getDate()}/${date.getMonth()+1} ${date.getFullYear()}`
          })
          this.timeLines=res.data.list;
          this.totolPages=res.data.pages
        }
      },
     async getMore(){
        this.page++
        if(this.page>this.totolPages){
          return false
        }
        if(!this.clickRowId){
          return false
        }
        const url="/AppProject/getAllProjectReport"
        const res= await sendPostByKeyValue(url,{projectPowerId:this.clickRowId,size:10,page:this.page})
        if(res&&res.code===200){

          res.data.list.forEach(v=>{
            let date=new Date(v.createTime)
            v.createTime=`${date.getDate()}/${date.getMonth()+1} ${date.getFullYear()}`
          })
          this.timeLines.push(...res.data.list);
          this.totolPages=res.data.pages
        }
      },
      delProgress(item){
          console.log(item)
         let index =this.timeLines.findIndex(v=>v.projectReportId===item.projectReportId)
         if(index>-1){
           this.timeLines.splice(index,1)
         }
      },
      addNewPlan(){
        this.progressModel={
          state:undefined,
          name:undefined,
          content:undefined,
          imgs:undefined,
          projectReportId:undefined,
        }
        this.fileList=[]
        this.progressPlan=true
        this.$nextTick(()=>{

          this.$refs['progressPlanRef'].clearValidate()
        })
      },
      savePlan(){


        this.$refs.progressPlanRef.validate(v=>{
          if(v){
             this.saveData()
          }
        })
      },
     async saveData(){
        this.loading=true
        let data={


            "content":this.progressModel.content,

            "fileUrl":this.fileList.map(v=>v.url).join(','),
            "projectPowerId": this.clickRowId,
            "projectReportId":this.progressModel.projectReportId,
            "state": this.progressModel.state,
            "title": this.progressModel.name,



        }
        try {
          const url="/AppProject/saveProjectReport"
          const res= await sendPostByJson(url,data)
          if(res&&res.code===200){
            this.page=1
            this.loading=false
            this.progressPlan=false
            if(data.projectReportId){

              this.$message({type:"success",message:"修改计划成功!"})
            }else{

              this.$message({type:"success",message:"添加计划成功!"})
            }
            this.getProjectPlans(this.clickRowId)
          }

        } catch (error) {
            this.loading=false
            this.progressPlan=true
          //this.$message(error.message)
            //  if(data.projectReportId){
            //
            //
            //   this.$message({type:"error",message:"修改计划错误!"})
            // }else{
            //
            //
            // this.$message({type:"error",message:"添加计划错误!"})
            // }
        }
      },

      deletePlan(id){
         this.$confirm("确定要删除该计划?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
             const url="/AppProject/delete"
             const res= await sendPostByKeyValue(url,{projectReportId:id})
             if(res&&res.code===200){
                this.$message({type:"success",message:"删除成功!"})
                this.getProjectPlans(this.clickRowId)
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
      updatePlan(item){
        this.$confirm("确定修改吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
               this.progressPlan=true
               this.progressModel.state=item.state
               this.progressModel.name=item.title
               this.progressModel.content=item.content

                this.fileList=item.fileUrl?item.fileUrl.split(",").map(v=>({
                 name:v.substring(v.lastIndexOf('/')+1),
                 url:v
               })):[]
               this.progressModel.projectReportId=item.projectReportId
               this.$nextTick(()=>{
                  this.$refs['progressPlanRef'].clearValidate()
               })
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
      checkUpload(file){
        console.log(file)
        let f=file.type.startsWith('image')
        if(!f){
          this.$message({type:"error",message:"请上传图片"})
          return false
        }
        let sf=file.size<10*1024*1024
        if(!sf){
          this.$message({type:"error",message:"请上传小于10M的图片"})
          return false
        }

      },
      uploadSuccess(response, file, fileList){

         if(response.data.fileUrl){
           this.fileList.push({
              name:response.data.fileName,
              url:response.data.fileUrl,

           })
           this.tempPicList=fileList
         }
      },
      uploadError(){
        this.$message({
        message: "上传失败",
        type: "error",
      });
      },
      handleRemove(file, fileList){
        this.tempPicList.forEach((pic,index)=>{
          if(pic.url === file.url){
            this.fileList.splice(index,1)
            this.$refs.upload.uploadFiles.splice(index,1)
          }
        })
      },
      refreshChatData(e){
        console.log(e.target)
      },
      async getMoreChat(){
        this.chatQuery.page += 1
        await this.getInteractiveList()
      },
      addReplyContent(item){
        this.replyUser={
          replyUserId:item.userId,
          replyUserName:item.nickname
        }
        this.replyPlaceholder = "回复"+item.nickname
      },
      resetReply(){
       if(!this.replayInfo.content){
         this.replyUser={
           replyUserId:undefined,
           replyUserName:undefined
         }
         this.replyPlaceholder = "发表互动"
       }
      },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.$refs.uploadPreview.showViewer = true
    },
    clearFile(done){
      this.$refs.upload.clearFiles()
      done()
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
