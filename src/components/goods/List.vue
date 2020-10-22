<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加用户和搜索用户区域 -->
      <el-row :gutter="30">
        <!--
        <el-col :span="7">
          <el-input @clear="getUserList" placeholder="请输入要查询的用户" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        -->
        <el-col :span="7">
          <el-input @clear="getGoodsList" placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="150"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="150"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="200">
          <template slot-scope="scope">
            {{scope.row.add_time | format}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="openUpdateGoodDialog(scope.row)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
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
    </el-card>
    <!-- 对话框区域 -->
    <!-- 点击编辑商品按钮弹出的对话框 -->
    <!-- 编辑角色的对话框 -->
    <!-- 此对话框关闭后不必清空数据，也就不必设置关闭后触发的函数@close="" -->
    <el-dialog
      title="编辑商品"
      :visible.sync="updateGoodDialogVisible"
      width="80%">
      <div class="formBox">
        <!-- 编辑商品表单区域 -->
        <el-form class="updateGood_form" :rules="updateGoodFormRules" :model="updateGoodForm" ref="updateGoodFormRef">
          <!-- 商品名称 -->
          <el-form-item label="商品名称" prop="goods_name" label-width="80px">
            <el-input v-model="updateGoodForm.goods_name"></el-input>
          </el-form-item>
          <!-- 商品价格 -->
          <el-form-item label="商品价格" prop="goods_price" label-width="80px">
            <el-input v-model="updateGoodForm.goods_price"></el-input>
          </el-form-item>
          <!-- 商品重量 -->
          <el-form-item label="商品重量" prop="goods_weight" label-width="80px">
            <el-input v-model="updateGoodForm.goods_weight"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateGoodDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateGoodInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'List',
  data () {
    return {
      // 获取商品列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取商品列表时得到的结果条数
      total: null,
      // 商品数据列表
      goodsList: [],
      /* 控制编辑商品的对话框关闭与否 */
      updateGoodDialogVisible: false,
      /* 编辑商品对话框中表单绑定的数据 */
      updateGoodForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0
      },
      /* 这是编辑商品表单的验证规则对象 */
      updateGoodFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      },
      /* 记录准备更新的商品的id */
      updateGoodId: null
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const res = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.total = res.data.total
      this.goodsList = res.data.goods
      // return this.$message.success('获取商品列表成功')
    },
    // 每页条数发生变化时触发的函数，每页条数会传递给形参val
    handleSizeChange (val) {
      // 更新请求参数中的每页条数
      this.queryInfo.pagesize = val
      // 发送请求更新用户列表userlist
      this.getGoodsList()
    },
    // 当前页发生变化时触发的函数，当前页会传递给形参val
    handleCurrentChange (val) {
      // 更新请求参数中的当前页
      this.queryInfo.pagenum = val
      // 发送请求更新用户列表userlist
      this.getGoodsList()
    },
    goAddPage () {
      this.$router.push('add-goods')
    },
    // 点击修改商品按钮后触发的函数
    openUpdateGoodDialog (row) {
      // 打开修改商品的对话框
      this.updateGoodDialogVisible = true
      // 将待修改商品的信息默认显示在当前修改商品输入框
      this.updateGoodForm.goods_name = row.goods_name
      this.updateGoodForm.goods_price = row.goods_price
      this.updateGoodForm.goods_weight = row.goods_weight
      // 记录待修改商品的id
      this.updateGoodId = row.goods_id
    },
    /* 点击编辑角色对话框中确认按钮后触发的函数 */
    async updateGoodInfo () {
      this.$refs.updateGoodFormRef.validate(async valid => {
        if (!valid) {
          // 预校验未能通过
          return
        }
        // 预校验通过，发起axios请求
        console.log(this.updateGoodForm)
        const res = await this.$http.put('goods/' + this.updateGoodId, this.updateGoodForm)
        if (res.meta.status !== 200) {
          return this.$message.error('更新商品信息失败')
        }
        // 给出成功提示
        this.$message.success('更新商品信息成功')
        // 隐藏对话框
        this.updateGoodDialogVisible = false
        // 重新请求商品列表
        this.getGoodsList()
      })
    },
    /* 点击删除商品按钮后触发的函数 */
    deleteGoodById (row) {
      this.$confirm('此操作将删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`goods/${row.goods_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败')
        }
        this.$message.success('删除商品成功')
        this.getGoodsList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .formBox {
    display: flex;
    justify-content: center;
  }
  .updateGood_form{
    width: 80%;
  }
</style>
