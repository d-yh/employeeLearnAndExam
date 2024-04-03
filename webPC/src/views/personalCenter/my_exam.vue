<template>
  <div class="bg-white rounded-4 p-3 my-4">
    <h4 class="p-3">我的考试</h4>
    <div class="p-3">
      <h6 class="fw-bold">待考试</h6>
      <el-row  class="scroll_bar" style="white-space: nowrap !important;overflow-x:auto;overflow-y: hidden">
        <div style="display: inline-block;width: 300px;height: 100px;"  v-for="item in waitExamList" :key="item.gradeRecordId" class="my-2 mx-2">
          <div class="bg_gray rounded-4 p-3 border">
            <h5>{{ item.examName }}</h5>
            <el-dropdown trigger="click">
            <span class="el-dropdown-link">
                <router-link :underline="false" type="info" :to="{path:link,query:{gradeRecordId:item.gradeRecordId}}">
                  去考试
                  <i class="ri-arrow-right-s-line"></i>
                </router-link>
            </span>
              <!-- <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="type in examType" :key="type.basicConfigId">
                  <router-link :to="{path:link,query:{gradeRecordId:item.gradeRecordId,code:type.code}}">
                    {{ type.name }}
                  </router-link>
                </el-dropdown-item>
              </el-dropdown-menu> -->
            </el-dropdown>
          </div>
        </div>
      </el-row>
    </div>
    <el-row type="flex" align="middle" class="p-3">
      <h6 class="fw-bold">成绩列表</h6>
      <el-date-picker
        :editable="false"
        v-model="timeRange"
        @change="getHasExamList"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="ms-auto rounded-3">
      </el-date-picker>
    </el-row>
    <div class="px-3">
      <!-- 成绩列表 -->
      <el-table :data="hasExamList" :highlight-current-row="true" class="w-100">
        <el-table-column align="left" prop="examName" label="考试"></el-table-column>
        <!-- <el-table-column align="left" prop="configName" label="等级"></el-table-column> -->
        <el-table-column align="left" prop="submitDate" label="时间"></el-table-column>
        <el-table-column align="left" prop="score" label="成绩"></el-table-column>
        <el-table-column align="left" prop="roleName" label="">
          <template scope="{row}">
            <router-link :to="{path:link,query:{gradeRecordId:row.gradeRecordId}}">
              <el-link type="primary">
                重考
              </el-link>
            </router-link>
            |
              <router-link :to="{path:'/wrongCollections',query:{gradeRecordId:row.gradeRecordId}}">
              <el-link type="primary">
                错题集
              </el-link>
            </router-link>
          </template>
        </el-table-column>
      </el-table>
      <pagenation
        class="p-3  border-top border-light"
        :total="total"
        :auto-scroll="false"
        :pageSizes="[20, 40, 60, 80,100]"
        :page.sync="serverQuery.page"
        :limit.sync="serverQuery.size"
        @pagination="getHasExamList"
      />
    </div>
  </div>
</template>

<script>
import {sendGet, sendPost, sendPostByKeyValue} from "@/utils/httpUtils";
import  {dateFormat} from "@/utils/custom";
import Pagenation from  "@/components/Pagination"
export default {
  components:{
    Pagenation
  },
  data () {
    return {
      waitExamList:[],
      hasExamList:[],
      timeRange:[],
      tableData:[],
      link:"/examinationEvaluating",
      total:0,
      serverQuery:{
        page:1,
        size:20
      },
      examType:[]
    }
  },
  computed: {

  },
  created() {
    this.initTimeRange()
    this.getWaitExamList()
    this.getHasExamList()
    this.getAllExamType()
  },
  methods:{
    initTimeRange(){
     const endTime = new Date(new Date().toLocaleDateString())
     const startTime = new Date(new Date().setDate(new Date().getDate()-7))
     this.timeRange = [startTime,endTime]
    },
    async getWaitExamList(){
      const url = "/AppExamPaper/getAllGradeRecord"
      const response = await sendPostByKeyValue(url,{state:0})
      if(response?.code === 200)
      {
        this.waitExamList = response.data
      }
    },
    async getHasExamList(){
      const time = this.timeRange
      const url = "/AppExamPaper/getAllGradeRecord"
      const startTime =time&&time[0]?dateFormat(new Date(Date.parse(time[0])),true):undefined
      const endTime = time&&time[1]?dateFormat(new Date(Date.parse(time[1])),true):undefined
      const response = await sendPostByKeyValue(url,{...this.serverQuery,state:1,startTime:startTime,endTime:endTime})
      if(response?.code === 200)
      {
        this.total = response.data.length
        this.hasExamList = response.data
      }
    },
    async getAllExamType(){
      const  url = "/AppConfig/getAllDifficultyLevel"
      const response = await  sendPost(url)
      if(response?.code === 200)
      {
        this.examType = response.data
      }
    }
  }
}
</script>
