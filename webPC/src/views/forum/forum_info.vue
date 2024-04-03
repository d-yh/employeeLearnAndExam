<template>
  <div class="bg_gray w-100 h-100 scroll_bar" id="top">
    <div class="container py-4" >

      <el-breadcrumb separator-class="el-icon-arrow-right fs_sm" class="fs-6 mb-4">
        <el-breadcrumb-item :to="{ path: '/forum/forum' }" class="text_gray">论坛</el-breadcrumb-item>
        <el-breadcrumb-item class="text_gray">帖子详情</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="bg-white rounded-4 p-4">
        <el-page-header @back="returnPage">
        </el-page-header>
        <el-row type="flex" class="align-items-start p-3">
          <h3 class="me-4 lh-base">{{ bbsDetail.title }}</h3>
          <el-button v-if="permissions.includes('2041')&&bbsDetail.state === 1" @click="toBottom" class="ms-auto" type="primary" round plain>评论</el-button>
          <el-button v-if="permissions.includes('2041')&&bbsDetail.state === 1" @click="showReport=true"  type="primary" round plain>举报</el-button>
        </el-row>
        <el-row type="flex" align="middle" class="bg_gray rounded-3 p-3">
          <router-link :to="{path:link,query:{userId:bbsDetail.userId}}">
            <el-avatar :src="bbsDetail.photo" class="cursor_pointer"></el-avatar>
          </router-link>
          <div class="mx-2">{{ bbsDetail.nickname }}</div>
          <div class="text_gray ms-2 me-auto">{{ bbsDetail.code }}</div>
          <i class="ri-eye-fill text_gray me-1"></i>
          <div class="text_gray">{{ bbsDetail.views }}</div>
          <el-button v-if="bbsDetail.isCollection===0" @click="changeFavorite" class="ms-4 btn-primary  py-2 " type="primary" round size="medium" style="width:90px" icon="ri-heart-line">
            <span class="fw-bold mx-1">收藏</span>
          </el-button>
          <el-button v-if="bbsDetail.isCollection===1" @click="changeFavorite" class="ms-4 btn-primary  py-2 is_favorite" type="primary" round size="medium" style="width:90px" icon="ri-heart-line">
            <span class="fw-bold mx-1">已收藏</span>
          </el-button>
        </el-row>

        <div class="p-3">
          <div class="fourm_list vstack py-2">
            <!-- 贴子内容 -->
            <div class="fourm_content mt-2">
              <div>{{ bbsDetail.content }}</div>
              <div v-if="bbsDetail.picture">
                <img  class="mx-3 py-2" v-for="(picture,index) in bbsDetail.picture.split(',')" :key="index" style="max-height: 500px;max-width: 500px" :src="picture" alt=""/>
              </div>
            </div>
          </div>

          <!-- 评论 -->

          <div v-for="(comment,index) in commentList" :key="comment.bbsCommentsId" class="fourm_list vstack py-2">
            <el-row type="flex" align="middle" class="mt-3">
              <router-link :to="{path:link,query:{userId:comment.userId}}">
                <el-avatar :src="comment.picture" class="cursor_pointer"></el-avatar>
              </router-link>
              <div class="mx-2">{{ comment.nickname }}</div>
              <span v-if="comment.isAuthor === 1" class="badge bg-primary">楼主</span>
            </el-row>
            <div class="fourm_content mt-2" style="overflow-wrap: anywhere;">{{ comment.content }}</div>
            <el-row type="flex" align="middle" class="text_gray py-2">
              <div>{{ index+1 }}楼</div>
              <div class="mx-3 text_lightgray">{{ comment.createTime }}</div>
              <el-link v-if="permissions.includes('2041')" v-b-toggle="'inputReplay'+comment.bbsCommentsId.toString()" @click="popSendCommentSub" type="primary" :underline="false" class="ms-auto me-2">回复</el-link>
            </el-row>


            <div class="rounded-4 bg_gray px-4">
              <ul v-if="comment.count>0" class="inner_fourm_list mt-2">
                <li v-for=" subComment in comment.bbsCommentExtends" class="inner_item py-2">
                  <el-row type="flex" align="middle">
                    <router-link :to="{path:link,query:{userId:subComment.userId}}">
                      <el-avatar :size="30" :src="subComment.picture" class="cursor_pointer"></el-avatar>
                    </router-link>
                    <div class="mx-2 text-primary">{{ subComment.nickname }}</div>
                    <span v-if="subComment.isAuthor === 1" class="badge bg-primary">楼主</span>
                    <span v-if="subComment.secondName" class="mx-3 text_gray">回复</span>
                    <div  v-if="subComment.secondName" class="mx-2 text-primary">{{ subComment.secondName }}</div>
                    <span v-if="subComment.secondIsAuthor === 1" class="badge bg-primary">楼主</span>
                  </el-row>
                  <div class="content ps-2">
                    <div style="overflow-wrap: anywhere;">{{ subComment.content }}</div>
                    <el-row type="flex" justify="between" class="mt-2">
                      <span class="text_lightgray fs_sm">{{ subComment.createTime }}</span>
                      <el-link v-if="permissions.includes('2041')" v-b-toggle="'inputReplay'+comment.bbsCommentsId.toString()" @click="popReplySendCommentSub(subComment)" :underline="false" class="ms-auto">回复</el-link>
                    </el-row>
                  </div>
                </li>
              </ul>
              <b-collapse  class="inner_fourm_list" :id="'allComment'+comment.bbsCommentsId.toString()">
                <div v-for="commentSub in commentSubList" class="inner_item py-2">
                  <el-row type="flex" align="middle">
                    <router-link :to="{path:link,query:{userId:commentSub.userId}}">
                      <el-avatar :size="30" :src="commentSub.picture" class="cursor_pointer"></el-avatar>
                    </router-link>
                    <div class="mx-2 text-primary">{{ commentSub.nickname }}</div>
                    <span v-if="commentSub.isAuthor" class="badge bg-primary">楼主</span>
                    <span v-if="commentSub.secondName" class="mx-3 text_gray">回复</span>
                    <div v-if="commentSub.secondName" class="mx-2 text-primary">{{ commentSub.secondName }}</div>
                    <span v-if="commentSub.secondIsAuthor" class="badge bg-primary">楼主</span>
                  </el-row>
                  <div class="content ps-2">
                    <div style="overflow-wrap: anywhere;">{{ commentSub.content }}</div>
                    <el-row type="flex" justify="between" class="mt-2">
                      <span class="text_lightgray fs_sm">{{ commentSub.createTime }}</span>
                      <el-link v-if="permissions.includes('2041')" v-b-toggle="'inputReplay'+comment.bbsCommentsId.toString()" @click="popReplySendCommentSub(commentSub)" :underline="false" class="ms-auto">回复</el-link>
                    </el-row>
                  </div>
                </div>
              </b-collapse>
              <div v-if="comment.count>serverQuery.count" class="list_more">
                <el-link v-b-toggle="'allComment'+comment.bbsCommentsId.toString()" @click="getCommentSubs(comment.bbsCommentsId)" type="info" :underline="false" class="py-2 click_btn">
                  <span class="when-open">收起</span>
                  <span class="when-closed">查看全部 {{ comment.count }} 条回复</span>
                  <i class="el-icon-arrow-down"></i>
                </el-link>
              </div>
              <b-collapse :id="'inputReplay'+comment.bbsCommentsId.toString()" class="replay_box">
                <el-row type="flex" class="input_box py-3" align="bottom">
                  <!-- 发回复 -->
                  <el-input
                    type="textarea"
                    :autosize="{maxRows:5}"
                    :placeholder="secondCommentUser.secondName?'回复 '+secondCommentUser.secondName+'：':'请输入'"
                    v-model="commentSub"
                    class="rounded-3"
                    resize="none"
                    maxlength="200" show-word-limit>
                  </el-input>
                  <el-button type="primary" :disabled="!commentSub" @click="sendCommentSub(comment.bbsCommentsId)" size="medium" class="ms-2 rounded-3 btn-primary" style="height:35px">发表</el-button>
                </el-row>
              </b-collapse>
            </div>
          </div>
          <pagenation
            v-if="totalComment>0"
            class="mt-3"
            background
            layout="prev, pager, next"
            :total="totalComment"
            :auto-scroll="false"
            :pageSizes="[20, 40, 60, 80,100]"
            :page.sync="serverQuery.page"
            :limit.sync="serverQuery.size"
            @pagination="getBbsComment"
          />
        </div>

        <div v-if="permissions.includes('2041')&&bbsDetail.state === 1" class="p-3" id="postComment">
          <!-- 发评论 -->
          <div class="fw-bold mt-4">发表评论</div>
          <el-input placeholder="请输入" type="textarea" :autosize="{minRows: 5}" resize="none" v-model="comment" maxlength="200" show-word-limit class="rounded-3 mt-2"></el-input>
          <el-button type="primary" :disabled="!comment" @click="sendComment" class="mt-3 btn-primary px-5 rounded-4">发表</el-button>
        </div>

      </div>
    </div>
    <el-dialog
      width="600px"
      :visible.sync="showReport"
      top="0"
      :append-to-body="true"
      custom-class="rounded-4 height_unset"
    >
      <div class="p-5">
        <el-scrollbar class="textarea_container rounded-3 border bg_lightgray mt-3" style="height:280px">
          <el-input placeholder="举报内容" type="textarea" v-model="reportContent" :autosize="{minRows: 11}" resize="none">
          </el-input>
        </el-scrollbar>
      </div>
      <div slot="footer" class="pb-3">
        <el-button type="primary" :loading="loading"  class="rounded-3 mx-auto btn-primary" style="width:300px" @click="sendReport">举报</el-button>
      </div>
    </el-dialog>
  </div>
</template>



<script>
import {sendPost, sendPostByBody, sendPostByKeyValue} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
import {dateFormat} from "@/utils/custom";
export default {
  components:{
    Pagenation
  },
  data() {

    //页面数据容器
    return {
      loading:false,
      comment:'',
      commentSub: '',
      bbsId:'',
      bbsDetail:{},
      commentList:[],
      totalComment:0,
      serverQuery:{
        page:1,
        size:20,
        bbsId:0,
        count:2
      },
      commentSubList:[],
      totalCommentSub:0,
      serverQuerySub:{
        page:1,
        size:20,
        bbsCommentsId:0,
      },
      saveComment:{},
      secondCommentUser:{
        secondIsAuthor : undefined,
        secondName :undefined,
        secondUserId:undefined,
      },
      link:'/examinationEvaluating/forum_personal',
      permissions:[],
      showReport:false,
      reportContent:undefined
    };
  },
  mounted() {
    this.getBbsDetail()
    this.getBbsComment()
    this.getPermission()
  },
  //监听
  watch: {
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
    async getBbsDetail()
    {
      const user = this.$store.state.user.userInfo
      this.serverQuery.bbsId =this.bbsId = this.$route.query.bbsId
      const url = "/AppBbs/getBbsById"
      const response = await  sendPostByKeyValue(url,{bbsId:this.bbsId})
      if(response?.code === 200){
        this.bbsDetail = response.data
        this.saveComment = {
          isAuthor :this.bbsDetail.userId === user.userId?1:0,
          createTime:dateFormat(),
          content:"",
          bbsId:this.bbsId,
          name:user.nickname,
          userId:user.userId
        }
      }
    },
    async changeFavorite(){
      const url = this.bbsDetail.isCollection===1?"/AppBbs/removeCollection":"/AppBbs/collection"
      const  response = await sendPostByKeyValue(url,{bbsId:this.bbsDetail.bbsId})
      if(response?.code === 200){
        this.bbsDetail.isCollection = this.bbsDetail.isCollection===1?0:1
        this.$message({
          message:this.bbsDetail.isCollection=== 1 ?"收藏成功":"取消收藏",
          type:"success"
        })
      }
    },
    async getBbsComment(){
      const url = "/AppBbs/getBbsComment"
      const response = await  sendPostByKeyValue(url,this.serverQuery)
      if(response?.code === 200){
        this.totalComment = response.data.total
        this.commentList = response.data.list
      }
    },
    async getCommentSubs(commentId){
      const url = "/AppBbs/getBbsCommentSecond"
      this.serverQuerySub.bbsCommentsId =commentId
      const response = await  sendPostByKeyValue(url,this.serverQuerySub)
      if(response?.code === 200){
        this.totalCommentSub = response.data.total
        response.data.list.splice(0,this.serverQuery.count)
        this.commentSubList = response.data.list
      }
    },
    toBottom(){
      let el = document.getElementById('top');
      let st = document.getElementById("postComment");
      el.scrollTop = st.offsetTop-50;
    },
    async sendComment()
    {
      const url = "/AppBbs/saveBbsComment"
      this.secondCommentUser ={
        secondIsAuthor : undefined,
        secondName :undefined,
        secondUserId:undefined,
      }
      this.saveComment={
        ...this.secondCommentUser,
        ...this.saveComment,
        content:this.comment,
        firstCommentsId :undefined,
        createTime:dateFormat()
      }
      const response = await sendPostByBody(url,this.saveComment)
      if(response?.code === 200){
        this.$message({
          message:"评论成功",
          type:"success"
        })
        this.serverQuery.page = 1
        this.comment =""
        await this.getBbsComment()
        document.getElementById('top').scrollTop = 0;
      }
    },
    async sendCommentSub(firstCommentId)
    {
      const url = "/AppBbs/saveBbsComment"
      this.saveComment = {
        ...this.secondCommentUser,
        ...this.saveComment,
        content: this.commentSub,
        firstCommentsId : firstCommentId,
        createTime:dateFormat()
      }
      const response = await sendPostByBody(url,this.saveComment)
      if(response?.code === 200){
        this.$message({
          message:"评论成功",
          type:"success"
        })
        this.serverQuerySub.page = 1
        this.commentSub=""
        await this.getBbsComment()
        await this.getCommentSubs(firstCommentId)
      }
    },
    popSendCommentSub(){
      this.secondCommentUser={
        secondIsAuthor : undefined,
        secondName :undefined,
        secondUserId:undefined
      }
    },
    popReplySendCommentSub(commentSub){
      this.secondCommentUser={
        secondIsAuthor : commentSub.isAuthor,
        secondName :commentSub.nickname,
        secondUserId:commentSub.userId
      }
    },
    async sendReport(){
      this.loading = true
      const url = "/AppBbs/bbsReport"
      const response = await  sendPostByKeyValue(url, {bbsId:this.bbsId,content:this.reportContent})
      if(response?.code === 200){
        this.loading = false
        this.$message({
          type: 'success',
          message: '举报成功'
        });
        this.showReport = false
        this.reportContent = undefined
      }
    },
    returnPage(){
      this.$router.back()
    }
  }
};
</script>

<style scoped>
</style>
