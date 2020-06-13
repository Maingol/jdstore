<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

      <!-- 表格区域 -->
      <!-- data属性绑定的是表格的数据源
           columns属性绑定的是表格每一列的定义
           selection-type属性决定是否展示复选框
           expand-type决定是否开启展开行的功能
           show-index属性决定是否显示数据索引列
           index-text属性用于设置数据索引列的名称
           boder属性决定是否显示列与列之间的分割线
           show-row-hover属性决定鼠标悬停时，是否高亮当前行-->
      <tree-table class="treeTable"
                  :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text=""
                  border
                  :show-row-hover="false">
        <!-- 定义一个名为isok的插槽，它将来会被'是否有效'那一列所引用
             slot-scope属性用于接收这一行的数据 -->
        <template slot="isok" slot-scope="scope">
          <!-- 对勾图标 -->
          <i v-if=!scope.row.cat_deleted
             class="el-icon-success"
             style="color: lightgreen">
          </i>
          <!-- 叉号图标 -->
          <i v-else
             class="el-icon-error"
             style="color: red">
          </i>
        </template>

        <!-- 排序列的自定义模板 -->
        <!-- “是否有效”列对应的插槽 -->
        <template slot="isok" slot-scope="scope">
          <!-- 对勾图标 -->
          <i v-if=!scope.row.cat_deleted
             class="el-icon-success"
             style="color: #22A0A5">
          </i>
          <!-- 叉号图标 -->
          <i v-else
             class="el-icon-error"
             style="color: red">
          </i>
        </template>

        <!-- “排序”列对应的插槽 -->
        <template slot="level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" type="primary">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>

        <!-- “操作”列对应的插槽 -->
        <template slot="operate" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"
                     @click="openUpdateCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"
                     @click="deleteCateById(scope.row)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3 , 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <div class="formBox">
        <!-- 添加分类表单区域 -->
        <el-form class="addCate_form" :rules="addCateFormRules" :model="addCateForm" ref="addCateFormRef">
          <!-- 分类名称 -->
          <el-form-item label="分类名称" prop="cat_name" label-width="80px">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <!-- 父级分类 -->
          <el-form-item label="父级分类" label-width="80px">
            <!-- options属性用来指定数据源
                 clearable属性让输入框多了一个可删除选择的按钮
                 change-on-select属性让每一级的选项都可以被选择-->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
              change-on-select>
            </el-cascader>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="updateCateDialogVisible"
      width="50%">
      <div class="formBox">
        <!-- 添加分类表单区域 -->
        <el-form class="updateCate_form" :rules="updateCateFormRules" :model="updateCateForm" ref="updateCateFormRef">
          <!-- 分类名称 -->
          <el-form-item label="分类名称" prop="cat_name" label-width="80px">
            <el-input v-model="updateCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate.vue',
  data () {
    return {
      // 发请求获取商品分类列表时的参数信息
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        // label键指定相应的列名称，prop键指定相应列的内容绑定到数据源中的哪一个字段
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate'
        }
      ],
      // 控制添加分类的对话框显示与否
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是一级分类
        cat_level: 0
      },
      // 这是添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的数据列表（一级和二级）
      parentCateList: [],
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 控制修改分类的对话框显示与否
      updateCateDialogVisible: false,
      // 修改分类的表单数据对象
      updateCateForm: {
        // 将要修改的分类的名称
        cat_name: ''
      },
      // 这是修改分类表单的验证规则对象
      updateCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 修改分类的id
      updateCateId: null
    }
  },
  methods: {
    // 获取商品分类列表
    async getGoodsCate () {
      const res = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      // 把数据列表赋值给catelist
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
      // console.log(this.cateList, this.total)
    },
    // 每页条数发生变化时触发的函数，每页条数会传递给形参val
    handleSizeChange (val) {
      // 更新请求参数中的每页条数
      this.queryInfo.pagesize = val
      // 发送请求更新用户列表userlist
      this.getGoodsCate()
    },
    // 当前页发生变化时触发的函数，当前页会传递给形参val
    handleCurrentChange (val) {
      // 更新请求参数中的当前页
      this.queryInfo.pagenum = val
      // 发送请求更新用户列表userlist
      this.getGoodsCate()
    },
    // 点击添加分类按钮后触发的函数
    showAddCateDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再弹出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表（一级和二级分类）
    async getParentCateList () {
      const res = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      /* 如果selectedKeys数组中的length大于0，证明选中了父级分类。
         反之就说明没有选中任何父级分类 */
      if (this.selectedKeys.length > 0) {
        // 永远选择数组中的最后一项作为父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击添加分类对话框中的确认按钮触发的函数
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getGoodsCate()
        this.addCateDialogVisible = false
      })
    },
    // 对话框关闭触发的函数
    addCateDialogClosed () {
      // 清空添加分类的表单
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击修改分类按钮后触发的函数
    openUpdateCateDialog (row) {
      // 打开修改分类的对话框
      this.updateCateDialogVisible = true
      // 将当前分类名称默认显示在当前修改分类输入框
      this.updateCateForm.cat_name = row.cat_name
      // 记录当前修改分类的id
      this.updateCateId = row.cat_id
      this.row = row
    },
    // 点击修改分类对话框中的确认按钮触发的函数
    async updateCate () {
      this.$refs.updateCateFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.put(
          'categories/' + this.updateCateId,
          this.updateCateForm)
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类名称失败')
        }
        this.getGoodsCate()
        this.$message.success('修改分类名称成功')
        this.updateCateDialogVisible = false
      })
    },
    // 点击删除分类按钮后触发的函数
    deleteCateById (row) {
      this.$confirm('此操作将删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`categories/${row.cat_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败')
        }
        this.$message.success('删除分类成功')
        this.getGoodsCate()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  },
  created () {
    // 获取商品分类列表
    this.getGoodsCate()
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
  .formBox {
    display: flex;
    justify-content: center;
  }
</style>
