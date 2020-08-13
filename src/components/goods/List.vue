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
          <!--<template slot-scope="scope">
            &lt;!&ndash; 修改按钮 &ndash;&gt;
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="activeUpdateDialog(scope.row.id)"></el-button>
            &lt;!&ndash; 删除按钮 &ndash;&gt;
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="openDeleteMsgBox(scope.row.id)"></el-button>
          </template>-->
          <template>
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
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
      goodsList: []
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
