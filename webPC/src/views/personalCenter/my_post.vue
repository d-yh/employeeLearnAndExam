<template>
  <div class="bg-white rounded-4 p-3 my-4">
    <h4 class="p-3">我的贴子 (<span>{{ total }}</span>)</h4>
    <div class="w-100 card list-group border-0 rounded-4 px-3">
          <div v-for="item in postList" :key="item.bbsId" class="list-group-item py-4 px-0">
            <el-row type="flex" align="middle" class="mb-2">
              <router-link class="fs-5 fw-bold text-truncate col d-block" :to="{path:link,query:{bbsId:item.bbsId}}">
                <el-link :underline="false" class="fs-5 fw-bold text-truncate col d-block">{{ item.title }}</el-link>
              </router-link>
              <div v-if="item.state === 0" class="bg-secondary text-white px-3 py-2 ms-3 rounded-pill">审核中</div>
              <div v-else-if="item.state === 1" class="bg-primary  text-white px-3 py-2 ms-3 rounded-pill">审核通过</div>
              <div v-else class="bg-danger bg-opacity-75 text-white px-3 py-2 ms-3 rounded-pill">审核未通过</div>
            </el-row>
            <div class="d-flex">
              <router-link v-if="item.picture" :to="{path:link,query:{bbsId:item.bbsId}}">
                <el-link  :underline="false">
                  <el-image :src="item.picture.split(',')[0]" fit="cover" class="rounded-3 post_image align-middle me-3"></el-image>
                </el-link>
              </router-link>
              <div class="col overflow-hidden d-flex flex-column">
                <div class="col">
                  <router-link class="text_gray text_truncate_2" :to="{path:link,query:{bbsId:item.bbsId}}">
                    <el-link :underline="false" class="text_gray text_truncate_2">{{ item.content }}</el-link>
                  </router-link>
                </div>
                <el-row type="flex" class="text_lightgray mt-3" align="middle">
                  <div class="me-3 d-flex align-center">
                    <i class="ri-chat-2-fill"></i>
                    <span class="px-1">{{ item.commentsCount }}</span>
                  </div>
                  <div class="me-3 d-flex align-center">
                    <i class="ri-eye-fill"></i>
                    <span class="px-1">{{ item.views }}</span>
                  </div>
                  <div class="me-3">{{ item.createTime }}</div>
                  <el-button @click="showPost(item)" circle class="btn_icon_noborder ms-auto"><i class="ri-edit-2-line"></i></el-button>
                  <el-button @click="deletePost(item.bbsId)" circle class="btn_icon_noborder " ><i class="ri-delete-bin-line"></i></el-button>
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
        @pagination="getPostList"
      />
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
          <img
            v-if="bbsItemInfo"
            v-for="item in bbsItemInfo.picture"
            class="el-upload-list__item-thumbnail"
            :src="item" alt=""
          >
          <el-upload
            ref="upload"
            class="mt-3"
            :action="baseImgURL+'/api/file/fileUpload'"
            :headers="headers"
            list-type="picture-card"
            multiple :on-success="savePhoto">
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

                  <span @click="handleRemove(file)" class="el-upload-list__item-delete">
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
            </div>
          </el-upload>

        </div>
      </el-scrollbar>

      <div slot="footer" class="pb-3 pt-2">
        <el-button type="primary" class="rounded-3 mx-auto" :loading="loading" style="width:300px" @click="submitBbs">发布贴子</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {sendGet, sendPostByBody, sendPostByKeyValue} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
export default {
  components:{
    Pagenation
  },
  data () {
    return {
      postList:[],
      total:0,
      link:"/examinationEvaluating/forum_info",
      bbsVisible:false,
      bbsItemInfo:{
        bbsId:undefined,
        code:undefined,
        content:undefined,
        picture:undefined,
        userId:undefined,
        title:undefined,
      },
      bbsTypes:[],
      loading:false,
      readUpdate:[],
      serverQuery:{
        page:1,
        size:20
      },
      headers:{},
      baseImgURL:"",
      tempPicList:[],
      dialogImageUrl:""
    }
  },
  computed: {

  },
  async created(){
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    await this.getBbsTypes()

  },
  methods:{
    async  getBbsTypes(){
      const url="/AppConfig/getAllBbsType"
      const res= await sendPostByKeyValue(url,{})
      if(res&&res.code===200){

        this.bbsTypes=res.data
        await this.getPostList()
      }
    },
    async getPostList(){
      const url = "/AppBbs/getUserBbs"
      const response = await  sendPostByKeyValue(url,{userId:this.$store.state.user.userInfo.userId,...this.serverQuery})
      if(response?.code === 200)
      {
        this.total = response.data.total
        this.postList = response.data.list
      }
    },
    async deletePost(bbsId){
      this.$confirm("确定要删除该帖子?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            const url="/AppBbs/deleteBbs"
            const res = await sendPostByKeyValue(url,{bbsId:bbsId})
            if(res&&res.code===200){
              this.$message({
                message: "删除成功",
                type: "success",
              });
              this.showDetail={}
              await this.getPostList()
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
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.$refs.uploadPreview.showViewer = true
    },
    async submitBbs(){
      const url ="/AppBbs/update"
      this.bbsItemInfo.picture.push(this.readUpdate)
      this.bbsItemInfo.picture =this.bbsItemInfo.picture.join(",")
      const response = await sendPostByBody(url,this.bbsItemInfo);
      if(response?.code === 200)
      {
        this.$message({
          message: "修改成功",
          type: "success",
        });
        this.bbsItemInfo = {}

        this.bbsVisible = false
        await this.getPostList()
      }
    },
    showPost(item){
      this.bbsVisible = true
      this.readUpdate = []
      Object.assign(this.bbsItemInfo,item)
      this.bbsItemInfo.picture =item.picture?item.picture.split(","):[]
    },
    savePhoto(response, file, fileList){
      if(response)
      {
        this.readUpdate.push(response.data.fileUrl)
      }
      this.tempPicList = fileList
    },
    handleRemove(file){
      this.tempPicList.forEach((pic,index)=>{
        if(pic.url === file.url){
          this.bbsItemInfo.picture.splice(this.bbsItemInfo.picture.count-1+index,1)
          this.$refs.upload.uploadFiles.splice(index,1)
        }
      })
    },
    clearFile(done){
      this.$refs.upload.clearFiles()
      done()
    }
  }
}
</script>
