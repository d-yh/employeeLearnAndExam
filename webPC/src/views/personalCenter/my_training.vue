<template>
  <div class="bg-white rounded-4 p-3 my-4">
    <h4 class="p-3">我的培训</h4>
      <el-scrollbar>
        <div class="p-3" v-for="item in trainings" :key="item.trainingId">
          <ul class="rounded-4 list-group border-0 mt-1 px-4 bg_gray">
            <li class="px-0 py-4 d-flex list-group-item bg_gray">
              <router-link :to="{path:link,query:{trainingId:item.trainingId}}">
                <el-link  class="ratio" :underline="false" style="width: 120px;--bs-aspect-ratio: 60%;">
                    <el-image :src="item.cover" fit="cover" class="bg_gray rounded-4 overflow-hidden w-100 h-100"></el-image>
                </el-link>
              </router-link>
              <div class="px-3 vstack">
                <router-link :to="{path:link,query:{trainingId:item.trainingId}}">
                  <el-link :underline="false" class="d-block fs-5 flex-fill">{{ item.name }}</el-link>
                </router-link>
                <div class="text_gray fs_sm d-flex">
                  <span>共{{ item.classCount }}节</span>
                  <span class="mx-3">专业：{{ item.professionName }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <pagenation
          class="p-3  border-top border-light"
          :total="total"
          :auto-scroll="false"
          :pageSizes="[20, 40, 60, 80,100]"
          :page.sync="serverQuery.page"
          :limit.sync="serverQuery.size"
          @pagination="getTrainingList"
        />
      </el-scrollbar>
  </div>
</template>

<script>
import {sendGet, sendPostByKeyValue} from "@/utils/httpUtils";
import Pagenation from  "@/components/Pagination"
export default {
  components:{
    Pagenation
  },
  data () {
    return {
      trainings:[],
      link:"/examinationEvaluating/course_info",
      total:0,
      serverQuery:{
        page:1,
        size:20
      }
    }
  },
  created() {
    this.getTrainingList()
  },
  computed: {

  },
  methods:{
    async getTrainingList(){
      const url = "/AppMySelf/getMySelfTraining"
      const response = await sendPostByKeyValue(url,this.serverQuery)
      if(response?.code === 200){
        this.total = response.data.total
        this.trainings = response.data.list
      }
    }
  }
}
</script>
