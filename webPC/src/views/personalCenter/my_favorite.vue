<template>
  <div class="bg-white rounded-4 p-3 my-4">
    <h4 class="p-3">我的收藏</h4>

    <div class="w-100 card list-group border-0 rounded-4 px-3">
      <div v-for="item in favoriteList" :key="item.bbsId" class="list-group-item py-4 px-0">
        <router-link :to="{path:link,query:{bbsId:item.bbsId}}">
          <el-link :underline="false" class="fs-5 fw-bold mb-2">{{item.title}}</el-link>
        </router-link>
        <div class="d-flex">
          <router-link v-if="item.picture" :to="{path:link,query:item.bbsId}">
            <el-link :underline="false">
              <el-image :src="item.picture.split(',')[0]" fit="cover" class="rounded-3 post_image align-middle me-3"></el-image>
            </el-link>
          </router-link>
          <div class="col overflow-hidden d-flex flex-column">
            <div class="col">
              <router-link :to="{path:link,query:{bbsId:item.bbsId}}">
                <el-link :underline="false" class="text_gray">{{ item.content }}</el-link>
              </router-link>
            </div>
            <el-row type="flex" align="middle" class="text_lightgray mt-3">
              <div class="me-3 d-flex align-center">
                <i class="ri-chat-2-fill"></i>
                <span class="px-1">{{ item.commentsCount }}</span>
              </div>
              <div class="me-3 d-flex align-center">
                <i class="ri-eye-fill"></i>
                <span class="px-1">{{ item.views }}</span>
              </div>
              <div class="me-3">{{ item.createTime }}</div>
              <el-button @click="removeFavorite(item.bbsId)" class="ms-auto" round plain type="info">取消收藏</el-button>
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
        @pagination="getFavoriteList"
      />
    </div>
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
      favoriteList:[],
      link:"/examinationEvaluating/forum_info",
      total:0,
      serverQuery:{
        page:1,
        size:20
      }
    }
  },
  computed: {

  },
  mounted() {
    this.getFavoriteList()
  },
  methods:{
    async getFavoriteList(){
      const url = "/AppMySelf/getMyselfCollection"
      const response = await  sendPostByKeyValue(url,this.serverQuery)
      if(response?.code === 200)
      {
        this.total = response.data.total
        this.favoriteList = response.data.list
      }
    },
    async removeFavorite(bbsId){
      this.$confirm("确定要删除该收藏?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            const url="/AppBbs/removeCollection"
            const res = await sendPostByKeyValue(url,{bbsId:bbsId})
            if(res&&res.code===200){
              this.$message({
                message: "取消成功",
                type: "success",
              });
              this.showDetail={}
              await this.getFavoriteList()
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
