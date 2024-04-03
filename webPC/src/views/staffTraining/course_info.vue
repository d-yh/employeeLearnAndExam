<template>
  <div class="bg_gray w-100 h-100 px-4 py-3 vstack">
    <el-row type="flex" class="col align-items-start">
      <div class="col bg-white rounded-4 overflow-hidden me-3 py-4">
        <el-breadcrumb separator-class="el-icon-arrow-right fs_sm" class="fs-6 px-4">
          <el-breadcrumb-item :to="{ path: '/staffTraining/staff_training' }" class="text_gray">员工培训</el-breadcrumb-item>
          <el-breadcrumb-item>课程详情</el-breadcrumb-item>
        </el-breadcrumb>
        <el-divider class="bg_gray"></el-divider>
        <el-row type="flex" class="gap-3 px-4">
          <div  class="rounded-4 col ratio ratio-16x9 overflow-hidden">
            <el-image v-if="trainingDetail.cover" :src="trainingDetail.cover"></el-image>
          </div>
          <div v-if="permissions.includes('2031')" class="bg_gray rounded-4 w-30 ratio" style="--bs-aspect-ratio: 128%;">
            <div class="scroll_bar p-2">
              <el-collapse v-model="allItem" @change="changeCatalog" class="course_catalog border-0">
                <el-collapse-item v-for="(chapter,indexChapter) in trainingDetail.chapterExtendList" :key="chapter.chapterId" :name="chapter.chapterId.toString()">
                  <template slot="title">
                    <i class="header-icon ri-lock-2-fill d-none"></i>第{{toChinesNum(indexChapter+1)}}章  {{ chapter.chapterName }}
                  </template>
                    <el-button v-for="(cc,ccIndex) in chapter.children" :key="cc.chapterId" @click="saveItem(cc.chapterId)"  :disabled="cc.isUnlock!==1" :icon="cc.isUnlock!==1?'ri-lock-2-fill':''">
                         第{{toChinesNum(ccIndex+1)}}节  {{ cc.chapterName }}
                    </el-button>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-row>
        <div class="p-4">
          <h4 class="fw-bold">{{ trainingDetail.name }}</h4>
          <div class="text_gray">共{{ trainingDetail.classCount }}节 | {{ trainingDetail.professionName }}</div>
          <el-divider class="bg_gray"></el-divider>
          <div class="fw-bold mb-2">课程介绍</div>
          <div>
            <div v-html="trainingDetail.content"></div>
          </div>
        </div>
      </div>
    </el-row>
  </div>
</template>



<script>
import {sendPost, sendPostByKeyValue} from "@/utils/httpUtils";
import {getPermissionList} from "@/api/user";

export default {
  data() {
    //页面数据容器
    return {
      allItem:[],
      trainingDetail:{},
      trainingId:undefined,
      timer:undefined,
      permissions:[]
    };
  },

  //监听
  watch: {
  },
  created() {
    this.trainingId =this.$route.query.trainingId
    this.getDetail()
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
        response.data.chapterExtendList.forEach((item,index)=>this.allItem.push(item.chapterId.toString()))

      }
    },
    saveItem(courseId){
      localStorage.setItem('course_item', courseId)
      this.$router.push({path:'/examinationEvaluating/take_class',query:{trainingId:this.trainingId}})
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
    }
  }
};
</script>

<style scoped>
</style>
