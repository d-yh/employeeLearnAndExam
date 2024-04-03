<template>
  <div class="bg_gray w-100 h-100">
    <div class="d-flex p-4 h-100">

      <div class="col me-3 overflow-hidden">
        <el-tabs v-model="activeName" @tab-click="handleClick">

          <el-tab-pane label="员工" name="workers" class="h-100">
            <div class="card border-0 h-100">

              <!--下拉选择框-->

              <el-row type="flex" class="p-3 form-group border-bottom border-light" align="middle">
                <el-select v-model="serverQuerey.workType" clearable style="width: 200px;" class="me-3 rounded-3" placeholder="选择类型">
                  <el-option
                    v-for="item in workTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-select v-model="serverQuerey.projectPowerId" clearable style="width: 200px;" class="me-3 rounded-3" placeholder="选择项目">
                  <el-option
                    v-for="item in projectPowerOptions"
                    :key="item.projectPowerId"
                    :label="item.name"
                    :value="item.projectPowerId">
                  </el-option>
                </el-select>
                <el-cascader
                  style="width: 200px;"
                  class="me-3 rounded-3"
                  v-model="serverQuerey.professionEchoConfirm"
                  filterable
                  clearable
                  @keyup.enter.native="search"
                  placeholder="选择专业"
                  :options="optionsProfession"
                  :props="{ expandTrigger: 'hover' }"
                  >
                </el-cascader>
              </el-row>

              <!-- 员工列表 -->
             <el-scrollbar class="col w-100 column">
              <el-table v-loading="loading" :data="tableData" class="w-100 h-100 manpower_table" @row-click="clickRows">
                <el-table-column align="center" label="照片 " width="100">
                  <template  scope="{row}">
                      <el-image
                        v-if="row.photo"
                        :src="row.photo"
                        fit="cover"
                      ></el-image>
                      <el-tag class="user_no_photo" v-if="!row.photo" type="info" size="mini">暂无</el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="left" prop="nickname" label="姓名" width="100"></el-table-column>
                <el-table-column align="center" label="类型" width="110">
                  <template scope="{row}">
                        <el-tag v-if="row.workType == null || row.workType == 0" type="success" size="small">正式员工</el-tag>
                        <el-tag v-if="row.workType == 1" type="primary" size="small"> 外包员工</el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="left" prop="workCodeName" label="作业层等级" width="150"></el-table-column>
                <el-table-column align="left" prop="projectName" label="项目" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column align="left" prop="professionName" label="专业" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column align="left"  width="150" v-if="permissions.includes('2022')">
                  <template scope="{row}">

                    <el-button
                      v-if="user.userId!==row.userId"
                      @click.native.prevent="deleteRow(row.userId,1)" round class="btn text_gray"
                      size="medium">
                      加入黑名单
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-scrollbar>

              <!--分页-->
              <el-pagination
                class="p-3"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="serverQuerey.page"
                :page-sizes="[20,40, 60, 80, 100]"
                :page-size.sync="serverQuerey.size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="serverQuerey.total"
              ></el-pagination>

            </div>
          </el-tab-pane>

          <el-tab-pane v-if="permissions.includes('2021')" label="黑名单" name="blacklist" class="h-100">
            <div class="card border-0 h-100">

              <!--下拉选择框-->

              <el-row type="flex" class="p-3 form-group border-bottom border-light">
                <el-select v-model="serverQuerey.workType" clearable style="width: 200px;" class="me-3 rounded-3" placeholder="选择类型">
                  <el-option
                    v-for="item in workTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-select v-model="serverQuerey.projectPowerId" clearable style="width: 200px;" class="me-3 rounded-3" placeholder="选择项目">
                  <el-option
                    v-for="item in projectPowerOptions"
                    :key="item.projectPowerId"
                    :label="item.name"
                    :value="item.projectPowerId">
                  </el-option>
                </el-select>
                <el-cascader
                  style="width: 200px;"
                  class="me-3 rounded-3"
                  v-model="serverQuerey.professionEchoConfirm"
                  filterable
                  clearable
                  @keyup.enter.native="search"
                  placeholder="选择专业"
                  :options="optionsProfession"
                  :props="{ expandTrigger: 'hover' }"
                  >
                </el-cascader>
              </el-row>

              <!-- 黑名单列表 -->
              <el-scrollbar class="col w-100 column">
              <el-table :height="tableHeight" v-loading="loading" :data="tableData" class="w-100 border-top border-light manpower_table" @row-click="clickRows">
                <el-table-column align="center" prop="photo" label="照片" width="100">
                  <template scope="{row}">
                    <div class="demo-image__preview">
                      <el-image
                        v-if="row.photo"
                        :src="row.photo"
                        :preview-src-list="[row.photo]"
                      ></el-image>
                      <el-tag v-if="!row.photo" size="mini" class="user_no_photo" type="info">暂无</el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="left" prop="nickname" label="姓名" width="100"></el-table-column>
                <el-table-column align="left" prop="workCodeName" label="作业层等级"></el-table-column>
                <el-table-column align="left" prop="projectName" label="项目"></el-table-column>
                <el-table-column align="left" prop="professionName" label="专业"></el-table-column>
                <el-table-column align="left" prop="control" label="" width="150  " v-if="permissions.includes('2023')">
                  <template scope="{row}">
                    <el-button
                      @click.native.prevent="deleteRow(row.userId,0)" round class="btn text_gray"
                      size="medium">
                      移除黑名单
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-scrollbar>

              <!--分页-->
              <el-pagination
                class="p-3"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="serverQuerey.page"
                :page-sizes="[20,40, 60, 80, 100]"
                :page-size.sync="serverQuerey.size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="serverQuerey.total"
              ></el-pagination>


            </div>

          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="d-flex flex-column" style="width:360px">
        <div class="position-relative ">
          <!-- 搜索框 -->
          <el-input
            placeholder="搜索员工"
            class="input_outsid_card rounded-3"
            prefix-icon="ri-search-line"
            v-model="serverQuerey.nickname">
          </el-input>
        </div>

        <div v-show="permissions.includes('2020')" class="col card mt-3 p-3 border-white overflow-hidden">
          <div class="fw-bold">外包员工数据</div>
          <div style="    height: 50%;">
            <!-- 图表 -->
            <div id="pieOne" :style="{ height: '100%',}"></div>

          </div>
          <div style="    height: 50%;">
            <!-- 图表 -->
            <div id="pieTwo" :style="{ height: '100%',}"></div>

          </div>
        </div>

      </div>

    </div>


    <!-- 员工信息弹窗 -->
    <el-dialog
      :visible.sync="employeeVisible"
      width="600px"
      top="0"
      :append-to-body="true"
      :close-on-click-modal="true"
      custom-class="rounded-4 py-1"
    >
    <el-scrollbar class="column rounded-4">
      <div class="p-4">

        <el-row type="flex" align="middle" class="bg-light rounded-4 py-2"  v-if="employeeInfo&&employeeInfo.blacklist===1">
          <div class="mx-4">已将该人员加入黑名单</div>
          <el-button size="medium" class="fs-6 btn rounded-4 ms-auto me-3" @click="removeBlackList">移出黑名单</el-button>
        </el-row>
        <el-row  :gutter="30" class="px-4 mt-4">
          <el-col :span="7">
            <el-image fit="cover" class="ratio rounded-4" style="--bs-aspect-ratio:120%"
            :src="employeeInfo&&employeeInfo.photo?employeeInfo.photo:''"></el-image>

          </el-col>
          <el-col :span="17">

          <div >
            <div class="dfl_x">

              <h3 class="fw-bold">{{employeeInfo&&employeeInfo.nickname}}</h3>
              <span class="btn_add" v-if="employeeInfo&&employeeInfo.blacklist===0&&employeeInfo.userId !==user.userId" @click="add2BlackList">加入黑名单</span>
            </div>
            <div style="padding:5px 0">类型：<span>{{employeeInfo&&employeeInfo.workType==1?"外包员工":"正式员工"}}</span>
            <span style="margin-left:40px;">工号：</span><span>{{employeeInfo&&employeeInfo.workNumber}}</span></div>
            <div class="pd_tb_10">参与项目：<span>{{employeeInfo&&employeeInfo.projectName}}</span></div>
            <div>
              <div class="text_lightgray">{{employeeInfo&&employeeInfo.projectRoleName}}</div>
            </div>
          </div>
          </el-col>
        </el-row>
        <div class="row px-4 gx-1">
          <el-divider class="bg_gray col-12 my-4"></el-divider>
          <!-- 基本信息 -->
          <div  class="fw-bold  col-12 pd_tb_10">基本信息</div>
          <div class="text_gray col-4  pd_tb_10">手机号</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.mobile}}</div>
          <div class="text_gray col-4  pd_tb_10">性别</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.gender===0?"男":"女"}}</div>
          <div class="text_gray col-4  pd_tb_10">身份证号</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.idCard}}</div>
          <div class="text_gray col-4  pd_tb_10">名族</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.national}}</div>
          <div class="text_gray col-4  pd_tb_10">出生日期</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.birthDate?employeeInfo.birthDate.split(" ")[0]:""}}</div>
          <div class="text_gray col-4  pd_tb_10">籍贯</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.nativePlace}}</div>
          <div class="text_gray col-4  pd_tb_10">户口所在地</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.residenceTwo}}</div>
          <div class="text_gray col-4  pd_tb_10">家庭住址</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.residence}}</div>

          <el-divider class="bg_gray col-12 my-4"></el-divider>
          <!-- 岗位信息 -->
          <div  class="fw-bold  col-12 pd_tb_10">岗位信息</div>
          <div class="text_gray col-4  pd_tb_10">专业</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.professionName}}</div>
          <div class="text_gray col-4  pd_tb_10">作业层等级</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{ employeeInfo&&employeeInfo.workCodeName}}</div>
          <div class="text_gray col-4  pd_tb_10">学历层等级</div>
          <div  class="fw-bold  col-8 pd_tb_10">{{employeeInfo&&employeeInfo.degreeCodeName}}</div>
          <div class="text_gray col-4  pd_tb_10">职称图片</div>
          <div  class="fw-bold  col-8 pd_tb_10" style="display:flex;just-content:flex-start;flex-wrap:wrap">
            <div style="width:200px;height:120px;padding:10px 10px 10px 0;flex-shrink:0;" v-for="(item,i) in employeeInfo.titlePictures " :key="i">
                <el-image style="width:100%;height:100%;object-fit:cover;border-radius:2px;"
                :src="item"  :preview-src-list="employeeInfo.titlePictures"></el-image>
            </div>
          </div>
          </div>
      </div>
    </el-scrollbar>
    </el-dialog>
  </div>
</template>



<script>

import { sendGet, sendPostByKeyValue, sendPostByJson ,sendPost} from "@/utils/httpUtils";

export default {

  data() {

    //页面数据容器
    return {
      activeName: 'workers',//点击事件
    employeeVisible:false,
      tableHeight: window.innerHeight - 340 +"px",
      loading:false,
      //查询+分页
      serverQuerey: {
        blacklist : 0,
        total: 0,
        page: 1,
        size: 20,
        professionEcho:'',
        professionEchoConfirm:""
      },

      employeeData:[],
      tableData:[], //员工及黑名单查询结果集合

      //类别查询
      workTypeOptions: [
        //{ value: null, label: '全部类型'},
        { value: 0, label: '正式员工' },
        { value: 1, label: '外包员工' },
      ],
      //项目查询
      projectPowerOptions: [],
      //专业查询

      optionsProfession:[],
      value: '',
      employeeInfo:{},
      user:undefined,
      permissions:[]
    };
  },
  //初始化页面
  mounted(){
    this.getPermission()
    this.search();
    this.info();//获取信息

    this.user = this.$store.state.user.userInfo

  },
  //监听
  watch: {
    //监听当前点击事件
    "activeName"(newV,oldV){
      console.log("监听点击事件: 点击按钮" + newV )
    },
    //监听选择类型
    "serverQuerey.workType"(newV,oldV){
      console.log("监听选择类型: " + newV )
      this.search()
    },
    //监听选择项目
    "serverQuerey.projectPowerId"(newV,oldV){
      console.log("监听选择项目: " + newV )
      this.search()
    },
    //监听选择专业
    "serverQuerey.professionEchoConfirm"(newV,oldV){
      console.log("监听选择专业: " + newV )
      this.search()
    },
    //监听搜索姓名
    "serverQuerey.nickname"(newV,oldV){
      console.log("监听搜索姓名: " + newV )
      this.search()
    },

  },
  computed:{

  },
  //方法
  methods: {
    async getPermission(){
      const url = "/AppUser/myAppPermission"
      const result = await sendPost(url)
      if(result?.code === 200){
        this.permissions = result.data.map(permission=>permission.permissionCode)
        this.findPie();
      }
    },
    async  deleteRow(id, type) {
          let url=""
          switch(type){
            //remove

            case 0:
              url="/AppUser/removeBlacklist"
              break;
            case 1:
              url="/AppUser/addBlacklist"
              // add
              break;
            default:
              break;
          }
         try {
           const res= await sendPostByKeyValue(url,{userId:id})
           if(res&&res.code==200){
             this.search()
             this.$message({type:"success",message:type===0?'移除黑名单成功!':"添加至黑名单成功!"})
           }

         } catch (error) {
            this.$message({type:"error",message:error.message})
         }
      },

    //查询饼图
    findPie(){
      this.findPieOne()
      this.findPieTwo()
    },

    // 作业层等级
    async findPieOne() {
      const url = '/AppUser/getUserStatistical?type=0'  //0-学历层等级 1-作业层等级
      const res = await sendPost(url)
      if (res) {
        if (res.code === 200){
          res.data = res.data.filter(item=>item.count>0)
          this.dataToPie(res.data,'pieOne','学历层等级')
        }
      }
    },

    // 作业层等级
    async findPieTwo() {
      const url = '/AppUser/getUserStatistical?type=1'  //0-学历层等级 1-作业层等级
      const res = await sendPost(url)
      if (res) {
        if (res.code === 200){
          res.data = res.data.filter(item=>item.count>0)

          this.dataToPie(res.data,'pieTwo','作业层等级')
        }
      }
    },

    //数据转饼图  data 传输数据  type 展示图片位置 title 展示标题
    dataToPie(data,type,title){
      //处理数据
      if(!data || !type) return;
      var dataNew =[]
      data.forEach(item => {
        dataNew.push({value: item.count, name: item.label })
      });
      //初始化容器
      var echarts = require('echarts');
      var myChart = echarts.init(document.getElementById(type));
      var option;

      option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: title,
            type: 'pie',
            radius: '50%',
            data: dataNew,
            label: {
              position: 'outer',
              alignTo: 'none',
              bleedMargin: 1
            },

            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      option && myChart.setOption(option);
    },

    //获取信息
    info(){

      this.selectAllProjectPower()//查询项目
      this.getCascadeParam()//拆线呢专业级联
    },
    //获取项目选择
    async selectAllProjectPower() {
      const url = "/AppUser/selectAllProjectPower";
      const response =await sendPostByKeyValue(url,null)
      if (response) {
        console.log(this.projectPowerOptions)
        this.projectPowerOptions = response.data;
      }
    },
    //获取专业级联
    async getCascadeParam() {
      const url = "/AppUser/getCascadeParam";
      const response =await sendPostByKeyValue(url,null)
      if (response) {
        this.optionsProfession = response.data;
      }
    },

    //分页查询（显示条数）
    handleSizeChange(val) {
      //查询
      this.serverQuerey.size = val;
      this.search();
    },

    //分页查询（上一页下一页）
    handleCurrentChange(val) {
      //查询
      this.serverQuerey.page = val;
      this.search();
    },

    //点击事件
    handleClick(tab, event) {
      console.log("handleClick" + tab, event);

      //获取点击事件的类别
      if(tab.name == 'blacklist'){
        	// 触发‘黑名单’事件
        	this.blacklist();
        }else{
        	// 触发‘员工’事件
        	this.workers();
        }

    },

    //查询黑名单
    blacklist(){
      console.log("抵达:查询黑名单")
      this.resetParam(1) //是否黑名单 0-否 1-是
      this.search()
    },

    //查询员工
    workers(){
      this.tableData=[]
      console.log("抵达:查询员工")
      this.resetParam(0) //是否黑名单 0-否 1-是
      this.search()
    },

    //重置点击事件时，查询参数重置
    resetParam(blacklist){
      this.tableData=[]
      this.serverQuerey = {
        total: 0,
        page: 1,
        size: 20,
        blacklist:blacklist,
        professionEcho:"",
        professionEchoConfirm:""

      }
    //  this.serverQuerey.blacklist = blacklist //是否黑名单 0-否 1-是
    },

    //查询员工/黑名单列表
    async search() {
      const url = "/AppUser/findByParam";

      //专业级联查询完善
      if(this.serverQuerey.professionEchoConfirm){


        this.serverQuerey.professionEcho = this.serverQuerey.professionEchoConfirm.join(",");
      }
      this.loading=true
      const response = await sendPostByKeyValue(url,this.serverQuerey)
      if (response) {
        this.tableData = response.data.list


        this.serverQuerey.total = response.data.total;
        this.loading=false
      }
    },
    clickRows(row, column, event){

      if(!column.label){
        return false
      }
        this.getInfoDetail(row.userId)

    },

    async getInfoDetail(id){
      const url="/AppUser/getUserInfo"
      const res= await sendPostByKeyValue(url,{userId:id})
      if(res&&res.code==200){
         res.data.titlePictures=res.data.titlePhoto?res.data.titlePhoto.split(','):[]
         this.employeeInfo=res.data
         this.employeeVisible=true
      }
    },
    removeBlackList(){
      this.deleteRow(this.employeeInfo.userId,0)
      this.$nextTick(()=>{

        this.employeeInfo.blacklist=0
        this.employeeInfo={...this.employeeInfo}

      })
    },
    add2BlackList(){
      this.deleteRow(this.employeeInfo.userId,1)
      this.$nextTick(()=>{

        this.employeeInfo.blacklist=1
        this.employeeInfo={...this.employeeInfo}

      })
    }
  }
};
</script>

<style scoped>
   .pd_tb_10{
     padding: 5px 0;
   }
   .blacklist{
     font-size: 16px;
     font-weight: 500;
     padding: 5px;
     cursor: pointer;
      background: #F8FAFC;
   }
   .dfl_x{
     display: flex;
     align-items: center;
     justify-content: space-between;
   }
   .btn_add{
     padding:2px 5px;
     cursor: pointer;
     background: #F8FAFC;

   }
   .btn_add:hover{
     background: #ECF5FF;
     color: #409EFF;
   }
   .manpower_table{
     cursor: pointer;
   }
</style>
