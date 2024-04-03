<template>
  <div class="app-container">
    
    <el-form size="mini" inline >
      <el-row>
        <el-form-item>
            <PermissionButton size="mini" icon="el-icon-delete" label="批量删除" perms="1003" type="danger" @click="deletes" />
          </el-form-item>
          <el-form-item>
                <el-select v-model="serverQuerey.country" @keyup.enter.native="search" clearable filterable placeholder="请选择国家">
                    <el-option v-for="item in optionsCountry" :key="item.label" :label="item.label" :value="item.label">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-select v-model="serverQuerey.projectPowerId" @keyup.enter.native="search" clearable filterable placeholder="请选择项目">
                    <el-option v-for="item in optionsProjectPower" :key="item.projectPowerId" :label="item.name" :value="item.projectPowerId">
                    </el-option>
                </el-select>
            </el-form-item>

        <el-form-item>
        <el-cascader
        v-model="serverQuerey.professionEcho"
        filterable
         clearable
        @keyup.enter.native="search"
        placeholder="请选择专业"
        :options="optionsProfession"
        :props="{ expandTrigger: 'hover' }"
        >
        </el-cascader>
    </el-form-item>

    <el-form-item>
        <el-select v-model="serverQuerey.code" @keyup.enter.native="search" clearable filterable placeholder="请选择难度等级">
            <el-option v-for="item in optionsCode" :key="item.code" :label="item.name" :value="item.code">
            </el-option>
        </el-select>
</el-form-item>

    <el-form-item >
            <el-input type="text" placeholder="考试名称" clearable v-model="serverQuerey.examName" class="wd16"></el-input>
        </el-form-item>

        <el-form-item >
            <el-button type="warning" class="el-icon-search" @click="search" >查询</el-button>
        </el-form-item>
          
      </el-row>
    </el-form>
    <div>
      <el-table
        id="tableList"
        v-loading="listLoading"
        :height="tableHeight"
        :data="listData"
        border
        fit
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" align="center" width="55"></el-table-column>
        <el-table-column align="center" prop="name" label="姓名"></el-table-column>
        <el-table-column align="center" prop="examName" label="考试名称"></el-table-column>
        <el-table-column align="center" prop="score" label="考试成绩"></el-table-column>
        <!-- <el-table-column align="center" prop="configName" label="难度等级"></el-table-column> -->
        <!-- <el-table-column align="center" prop="trainingName" label="课程名称"></el-table-column> -->
        <el-table-column align="center" prop="professionName" label="专业"></el-table-column>
        <el-table-column align="center" prop="workCodeName" label="作业层等级"></el-table-column>
        <el-table-column align="center" prop="projectName" label="参与项目"></el-table-column>
        <el-table-column align="center" prop="submitDate" label="考试时间"></el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="scope">
            <PermissionLink size="mini" label="删除" perms="1003" icon="el-icon-delete" type="danger" @click="delById(scope.row.gradeRecordId)"/>
          </template>
        </el-table-column>
      </el-table>
      <pagination style="margin-top:5px"
      :total="dataTotal"
      :auto-scroll="false"
      :pageSizes="[50, 100, 150, 200,300]"
      :page.sync="serverQuerey.page"
      :limit.sync="serverQuerey.size"
      @pagination="search"
    />
    </div>

  </div>
</template>

<script>
import { sendGet, sendPostByKeyValue, sendPostByJson } from "@/utils/httpUtils";
import default_image from "@/assets/layout-img/no_image.png";
import Pagination from "@/components/Pagination";
export default {
    components: {
    Pagination,
  },
  data() {
    let isMobileNumber = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入电话号码"));
      } else {
        const reg = /^1[3|4|5|7|8|9][0-9]\d{8}$/;
        const isPhone = reg.test(value);
        value = Number(value); //转换为数字
        if (typeof value === "number" && !isNaN(value)) {
          //判断是否为数字
          value = value.toString(); //转换成字符串
          if (value.length < 0 || value.length > 12 || !isPhone) {
            //判断是否为11位手机号
            callback(new Error("请输入正确的手机号码"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入电话号码"));
        }
      }
    };
    return {

      defaultImage:default_image,
      tableHeight:window.innerHeight-175+"px",
      serverQuerey: {
        name:'',
        keyword:'',
        total: 0,
        page: 1,
        size: 100,
      },
      dataTotal: 0,

      optionsProfession:[
        
    ],

    optionsCode:[
        
        ],
    optionsProjectPower:[],
    optionsCountry:[
        {value:'China',label:'中国'},
        {value:'United States of America',label:'美国'},
        {value:'Germany',label:'德国'},
        {value:'Japan',label:'日本'},
        {value:'Korea',label:'韩国'},
        {value:'Belarus',label:'白俄罗斯'},
        {value:'India',label:'印度'},
        {value:'Indonesia',label:'印度尼西亚'},
        {value:'Angola',label:'安哥拉'},
        {value:'Afghanistan',label:'阿富汗'},
        {value:'Albania',label:'阿尔巴尼亚'},
        {value:'Algeria',label:'阿尔及利亚'},
        {value:'Andorra',label:'安道尔共和国'},
        {value:'Anguilla',label:'安圭拉岛'},
        {value:'Antigua and Barbuda',label:'安提瓜和巴布达'},
        {value:'Argentina',label:'阿根廷'},
        {value:'Armenia',label:'亚美尼亚'},
        {value:'Ascension',label:'阿森松'},
        {value:'Australia',label:'澳大利亚'},
        {value:'Austria',label:'奥地利'},
        {value:'Azerbaijan',label:'阿塞拜疆'},
        {value:'Bahamas',label:'巴哈马'},
        {value:'Bahrain',label:'巴林'},
        {value:'Bangladesh',label:'孟加拉国'},
        {value:'Barbados',label:'巴巴多斯'},
        {value:'Belgium',label:'比利时'},
        {value:'Belize',label:'伯利兹'},
        {value:'Benin',label:'贝宁'},
        {value:'Bermuda Is',label:'百慕大群岛'},
        {value:'Bolivia',label:'玻利维亚'},
        {value:'Botswana',label:'博茨瓦纳'},
        {value:'Brazil',label:'巴西'},
        {value:'Brunei',label:'文莱'},
        {value:'Bulgaria',label:'保加利亚'},
        {value:'Burkina Faso',label:'布基纳法索'},
        {value:'Burma',label:'缅甸'},
        {value:'Burundi',label:'布隆迪'},
        {value:'Cameroon',label:'喀麦隆'},
        {value:'Canada',label:'加拿大'},
        {value:'Cayman Is',label:'开曼群岛'},
        {value:'Central African Republic',label:'中非共和国'},
        {value:'Chad',label:'乍得'},
        {value:'Chile',label:'智利'},
        {value:'Colombia',label:'哥伦比亚'},
        {value:'Congo',label:'刚果'},
        {value:'Cook Is',label:'库克群岛'},
        {value:'Costa Rica',label:'哥斯达黎加'},
        {value:'Cuba',label:'古巴'},
        {value:'Cyprus',label:'塞浦路斯'},
        {value:'Czech Republic',label:'捷克'},
        {value:'Denmark',label:'丹麦'},
        {value:'Djibouti',label:'吉布提'},
        {value:'Dominica Rep',label:'多米尼加共和国'},
        {value:'Ecuador',label:'厄瓜多尔'},
        {value:'Egypt',label:'埃及'},
        {value:'EI Salvador',label:'萨尔瓦多'},
        {value:'Estonia',label:'爱沙尼亚'},
        {value:'Ethiopia',label:'埃塞俄比亚'},
        {value:'Fiji',label:'斐济'},
        {value:'Finland',label:'芬兰'},
        {value:'France',label:'法国'},
        {value:'French Guiana',label:'法属圭亚那'},
        {value:'French Polynesia',label:'法属玻利尼西亚'},
        {value:'Gabon',label:'加蓬'},
        {value:'Gambia',label:'冈比亚'},
        {value:'Georgia',label:'格鲁吉亚'},
        {value:'Ghana',label:'加纳'},
        {value:'Gibraltar',label:'直布罗陀'},
        {value:'Greece',label:'希腊'},
        {value:'Grenada',label:'格林纳达'},
        {value:'Guam',label:'关岛'},
        {value:'Guatemala',label:'危地马拉'},
        {value:'Guinea',label:'几内亚'},
        {value:'Guyana',label:'圭亚那'},
        {value:'Haiti',label:'海地'},
        {value:'Honduras',label:'洪都拉斯'},
        {value:'Hungary',label:'匈牙利'},
        {value:'Iceland',label:'冰岛'},
        {value:'Iran',label:'伊朗'},
        {value:'Iraq',label:'伊拉克'},
        {value:'Ireland',label:'爱尔兰'},
        {value:'Israel',label:'以色列'},
        {value:'Italy',label:'意大利'},
        {value:'Ivory Coast',label:'科特迪瓦'},
        {value:'Jamaica',label:'牙买加'},
        {value:'Jordan',label:'约旦'},
        {value:'Kampuchea (Cambodia )',label:'柬埔寨'},
        {value:'Kazakstan',label:'哈萨克斯坦'},
        {value:'Kenya',label:'肯尼亚'},
        {value:'Kuwait',label:'科威特'},
        {value:'Kyrgyzstan',label:'吉尔吉斯坦'},
        {value:'Laos',label:'老挝'},
        {value:'Latvia',label:'拉脱维亚'},
        {value:'Lebanon',label:'黎巴嫩'},
        {value:'Lesotho',label:'莱索托'},
        {value:'Liberia',label:'利比里亚'},
        {value:'Libya',label:'利比亚'},
        {value:'Liechtenstein',label:'列支敦士登'},
        {value:'Lithuania',label:'立陶宛'},
        {value:'Luxembourg',label:'卢森堡'},
        {value:'Madagascar',label:'马达加斯加'},
        {value:'Malawi',label:'马拉维'},
        {value:'Malaysia',label:'马来西亚'},
        {value:'Maldives',label:'马尔代夫'},
        {value:'Mali',label:'马里'},
        {value:'Malta',label:'马耳他'},
        {value:'Mariana Is',label:'马里亚那群岛'},
        {value:'Martinique',label:'马提尼克'},
        {value:'Mauritius',label:'毛里求斯'},
        {value:'Mexico',label:'墨西哥'},
        {value:'Moldova',label:'摩尔多瓦'},
        {value:'Monaco',label:'摩纳哥'},
        {value:'Mongolia',label:'蒙古'},
        {value:'Montserrat Is',label:'蒙特塞拉特岛'},
        {value:'Morocco',label:'摩洛哥'},
        {value:'Mozambique',label:'莫桑比克'},
        {value:'Namibia',label:'纳米比亚'},
        {value:'Nauru',label:'瑙鲁'},
        {value:'Nepal',label:'尼泊尔'},
        {value:'Netheriands Antilles',label:'荷属安的列斯'},
        {value:'Netherlands',label:'荷兰'},
        {value:'New Zealand',label:'新西兰'},
        {value:'Nicaragua',label:'尼加拉瓜'},
        {value:'Niger',label:'尼日尔'},
        {value:'Nigeria',label:'尼日利亚'},
        {value:'North Korea',label:'朝鲜'},
        {value:'Norway',label:'挪威'},
        {value:'Oman',label:'阿曼'},
        {value:'Pakistan',label:'巴基斯坦'},
        {value:'Panama',label:'巴拿马'},
        {value:'Papua New Cuinea',label:'巴布亚新几内亚'},
        {value:'Paraguay',label:'巴拉圭'},
        {value:'Peru',label:'秘鲁'},
        {value:'Philippines',label:'菲律宾'},
        {value:'Poland',label:'波兰'},
        {value:'Portugal',label:'葡萄牙'},
        {value:'Puerto Rico',label:'波多黎各'},
        {value:'Qatar',label:'卡塔尔'},
        {value:'Reunion',label:'留尼旺'},
        {value:'Romania',label:'罗马尼亚'},
        {value:'Russia',label:'俄罗斯'},
        {value:'Saint Lueia',label:'圣卢西亚'},
        {value:'Saint Vincent',label:'圣文森特岛'},
        {value:'Samoa Eastern',label:'东萨摩亚(美)'},
        {value:'Samoa Western',label:'西萨摩亚'},
        {value:'San Marino',label:'圣马力诺'},
        {value:'Sao Tome and Principe',label:'圣多美和普林西比'},
        {value:'Saudi Arabia',label:'沙特阿拉伯'},
        {value:'Senegal',label:'塞内加尔'},
        {value:'Seychelles',label:'塞舌尔'},
        {value:'Sierra Leone',label:'塞拉利昂'},
        {value:'Singapore',label:'新加坡'},
        {value:'Slovakia',label:'斯洛伐克'},
        {value:'Slovenia',label:'斯洛文尼亚'},
        {value:'Solomon Is',label:'所罗门群岛'},
        {value:'Somali',label:'索马里'},
        {value:'South Africa',label:'南非'},
        {value:'Spain',label:'西班牙'},
        {value:'SriLanka',label:'斯里兰卡'},
        {value:'St.Vincent',label:'圣文森特'},
        {value:'Sudan',label:'苏丹'},
        {value:'Suriname',label:'苏里南'},
        {value:'Swaziland',label:'斯威士兰'},
        {value:'Sweden',label:'瑞典'},
        {value:'Switzerland',label:'瑞士'},
        {value:'Syria',label:'叙利亚'},
        {value:'Tajikstan',label:'塔吉克斯坦'},
        {value:'Tanzania',label:'坦桑尼亚'},
        {value:'Thailand',label:'泰国'},
        {value:'Togo',label:'多哥'},
        {value:'Tonga',label:'汤加'},
        {value:'Trinidad and Tobago',label:'特立尼达和多巴哥'},
        {value:'Tunisia',label:'突尼斯'},
        {value:'Turkey',label:'土耳其'},
        {value:'Turkmenistan',label:'土库曼斯坦'},
        {value:'Uganda',label:'乌干达'},
        {value:'Ukraine',label:'乌克兰'},
        {value:'United Arab Emirates',label:'阿拉伯联合酋长国'},
        {value:'United Kiongdom',label:'英国'},
        {value:'Uruguay',label:'乌拉圭'},
        {value:'Uzbekistan',label:'乌兹别克斯坦'},
        {value:'Venezuela',label:'委内瑞拉'},
        {value:'Vietnam',label:'越南'},
        {value:'Yemen',label:'也门'},
        {value:'Yugoslavia',label:'南斯拉夫'},
        {value:'Zimbabwe',label:'津巴布韦'},
        {value:'Zaire',label:'扎伊尔'},
        {value:'Zambia',label:'赞比亚'}
    ],

    
      dialogBaseFlag: false,
      listLoading: false,
      submitButtonFlag: false,
      baseImgURL: "",
      baseImgURLCOS: "",
      headers: {},
      listData: [],
      checkedRoleIds: [],
      multipleSelection: [],


      ruleForm: {
       name:'',
       idCard:'',
       professionEcho:[],
       photo:null
      },
      rules: {
        examName:[{required: true, message: '不能为空!', trigger: 'change' }],
      },
    };
  },



  mounted: async function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    this.search();
    this.selectAllProjectPower();
    this.professionSearch();
    this.optionsCodeSearch();
  },
  methods: {

      //项目  optionsProjectPower
      async selectAllProjectPower() {
      const url = "/ProjectPower/selectAllProjectPower";
      const response = await sendPostByKeyValue(url,null)
      if (response) {
        this.optionsProjectPower = response.data;
      }
    },
    

     

    //专业
      async professionSearch() {
      const url = "/Profession/getCascadeParam";
      const response = await sendPostByJson(url,null);
      if (response) {
        this.optionsProfession = response.data;
      }
    },

    //难度等级
      async optionsCodeSearch() {
          let serverQuerey ={
                type:3,
                page: 1,
                size: 100,
            }
      const url = "/BasicConfig/findAllList";
      const response = await sendPostByJson(url,serverQuerey);
      if (response) {
        this.optionsCode = response.data.list;
      }
    },


    delById(id) {
      this.$confirm("确定要删除该记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            const url = "/GradeRecord/delete";
            const res = await sendPostByKeyValue(url, { id: id });
            if (res) {
                this.search();
                  this.$message({
                    type: "success",
                    message: "删除成功",
                  });
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

     deletes() {
      if (this.multipleSelection.length == 0) {
        this.$message({
          type: "error",
          message: "请先选择记录",
        });
        return;
      }
      this.$confirm("确定批量删除选中记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            let ids = [];
            for (let i = 0; i < this.multipleSelection.length; i++) {
              ids.push(this.multipleSelection[i].gradeRecordId);
            }
            // 删除操作
            const url = "/GradeRecord/deletes";
            const res = await sendPostByKeyValue(url, { ids: ids.join(",") });
            if (res) {
                this.search();
                  this.$message({
                    type: "success",
                    message: "删除成功",
                  });
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

    
   

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
   

    async search() {
        if(this.serverQuerey.professionEcho && this.serverQuerey.professionEcho instanceof Array){
          this.serverQuerey.professionEcho = this.serverQuerey.professionEcho.join(",");
      }
      this.listLoading = true;
      const url = "/GradeRecord/findAllList";
      const response = await sendPostByKeyValue(url, this.serverQuerey);
      if (response) {
        this.listData = response.data.list;
        this.dataTotal = response.data.total;
        this.listLoading = false;
      }
    },

  },
};
</script>
<style scoped>

.divider p {
    border-bottom: 1px dotted;
  }
  .divider span {
    font-size: 16px;
    font-weight: 700;
  }

  /* ::v-deep .el-dialog__body {
    height: 560px;
    overflow-y: auto;
    overflow-x: hidden;
  } */
</style>
