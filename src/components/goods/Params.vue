<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 警告提示区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon>
      </el-alert>

      <!-- 级联选择框区域 -->
      <!-- options属性用来指定数据源
           clearable属性让输入框多了一个可删除选择的按钮
           change-on-select属性让每一级的选项都可以被选择-->
      选择商品分类：
      <el-cascader
        v-model="selectedKeys"
        :options="cateList"
        :props="cascaderProps"
        clearable
        @change="handleChange">
      </el-cascader>

      <!-- Tab标签页区域 -->
      <el-tabs v-model="addAttrParams.attr_sel" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            class="addParams"
            :disabled="selectedKeys.length===0"
            @click="openAddAttrDialog">
            添加参数
          </el-button>
          <!-- 动态参数表格区域 -->
          <el-table :data="dynamicParam" border stripe>
            <!-- el-table-column标签若不指定width属性，自动铺满整行 -->
            <!-- 添加Table展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :class="index===0 ? [] : 'tag'"
                  closable
                  :key="index"
                  v-for="(item,index) in scope.row.attr_vals"
                  @close="deleteAttrValByIndex(scope.row, index)">
                  {{item}}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  :class="['input-new-tag',scope.row.attr_vals.length===0 ? '' : 'tag']"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  :class="['input-new-tag',scope.row.attr_vals.length===0 ? '' : 'tag']"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 添加索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- slot-scope="scope" -->
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="openUpdateAttrDialog(scope.row)">
                  修改
                </el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttr(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            class="addParams"
            :disabled="selectedKeys.length===0"
            @click="openAddAttrDialog">
            添加属性
          </el-button>
          <!-- 静态属性表格区域 -->
          <el-table :data="staticProp" border stripe>
            <!-- el-table-column标签若不指定width属性，自动铺满整行 -->
            <!-- 添加Table展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :class="index===0 ? [] : 'tag'"
                  closable
                  :key="index"
                  v-for="(item,index) in scope.row.attr_vals"
                  @close="deleteAttrValByIndex(scope.row, index)">
                  {{item}}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  :class="['input-new-tag',scope.row.attr_vals.length===0 ? '' : 'tag']"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  :class="['input-new-tag',scope.row.attr_vals.length===0 ? '' : 'tag']"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 添加索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="openUpdateAttrDialog(scope.row)">
                  修改
                </el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttr(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 对话框区域 -->
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加'+param"
      :visible.sync="addAttrDialogVisible"
      width="50%">
      <div class="formBox">
        <!-- 添加参数表单区域 -->
        <el-form class="addAttr_form" :rules="addAttrFormRules" :model="addAttrParams" ref="addAttrFormRef">
          <!-- 参数名称 -->
          <el-form-item :label="param" prop="attr_name" label-width="80px">
            <el-input v-model="addAttrParams.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttr">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改'+param"
      :visible.sync="updateAttrDialogVisible"
      width="50%">
      <div class="formBox">
        <!-- 修改参数表单区域 -->
        <el-form class="addAttr_form" :rules="addAttrFormRules" :model="updateAttrParams" ref="updateAttrFormRef">
          <!-- 参数名称 -->
          <el-form-item :label="param" prop="attr_name" label-width="80px">
            <el-input v-model="updateAttrParams.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateAttr">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      // 分类数据列表
      cateList: [],
      // 级联选择框中选中项的id
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数数据
      dynamicParam: [],
      // 静态属性数据
      staticProp: [],
      // 控制添加参数的对话框开启与否
      addAttrDialogVisible: false,
      // 这是添加参数表单的验证规则对象
      addAttrFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 添加动态参数请求的参数
      addAttrParams: {
        // 添加参数对话框中参数名称绑定的属性
        attr_name: '',
        // 设置默认展开的Tab标签页
        attr_sel: 'many',
        attr_vals: ''
      },
      // 修改动态参数请求的参数
      updateAttrParams: {
        // 修改参数对话框中参数名称绑定的属性
        attr_name: ''
      },
      // 控制修改参数的对话框开启与否
      updateAttrDialogVisible: false,
      // 当前正在操作的属性id
      attrId: null
    }
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const res = await this.$http.get('categories', {
        params: { type: 3 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      this.cateList = res.data
    },
    // 选择商品分类的级联选择框发生变化时触发的函数
    handleChange () {
      // 证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        // 清空动态参数和静态属性两个表格中的数据
        this.dynamicParam = []
        this.staticProp = []
        return
      }
      this.getDynamicParam()
      this.getStaticProp()
    },
    // 点击Tab标签页后触发的函数
    handleTabClick () {
    },
    // 获取动态参数列表
    async getDynamicParam () {
      // 获取当前选中的分类id
      const id = this.selectedKeys[this.selectedKeys.length - 1]
      const res = await this.$http.get(`categories/${id}/attributes`, {
        params: {
          sel: 'many'
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取动态参数列表失败')
      }
      // 将返回结果中每一项的attr_vals属性都用空格分割成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制添加参数值文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      this.dynamicParam = res.data
    },
    // 获取静态属性列表
    async getStaticProp () {
      // 获取当前选中的分类id
      const id = this.selectedKeys[this.selectedKeys.length - 1]
      const res = await this.$http.get(`categories/${id}/attributes`, {
        params: {
          sel: 'only'
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取静态属性列表失败')
      }
      // 将返回结果中每一项的attr_vals属性都用空格分割成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制添加参数值文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      this.staticProp = res.data
    },
    // 点击添加参数按钮触发的函数
    openAddAttrDialog () {
      // 打开添加参数对话框
      this.addAttrDialogVisible = true
    },
    // 点击点击添加参数对话框中的确定按钮后触发的函数
    async addAttr () {
      this.$refs.addAttrFormRef.validate(async valid => {
        if (!valid) {
          // 预校验未能通过
          return
        }
        // 预校验通过，发起axios请求
        const id = this.selectedKeys[this.selectedKeys.length - 1]
        const res = await this.$http.post(`categories/${id}/attributes`, this.addAttrParams)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // 提示成功信息
        this.$message.success('添加参数成功')
        // 关闭对话框
        this.addAttrDialogVisible = false
        // 清空参数名称
        this.addAttrParams.attr_name = ''
        // 重新获取动态参数列表
        if (this.addAttrParams.attr_sel === 'many') {
          this.getDynamicParam()
        } else {
          this.getStaticProp()
        }
      })
    },
    // 点击修改参数按钮触发的函数
    openUpdateAttrDialog (row) {
      // console.log(row)
      // 打开修改参数对话框
      this.updateAttrDialogVisible = true
      this.attrId = row.attr_id
      // 显示当前行的参数名称
      this.updateAttrParams.attr_name = row.attr_name
    },
    // 点击修改参数对话框中的确定按钮后触发的函数
    async updateAttr () {
      this.$refs.updateAttrFormRef.validate(async valid => {
        if (!valid) {
          // 预校验未能通过
          return
        }
        // 预校验通过，发起axios请求
        const id = this.selectedKeys[this.selectedKeys.length - 1]
        const res = await this.$http.put(`categories/${id}/attributes/${this.attrId}`, {
          attr_name: this.updateAttrParams.attr_name,
          attr_sel: this.addAttrParams.attr_sel
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 提示成功信息
        this.$message.success('修改参数成功')
        // 关闭对话框
        this.updateAttrDialogVisible = false
        // 重新获取动态参数列表
        if (this.addAttrParams.attr_sel === 'many') {
          this.getDynamicParam()
        } else {
          this.getStaticProp()
        }
      })
    },
    // 将attr_vals的值同步到数据库
    async saveAttrVals (row) {
      const res = await this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
    },
    // 删除参数中的某个值
    deleteAttrValByIndex (row, index) {
      this.$confirm('此操作将永久删除该参数值, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        row.attr_vals.splice(index, 1)
        // 这里调用的依然是修改参数的接口
        await this.saveAttrVals(row)
        // 提示成功信息
        this.$message.success('删除参数值成功')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 添加参数值的文本框失去焦点或按下Enter键触发的函数
    async handleInputConfirm (row) {
      // 如果输入框中的值去掉前后空格后长度为0
      // 也就是当用户在输入框中输入多个空格时会触发这个条件
      if (row.inputValue.trim().length === 0) {
        // 将输入框中的内容清空
        row.inputValue = ''
        // 失去焦点后tag切换为按钮
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容正确，需要做后续处理
      // 添加参数值
      row.attr_vals.push(row.inputValue.trim())
      // 清空输入框中的内容跟
      row.inputValue = ''
      // 输入框切换为按钮
      row.inputVisible = false

      // 发请求同步数据库中的参数值
      await this.saveAttrVals(row)
      // 提示成功信息
      this.$message.success('添加参数值成功')
    },
    // 点击添加参数值按钮，展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用就是当页面上元素被重新渲染之后，才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 点击删除参数按钮触发的函数
    async deleteAttr (row) {
      this.$confirm('此操作将删除该参数值, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // console.log(row)
        const res = await this.$http.delete(`categories/${row.cat_id}/attributes/${row.attr_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('删除参数成功')
        if (row.attr_sel === 'many') {
          this.getDynamicParam()
        } else {
          this.getStaticProp()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 添加参数对话框中显示的文本内容
    param () {
      if (this.addAttrParams.attr_sel === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .el-cascader {
    margin-top: 15px;
    width: 270px;
  }
  .firstItem {
    padding-left: 0;
  }
  .el-tabs {
    margin-top: 15px;
  }
  .tag {
    margin-left: 10px;
  }
  .formBox {
    display: flex;
    justify-content: center;
  }
  .addAttr_form{
    width: 50%;
  }
  .input-new-tag{
    width: 100px
  }
</style>
