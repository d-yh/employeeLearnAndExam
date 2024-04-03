<template>
  <div class="bg_gray w-100 h-100 p-3">
    <div class="container">
      <div class="bg-white rounded-4">
        <el-row type="flex" justify="space-between" align="middle" class="px-4 py-3">
          <!-- 搜索 -->
          <el-input
            placeholder="搜索关键词"
            class="input_inside_card rounded-3 mx-2"
            v-model="query.keyword"
            @input="fetchByKey"
            style="width:300px"
            prefix-icon="ri-search-line">
          </el-input>
          <el-button v-if="permissions.includes('2040')" class="btn-primary mx-2 ps-3 pe-4" round  @click="openDialog">
            <el-row type="flex" align="middle" class="px-2"><i class="ri-quill-pen-fill mx-1"></i>发贴</el-row>
          </el-button>
        </el-row>
        <el-divider class="bg_gray m-0"></el-divider>
        <el-tabs v-model="activeName" @tab-click="handleClick" class="forum_tab">
          <el-tab-pane :label="item.name" :name="item.code" v-for="(item,index) in bbsTypes" :key="index">
            <el-row type="flex" class="flex-wrap bg_lightgray px-4 py-2">
              <el-button type="text" size="medium" class="mx-4 px-0 text_gray" @click.native="changeTimeSort">发布时间
                <i :class="[order_time===0?'ri-arrow-down-s-fill ri-arrow-drop-up-line ':'ri-arrow-down-s-fill ri-arrow-drop-down-line']"></i>
              </el-button>
              <el-button type="text" size="medium" class="mx-4 px-0 text_gray" @click.native="changeSortCount">浏览量
                <i :class="[order_count===0?'ri-arrow-down-s-fill ri-arrow-drop-up-line ':'ri-arrow-down-s-fill ri-arrow-drop-down-line']"></i>
              </el-button>
            </el-row>
            <el-divider class="bg_gray m-0"></el-divider>

            <div class="w-100 list-group border-0">
              <div class="list-group-item px-5 py-4" v-for="(bbs,i) in bbsList" :key="i">
                <router-link :to="{path:link,query:{bbsId:bbs.bbsId}}">
                <el-link :underline="false" class="fs-5 fw-bold mb-2 text-truncate d-block">{{bbs.title}}</el-link>
                </router-link>
                <div class="d-flex">
                  <router-link :to="{path:link,query:{bbsId:bbs.bbsId}}">
                    <el-link v-if="bbs.picture" :underline="false">
                      <el-image :src="bbs.picture.split(',')[0]" fit="scale-down" class="post_image rounded-3 align-middle me-3"></el-image>
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
                        <span class="px-1">{{bbs.commentsCount}}</span>
                      </div>
                      <div class="me-3 d-flex align-center">
                        <i class="ri-eye-fill"></i>
                        <span class="px-1">{{bbs.views}}</span>
                      </div>
                      <div class="me-3">{{bbs.bbsType}}</div>
                      <router-link :to="{path:'/examinationEvaluating/forum_personal',query:{userId:bbs.userId}}">
                        <el-link :underline="false">作者：{{bbs.nickname}}</el-link>
                      </router-link>
                      <div class="ms-auto">{{bbs.createTime}}</div>
                    </el-row>
                  </div>
                </div>
              </div>

            </div>
            <el-divider class="bg_gray m-0"></el-divider>
          </el-tab-pane>

        </el-tabs>


          <pagination class="py-4 px-4 mx-3"
          :total="total" v-if="total>0"
          :auto-scroll="false"
          :pageSizes="[5,10,20,30]"
          :page.sync="query.page"
          :limit.sync="query.size"
          @pagination="fetBbsList"
        />
      </div>
    </div>

    <!-- 发贴 -->
    <el-dialog
      :visible.sync="bbsVisible"
      width="600px"
      top="0"
      :append-to-body="true"
      custom-class="rounded-4"
      :before-close="clearFile"
    >
      <el-scrollbar class="column rounded-4">
        <div class="p-5">
          <form>
            <el-select placeholder="选择分类" v-model="bbsItemInfo.code" class="rounded-3 w-100">
              <el-option  :label="op.name" :value="op.code" v-for="(op,i) in bbsTypes" :key="i" ></el-option>

            </el-select>
            <el-input placeholder="贴子标题" v-model="bbsItemInfo.title" class="rounded-3 mt-3"></el-input>
            <el-scrollbar class="textarea_container rounded-3 border bg_lightgray mt-3" style="height:280px">
              <el-input placeholder="贴子内容" v-model="bbsItemInfo.content" type="textarea" :autosize="{minRows: 11}" resize="none" >
              </el-input>
            </el-scrollbar>
          </form>

          <div class="fs-6 fw-bold mt-4">上传图片</div>
          <el-upload
            ref="upload"
          class="mt-3"
            :action="baseImgURL+'/api/file/fileUpload'"
            :headers="headers"
            list-type="picture-card"
            :on-success="addPicture"

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

      <div slot="footer" class="pb-3 pt-2">
        <el-button type="primary" class="rounded-3 mx-auto" style="width:300px" :disabled="!bbsItemInfo.code||!bbsItemInfo.title||!bbsItemInfo.content" @click="submitBbs">发布贴子</el-button>
      </div>
    </el-dialog>
  </div>
</template>



<script>
 import Pagination from "@/components/Pagination"
 import {sendGet, sendPost, sendPostByBody, sendPostByJson, sendPostByKeyValue} from '@/utils/httpUtils';
import { getUserInfo } from '@/utils/auth';

export default {
  components:{
    Pagination
  },
  data() {

    //页面数据容器
    return {
      baseImgURL:"",
      activeName: '',
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      textarea:"",
      url:"",
      fit:"",
      bbsVisible: false,
      query:{
        page:1,
        size:10,
        keyword:undefined,
        // title:undefined,
        code:undefined,
        sort:0,
        order:1,
      },
      total:0,
      bbsTypes:[],
      bbsList:[],
      order_time:1,
      order_count:1,
      bbsItemInfo:{
        bbsId:undefined,
        code:undefined,
        content:undefined,
        picture:[],
        userId:undefined,
        title:undefined,
        state:0
      },
      fileList:[],
      link:'/examinationEvaluating/forum_info',
      headers:{},
      permissions:[],
      tempPicList:[]
    };
  },

  //监听
 async created(){
     await this.getBbsTyps()
  },
  mounted(){
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
  async  getBbsTyps(){
      const url="/AppConfig/getAllBbsType"
      const res= await sendPostByKeyValue(url,{})
      if(res&&res.code==200){

        this.bbsTypes=res.data
        if(this.bbsTypes.length>0){
          this.activeName=this.bbsTypes[0].code
          await this.fetBbsList()
        }
      }
    },
    fetchByKey(){
      this.fetBbsList()
    },
   async fetBbsList(){
    this.bbsList=[]
     const url="/AppBbs/searchBbs"
    //  this.query.title=this.activeName
     this.query.code=this.activeName
    this.query.order= this.query.sort==0?this.order_time:this.order_count
      const res= await sendPostByKeyValue(url,this.query)
      if(res&&res.code==200){
        this.bbsList=res.data.list
        this.total=res.data.total
      }
    },
    changeTimeSort(){
       this.query.sort=0
       this.order_time=this.order_time===0?1:0
      //  this.order_count=0
      this.fetBbsList()
    },
    changeSortCount(){

      this.query.sort=1
      this.order_count=this.order_count===0?1:0
      this.fetBbsList()
    },
    handleClick(){

      this.query.page=1
      this.total=0
      this.fetBbsList()
    },
    handleRemove(file) {
      this.tempPicList.forEach((pic,index)=>{
        if(pic.url === file.url){
          this.bbsItemInfo.picture.splice(index,1)
          this.$refs.upload.uploadFiles.splice(index,1)
        }
      })
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.$refs.uploadPreview.showViewer = true
    },
    handleDownload(file) {
      console.log(file);
    },

    openDialog(){

      this.bbsItemInfo={
        bbsId:undefined,
        code:undefined,
        content:undefined,
        picture:[],
        userId:getUserInfo().userId,
        title:undefined,
        state:0
      }
      this.fileList=[]
      this.bbsVisible=true
    },
    async submitBbs(){
      this.bbsItemInfo.picture = this.bbsItemInfo.picture.join(',')
      const  url = "/AppBbs/saveBbs"
      const response = await sendPostByBody(url,this.bbsItemInfo)
      if(response?.code === 200)
      {
        this.$message({
          message: "您的帖子正在审核，审核通过后即可查看",
          type: "info",
        })
        this.bbsVisible=false
        await this.fetBbsList()
      }
    },
    addPicture(response, file, fileList){
      this.bbsItemInfo.picture.push(response.data.fileUrl);
      this.tempPicList=fileList
    },
    clearFile(done){
      this.$refs.upload.clearFiles()
      done()
    }
  }
};
</script>

<style scoped>
</style>
