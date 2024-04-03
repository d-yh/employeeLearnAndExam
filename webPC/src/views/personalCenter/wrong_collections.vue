<template>
  <div class="bg_lightgray h-100 scroll_bar" id="position" >

    <div :class="{'fixed-header':fixedHeader}">
      <navbar />
    </div>
    <section style="margin-top:60px">
      <div class="page_container py-4" >

          <el-row >
            <el-col :span="16" :offset="4" >
                <div class="return-container">
                     <el-breadcrumb separator="/" >
                        <el-breadcrumb-item to="/personalCenter/exam" >  <span class="el-icon-arrow-left"  style="color:#1F67B3;font-size:16px"></span > <span class="sp"> 考试测评</span></el-breadcrumb-item>
                        <el-breadcrumb-item ><span class="sp_test_name" v-text="errorSubjectInfo.examName"></span></el-breadcrumb-item>
                     </el-breadcrumb>
                </div>
                <div class="exam-container">
                    <div class="exam-result">
                        <span>考试成绩:</span>&nbsp;&nbsp;
                        <span v-text="errorSubjectInfo.score"></span> <span>分</span>
                    </div>
                    <div class="exam-tag">
                        <span v-text="errorSubjectInfo.examName"></span>&nbsp;&nbsp;&nbsp;&nbsp;
                        <span v-text="errorSubjectInfo.professionName"></span>
                    </div>
                </div>
                <div class="title">错题集</div>
            </el-col>

          </el-row>
          <el-row>
              <el-col :span="16" :offset="4" >
                  <div class="err-subject-container">
                      <div class="list-container"   v-if="singleChooseSubjectList.length>0">
                          <span>单选题</span>
                          <div class="sub-single-list">
                            <div class="sub-item" v-for="(item,index) in singleChooseSubjectList" :key='index'>
                                <div >

                                 <p class="fs-5 fw-bold fword"  style="display:flex;"  v-html="`${index+1}.  `+item.queContent">  </p>
                                </div>
                                 <el-radio-group size="medium" style="margin-left:10px" v-model="item.userAnswer">
                                    <el-radio disabled v-for="(i,idx) in  item.options"  :label="i.optionName" :key="idx">{{ `${i.optionName}  ${i.optionContent}` }}</el-radio>

                                 </el-radio-group>
                              <p style="color: red">正确答案 {{item.answer}}</p>
                            </div>

                          </div>
                      </div>
                      <div class="list-container"  v-if="multChooseSubjectList.length>0" >
                          <span>多选题</span>
                          <div class="sub-single-list">
                            <div class="sub-item" v-for="(item,index) in multChooseSubjectList" :key='index'>
                                <p class="fs-5 fw-bold"  style="display:flex;"   v-html="`${index+1}. `+item.queContent"></p>
                                 <el-checkbox-group size="medium" style="margin-left:10px" v-model="item.userAnswer">
                                     <el-checkbox disabled :label="i.optionName" v-for="(i,idx) in item.options" :key="idx">{{`${i.optionName}  ${i.optionContent}` }}</el-checkbox>
                                  </el-checkbox-group>
                              <p style="color: red">正确答案 {{item.answer}}</p>
                            </div>

                          </div>
                      </div>
                      <div class="list-container" v-if="judgeSubjectList.length>0">
                             <span>判断题</span>
                             <div class="sub-single-list">
                            <div class="sub-item" v-for="(item,index) in judgeSubjectList" :key='index'>
                                <p class="fs-5 fw-bold" style="display:flex;"   v-html="`${index+1}. `+item.queContent"></p>
                                   <el-radio-group v-model="item.userAnswer">
                                        <el-radio disabled :label="i.optionName" v-for="(i,dx) in item.options" :key="dx" >{{`${i.optionName} ${i.optionContent}`}}</el-radio>

                                    </el-radio-group>
                              <p style="color: red">正确答案 {{item.answer}}</p>
                            </div>

                          </div>
                      </div>


                  </div>
              </el-col>
          </el-row>

      </div>
    </section>
  </div>
</template>
<script>
import {Navbar} from '@/layout/components'
import { sendPostByKeyValue } from '@/utils/httpUtils'
export default{
    components:{
        Navbar
    },
     computed: {
        fixedHeader() {
                return this.$store.state.settings.fixedHeader
            },
    },
    data(){
        return{
            gradeRecordId:undefined,
            errorSubjectInfo:{},

            singleChooseSubjectList:[],
            multChooseSubjectList:[],
            judgeSubjectList:[],
            loading:undefined,
        }
    },
    created(){
         this.gradeRecordId = this.$route.query.gradeRecordId
         if(!this.gradeRecordId){
             window.history.back(-1);
         }
           this.loading = this.$loading({
            lock: true,
            text: 'Loading',
            // spinner: 'el-icon-loading',
            background: 'rgba(255, 255, 255, 0.8)'
            });

        this.getErrorCollectionList()

    },

    mounted(){
    },
    methods:{

        async getErrorCollectionList(){
            try {

                const url="/AppExamPaper/wrongTopic"
                const res=await sendPostByKeyValue(url,{gradeRecordId:this.gradeRecordId})
                if(res?.code==200){
                    this.loading.close()
                    this.errorSubjectInfo=res.data
                    if(this.errorSubjectInfo.examQuestionsExtendList&&this.errorSubjectInfo.examQuestionsExtendList.length>0){
                        this.singleChooseSubjectList=this.errorSubjectInfo.examQuestionsExtendList.filter(v=>v.queType==0)

                        this.multChooseSubjectList=this.errorSubjectInfo.examQuestionsExtendList.filter(v=>v.queType==1)

                         this.multChooseSubjectList.forEach(v=>{

                            if(v.userAnswer&&typeof(v.userAnswer)=='string'){
                                v.userAnswer=v.userAnswer.split('')
                            }else{
                                v.userAnswer=[]
                            }
                        })

                        this.judgeSubjectList=this.errorSubjectInfo.examQuestionsExtendList.filter(v=>v.queType==2)

                    }
                }
            } catch (error) {
                this.loading.close()
            }
        }
    },
}

</script>
<style >
   .list-container p, p.MsoNormal{
        padding: 0;
        margin-bottom:0.25rem;
    }
</style>
<style scoped  lang="scss" >
$bg:#fff;
$fs:16px;
$fs2:28px;
$color:#1F67B3;
$color2:#282828;
$color3:#9FA19F;
$mg:40px;
$mb:5px;
$pb:15px;
$padding20:20px;
.return-container{
   .sp{
       font-size: $fs;
       color: $color;
   }
   .sp_test_name{
        font-size: $fs;
        color: $color2;
   }
}
.exam-container{
    padding: $mg 0;
    .exam-result{
        font-size: $fs2;
        color: $color2;
        font-weight: 500;
        margin-bottom: $mb;
    }
    .exam-tag{
        color: $color3;
        font-size: $fs;
        span:last-child{


                padding-left: $pb;

        }
    }
}
.title{
    font-size: $fs;
    color: $color2;
    padding-bottom: $pb;
}
.err-subject-container{
    width: 100%;
    height: 100%;
    border-radius: $mb;
    background-color: $bg;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding:$padding20;
}
.list-container{
    border-bottom: 1px solid #ccc;
    margin-bottom: $pb;
    span{
        font-size: 14px;
        font-weight: 500;
        color: #9FA19F;
    }
    .sub-single-list{
        margin: $pb 0;
        padding-left: $pb;
        .sub-item{
            padding-bottom: $pb;
        }
    }
}
</style>
