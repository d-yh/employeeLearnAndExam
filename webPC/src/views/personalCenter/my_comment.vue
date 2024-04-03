<template>
  <div class="bg-white rounded-4 p-3 my-4">
    <h4 class="p-3">我的评论</h4>
    <el-scrollbar>
      <ul class="list-group border-0 px-3">
        <li v-for="item in commentList" :key="item.bbsCommentsId" >
            <el-row type="flex" justify="space-between">
              <div>{{ item.content }}</div>
              <el-button @click="delComment(item.bbsCommentsId)" class="right" size="small" type="danger" >删除评论</el-button>
            </el-row>
            <div class="fs_sm text_lightgray">{{ item.createTime }}</div>
            <router-link :to="{path:link,query:{bbsId:item.bbsId}}">
              <el-row type="flex" align="middle" class="rounded-4 bg_gray overflow-hidden my-2">
                  <el-link v-if="item.bbsPhoto" :underline="false">
                    <el-image :src="item.bbsPhoto" fit="cover" class="ratio ratio-4x3 align-middle" style="width: 150px"></el-image>
                  </el-link>

                <div class="col overflow-hidden p-3">
                  <div class="fs_sm">{{item.bbsNickname}}</div>
                  <div class="my-1 text-truncate w-100">{{ item.bbsTitle }}</div>
                </div>
              </el-row>
            </router-link>

        </li>
      </ul>
      <pagenation
        class="p-3  border-top border-light"
        :total="total"
        :auto-scroll="false"
        :pageSizes="[20, 40, 60, 80,100]"
        :page.sync="serverQuery.page"
        :limit.sync="serverQuery.size"
        @pagination="getCostList"
      />
    </el-scrollbar>
  </div>
</template>

<script>
import {sendPostByKeyValue} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
export default {
  components:{
    Pagenation
  },
  data () {
    return {
      commentList:[],
      link:'/examinationEvaluating/forum_info',
      total:0,
      serverQuery:{
        page:1,
        size:20
      }
    }
  },
  computed: {

  },
  created() {
    this.getCostList()
  },
  methods:{
    async getCostList(){
      const url = "/AppMySelf/getMySelfComment"
      const response = await  sendPostByKeyValue(url,this.serverQuery)
      if(response?.code === 200)
      {
        this.total = response.data.total
        this.commentList = response.data.list
      }
    },
    async delComment(id){
      this.$confirm("确定要删除评论?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            const url = "/AppMySelf/deleteBbsComments"
            const response = await  sendPostByKeyValue(url,{bbsCommentsId:id})
            if(response?.code === 200)
            {
              this.$message({
                type:"success",
                message:"删除成功"
              })
              await this.getCostList()
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
}
</script>
