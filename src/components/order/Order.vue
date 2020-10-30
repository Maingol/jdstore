<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索订单的输入框 -->
      <el-row :gutter="30">
        <el-col :span="7">
          <!-- @keyup.enter.native用于监听"按下回车键"这个事件，如果用的不是element-ui，可以去掉.native限制符 -->
          <el-input @clear="getOrderList"
                    placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @keyup.enter.native="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 商品列表区域 -->
      <!-- align是表格中列的属性，该属性控制该列的内容的对齐方式，可选值：left/center/right -->
      <el-table :data="orderList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" align="center"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80" align="center"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="80" align="center">
          <!--<el-tag type="danger">标签五</el-tag>-->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status==='0'" type="danger">未付款</el-tag>
            <el-tag v-else-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80" align="center">
          <template slot-scope="scope">
            {{scope.row.is_send === '1' ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200" align="center">
          <template slot-scope="scope">
            {{scope.row.create_time | format}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="openUpdateAddrDialog(scope.row)"></el-button>
            <!-- 物流跟踪按钮 -->
            <el-button type="success" icon="el-icon-location" size="mini"
                       @click="deleteGoodById(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!-- 对话框区域 -->
      <!-- 点击编辑按钮弹出的对话框 -->
      <!-- 修改地址的对话框 -->
      <!-- 此对话框关闭后需要清空数据 -->
      <el-dialog
        title="修改地址"
        :visible.sync="updateAddrDialogVisible"
        width="80%"
        @close="closeUpdateAddrDialog">
        <div class="formBox">
          <!-- 编辑地址表单区域 -->
          <el-form
            class="updateAddr_form"
            :rules="updateAddrFormRules"
            :model="updateAddrForm"
            ref="updateAddrFormRef">
            <!-- 省市区/县 -->
            <el-form-item label="省市区/县" prop="addr1" label-width="100px">
              <el-cascader
                v-model="updateAddrForm.addr1"
                :options="regionData"
                :props="cascaderProps"
                clearable>
              </el-cascader>
            </el-form-item>
            <!-- 详细地址 -->
            <el-form-item label="详细地址" prop="addr2" label-width="100px">
              <el-input v-model="updateAddrForm.addr2"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
        <el-button @click="updateAddrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateAddrInfo">确 定</el-button>
      </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { regionData } from 'element-china-area-data'
export default {
  data () {
    return {
      // 获取商品列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取订单列表时得到的结果条数
      total: null,
      // 订单数据列表
      orderList: [],
      /* 控制修改地址的对话框关闭与否 */
      updateAddrDialogVisible: false,
      /* 修改地址对话框中表单绑定的数据 */
      updateAddrForm: {
        addr1: [],
        addr2: ''
      },
      /* 这是修改地址表单的验证规则对象 */
      updateAddrFormRules: {
        addr1: [
          { type: 'array', required: true, message: '请选择省市区/县', trigger: 'change' }
        ],
        addr2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      /* 中国省市区级联数据（不带全部选项） */
      regionData,
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 令级联选择框中的选项绑定的值是汉字
        // 这样的话this.updateAddrForm.addr1数组中的元素就都是regionData的label字段值
        // 如果写成value: 'value',那么this.updateAddrForm.addr1数组中的元素就都是regionData的value字段值
        value: 'label',
        label: 'label',
        children: 'children'
        // expandTrigger: 'hover'
      },
      /* 记录准备修改地址的订单的id */
      updateAddrId: null
    }
  },
  created () {
    this.getOrderList()
    // console.log(this.regionData)
  },
  methods: {
    // 获取订单数据列表
    async getOrderList () {
      const res = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.total = res.data.total
      this.orderList = res.data.orders
      // console.log(this.orderList)
    },
    // 每页条数发生变化时触发的函数，每页条数会传递给形参val
    handleSizeChange (val) {
      // 更新请求参数中的每页条数
      this.queryInfo.pagesize = val
      // 发送请求更新用户列表userlist
      this.getOrderList()
    },
    // 当前页发生变化时触发的函数，当前页会传递给形参val
    handleCurrentChange (val) {
      // 更新请求参数中的当前页
      this.queryInfo.pagenum = val
      // 发送请求更新订单列表orderList
      this.getOrderList()
    },
    // 点击修改地址按钮后触发的函数
    openUpdateAddrDialog (row) {
      // 打开修改地址的对话框
      this.updateAddrDialogVisible = true
      // 将待修改地址的信息默认显示在当前修改地址输入框
      this.updateAddrForm.addr1 = row.consignee_addr.split(' ')[0].split('/')
      this.updateAddrForm.addr2 = row.consignee_addr.split(' ')[1]
      // 记录待修改地址的订单id
      this.updateAddrId = row.order_id
    },
    // 修改地址对话框关闭后触发的函数
    closeUpdateAddrDialog () {
      // 清空数据
      this.updateAddrForm.addr1 = []
      this.updateAddrForm.addr2 = ''
    },
    /* 点击修改地址对话框中确认按钮后触发的函数 */
    async updateAddrInfo () {
      // 没有选择级联选择器的内容也没有改变它的内容时，强制更改其内容为空，触发校验规则
      if (this.updateAddrForm.addr1[0] === '') {
        this.updateAddrForm.addr1 = []
      }
      this.$refs.updateAddrFormRef.validate(async valid => {
        if (!valid) {
          // 预校验未能通过
          return
        }
        // 预校验通过，发起axios请求
        const res = await this.$http.put('orders/' + this.updateAddrId, {
          consignee_addr: this.updateAddrForm.addr1.join('/') + ' ' + this.updateAddrForm.addr2
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 给出成功提示
        this.$message.success(res.meta.msg)
        // 隐藏对话框
        this.updateAddrDialogVisible = false
        // 重新请求订单列表
        this.getOrderList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .formBox {
    display: flex;
    justify-content: center;
    .el-cascader{
      width: 100%;
    }
  }
  .updateAddr_form{
    width: 80%;
  }
</style>
