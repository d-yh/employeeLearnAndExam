<template>
  <div class="bg_lightgray h-100 scroll_bar" id="position" >
    <header class="exam_header hstack position-fixed top-0 w-100 bg_filter shadow py-2 px-4">
      <el-image :src="require('/public/static/images/logo_row.png')" class="h-100"></el-image>
      <el-tag
        type="danger"
        class="fw-bold fs-5 rounded-pill ms-auto px-3 h-auto py-1">
        剩余时间：{{question.examDuration}}分钟
      </el-tag>
    </header>
    <section>
      <div class="page_container py-4">
        <el-row :gutter="30">
          <el-col :span="19" >
            <div :id="'question'+index" v-for="(item,index) in question.examQuestionsExtendList" :key="item.examQuestionsId" class="w-100 bg-white rounded-4 p-5 overflow-hidden" style="box-shadow:0 0 5px rgba(0,0,0,.03)">
              <h3 v-if="item.queType === 0">{{index+1}}.单选题</h3>
              <h3 v-else-if="item.queType === 1">{{index+1}}.多选题</h3>
              <h3 v-else>{{index+1}}.判断题</h3>
              <div class="my-4 py-2">
                <p class="fs-5 fw-bold" v-html="item.queContent"></p>
                <el-radio-group v-if="item.queType === 0||item.queType === 2" size="medium" v-model="item.userAnswer">
                  <el-radio @click.native="(!finishQuestion.includes(item.examQuestionsId))&&finishQuestion.push(item.examQuestionsId)" :label="option.optionName" v-for="option in item.options" :key="option.queOptionsId">{{option.optionContent}}</el-radio>
                </el-radio-group>
                <el-checkbox-group v-else-if="item.queType === 1" v-model="item.userAnswer">
                  <el-checkbox @click.native="(!finishQuestion.includes(item.examQuestionsId))&&finishQuestion.push(item.examQuestionsId)" :label="option.optionName" v-for="option in item.options" :key="option.queOptionsId">{{option.optionContent}}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </el-col>
          <el-col v-if="question.examQuestionsExtendList" :span="5" class="position-sticky end-0 py-3" style="top:95px;height:calc(100vh - 120px)">
            <el-scrollbar class="h-100 w-100 column">
              <div class="mh-100 position-relative overflow-hidden">
                <div class="pb-5">
                  <div class="px-1 mb-2 py-3">
                    <h4 class="fw-bold">{{ question.examName }}</h4>
                    <div class="text_gray">{{ question.professionName }} | {{ question.code }}</div>
                  </div>
                  <div class="py-2">
                    <el-row :gutter="8" class="gy-2">
                      <el-col v-for="(item,index) in question.examQuestionsExtendList" :key="item.examQuestionsId" :span="4" :class="'exam_num '+(finishQuestion.includes(item.examQuestionsId)&&'active')">
                        <div class="w-100 ratio ratio-1x1 my-1">
                          <el-button @click="jumpQuestion(index)" circle>{{index+1}}</el-button>
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                </div>
                <el-button  round type="primary" :disabled="question.examQuestionsExtendList.length!==finishQuestion.length" @click="submitAnswer" class="w-100 position-absolute bottom-0">提交</el-button>
              </div>
            </el-scrollbar>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>



<script>
import {sendPostByBody, sendPostByKeyValue} from "@/utils/httpUtils";

export default {
  data() {

    //页面数据容器
    return {
      gradeRecordId:undefined,
      code:undefined,
      question: {},
      activeNum:0,
      finishQuestion: [],
      checkOption:0,
      timerFinish:undefined,
      hiddenCount:0
    };
  },

  //监听
  watch: {
  },
  mounted() {
    this.gradeRecordId = this.$route.query.gradeRecordId
    // this.code = this.$route.query.code
    this.getExamDetail()
    document.addEventListener('visibilitychange',this.checkLeaveWindow )
  },
  //方法
  methods: {
    async getExamDetail(){
      const  url = "/AppExamPaper/getExamQuestions"
      const response = await sendPostByKeyValue(url,{gradeRecordId:this.gradeRecordId})
      if(response?.code === 200){
        response.data.examQuestionsExtendList.forEach(q=>{
          if(q.queType === 0||q.queType === 2){
            q.userAnswer=""
          }
          if(q.queType === 1){
            q.userAnswer =[]
          }
        })
        this.question = response.data
        this.timerFinish = setInterval(()=>{
          if(this.question.examDuration>0)this.question.examDuration -=1
          if(this.question.examDuration<=0)
          {
            clearInterval(this.timerFinish)
            this.$alert('剩余时间为0，系统自动交卷', '考试时间到', {
              confirmButtonText: '确定',
              callback: action => {
                this.finishExam()
              }
            });

          }
        },60000)
      }
    },
    jumpQuestion(index){
      let position = document.getElementById('position')
      let question = document.getElementById('question'+index)
      position.scrollTop = question.offsetTop
    },
    submitAnswer(){
      this.$confirm("确定要提交试卷?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            await this.finishExam()
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
    async finishExam(){
      const url="/AppExamPaper/submitAnswer"
      this.question.examQuestionsExtendList.forEach(q=>{
        if(q.queType === 1){
          q.userAnswer = q.userAnswer.join('')
        }
      })
      const res = await sendPostByBody(url,this.question)
      if(res&&res.code===200){
        this.$message({
          message:"提交成功",
          type:"success"
        })
        this.$router.push({path:'wrongCollections',query:{gradeRecordId:this.gradeRecordId}})
      }
    },
    checkLeaveWindow(){
      if(document.hidden){
        this.hiddenCount+=1
        if(this.hiddenCount>3){
          clearInterval(this.timerFinish)
          this.$alert('检测多次离开窗口，系统自动交卷', '检测异常', {
            confirmButtonText: '确定',
            callback: action => {
              this.finishExam()
            }
          });
        }
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.timerFinish)
    document.removeEventListener("visibilitychange",this.checkLeaveWindow)
  }
};
</script>

<style scoped>
</style>
