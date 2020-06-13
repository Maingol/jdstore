<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加用户和搜索用户区域 -->
      <el-row :gutter="30">
        <el-col :span="7">
          <el-input @clear="getUserList" placeholder="请输入要查询的用户" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="isActiveAddUser = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="账户"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"
                       @change="updateUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="activeUpdateDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="openDeleteMsgBox(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 对话框区域 -->
    <!-- 点击添加用户按钮出现的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="isActiveAddUser"
      width="50%" @closed="resetAddForm">
      <div class="formBox">
        <!-- 添加用户表单区域 -->
        <el-form class="addUser_form" :rules="addUserFormRules" :model="addUserForm" ref="addUserFormRef">
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="userName" label-width="80px">
            <el-input v-model="addUserForm.userName"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item label="密码" prop="passWord" label-width="80px">
            <el-input v-model="addUserForm.passWord" type="password">
            </el-input>
          </el-form-item>
          <!-- 确认密码 -->
          <el-form-item label="确认密码" prop="confirmPwd" label-width="80px">
            <el-input v-model="addUserForm.confirmPwd" type="password">
            </el-input>
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email" label-width="80px">
            <el-input v-model="addUserForm.email">
            </el-input>
          </el-form-item>
          <!-- 手机 -->
          <el-form-item label="手机号" prop="mobile" label-width="80px">
            <el-input v-model="addUserForm.mobile">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
              <el-button @click="isActiveAddUser = false">取 消</el-button>
              <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="isActiveUpdateUser"
      width="50%" @closed="resetUpdateForm">
      <div class="formBox">
        <!-- 修改用户表单区域，校验规则不可以复用添加用户表单的校验规则 -->
        <el-form class="updateUser_form" :rules="updateUserFormRules" :model="updateUserInfo" ref="updateUserFormRef">
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="userName" label-width="80px">
            <el-input v-model="updateUserInfo.username" disabled></el-input>
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email" label-width="80px">
            <el-input v-model="updateUserInfo.email">
            </el-input>
          </el-form-item>
          <!-- 手机 -->
          <el-form-item label="手机号" prop="mobile" label-width="80px">
            <el-input v-model="updateUserInfo.mobile">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
              <el-button @click="isActiveUpdateUser = false">取 消</el-button>
              <el-button type="primary" @click="updateUser()">确 定</el-button>
            </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed">
      <div class="formBox">
        <div>
          <p>当前的用户：{{this.userInfo.username}}</p>
          <p>当前的角色：{{this.userInfo.role_name}}</p>
          <p>
            分配新角色：
            <el-select v-model="selectRole" placeholder="请为当前用户分配角色">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data () {
    // 确认密码输入框的校验规则
    const validateConfirmPwd = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.addUserForm.passWord) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    // 手机号的校验规则
    const isMobileNumber = (rule, value, callback) => {
      if (!value) {
        return new Error('请输入电话号码')
      } else {
        const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        const isPhone = reg.test(value)
        // 转换为数字
        value = Number(value)
        // 判断是否为数字
        if (typeof value === 'number' && !isNaN(value)) {
          // 转换成字符串
          value = value.toString()
          // 判断是否为11位手机号
          if (value.length < 0 || value.length > 12 || !isPhone) {
            callback(new Error('手机号码格式错误'))
          } else {
            callback()
          }
        } else {
          callback(new Error('只能填写数字'))
        }
      }
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表
      userlist: [],
      // 查询到的用户总数
      total: 0,
      // 控制添加用户的提示框是否显示
      isActiveAddUser: false,
      // 控制编辑用户的提示框是否显示
      isActiveUpdateUser: false,
      // 添加用户时输入框绑定的的表单数据
      addUserForm: {
        userName: '',
        passWord: '',
        confirmPwd: '',
        email: '',
        mobile: ''
      },
      // 准备修改的用户数据
      updateUserInfo: {},
      /* 这是添加用户表单的验证规则对象 */
      addUserFormRules: {
        /* 这里的字段必须和上面的绑定对象中的字段相对应 */
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        passWord: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        confirmPwd: [
          { required: true, validator: validateConfirmPwd, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          // change为检验的字符变化的时候
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: isMobileNumber, trigger: 'blur' }
        ]
      },
      /* 这是修改用户信息的表单的验证规则对象 */
      updateUserFormRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          // change为检验的字符变化的时候
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: isMobileNumber, trigger: 'blur' }
        ]
      },
      /* 控制分配角色对话框的关闭与否 */
      setRoleDialogVisible: false,
      /* 当前准备分配角色的用户信息 */
      userInfo: {},
      /* 角色列表 */
      roleList: [],
      /* 分配角色对话框中select选择器v-model绑定的值
      * 实际存储的是下拉框中被选中的那一项的角色id */
      selectRole: null,
      /* 保存用户id，用于更新该用户的角色 */
      userIdToUpdateRid: 0
    }
  },
  created () {
    // 发送获取用户列表的axios请求
    // async最好还是不要放在created前面，因为这个函数并不是专门用于发请求的，所以这里调用methods中的函数
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const res = await this.$http({
        url: 'users',
        method: 'get',
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取用户列表失败！')
      } else {
        this.userlist = res.data.users
        this.total = res.data.total
      }
    },
    // 每页条数发生变化时触发的函数，每页条数会传递给形参val
    handleSizeChange (val) {
      // 更新请求参数中的每页条数
      this.queryInfo.pagesize = val
      // 发送请求更新用户列表userlist
      this.getUserList()
    },
    // 当前页发生变化时触发的函数，当前页会传递给形参val
    handleCurrentChange (val) {
      // 更新请求参数中的当前页
      this.queryInfo.pagenum = val
      // 发送请求更新用户列表userlist
      this.getUserList()
    },
    // switch开关状态变化时触发此函数，没有指定实参时，形参默认为开关的状态值
    // 但是这里需要两个形参，所以实参也要指定。
    async updateUserState (userInfo) {
      // console.log(uId, type)
      // 发起修改用户状态的axios请求
      const res = await this.$http({
        url: `users/${userInfo.id}/state/${userInfo.mg_state}`,
        method: 'put'
      })
      if (res.meta.status === 200) {
        this.$message.success('状态修改成功')
      } else {
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error('状态修改失败')
      }
    },
    // 添加用户对话框中的确定按钮，绑定的函数
    addUser () {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) {
          // 预校验未能通过
          return
        }
        // 预校验通过，发起axios请求
        const res = await this.$http({
          url: 'users',
          method: 'post',
          data: this.addUserForm
        })
        // 少用else可以避免多层if else嵌套
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 添加成功后隐藏当前对话框
        this.isActiveAddUser = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 添加用户的对话框关闭后重置表单
    resetAddForm () {
      this.$refs.addUserFormRef.resetFields()
    },
    // 修改用户信息的对话框关闭后重置表单
    resetUpdateForm () {
      this.$refs.updateUserFormRef.resetFields()
    },
    // 点击编辑按钮后触发的函数
    async activeUpdateDialog (id) {
      const res = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      this.updateUserInfo = res.data
      /* 打开修改用户的对话框 */
      this.isActiveUpdateUser = true
    },
    updateUser () {
      // 点击确定按钮后，先执行预校验
      this.$refs.updateUserFormRef.validate(async valid => {
        if (!valid) {
          // 预校验未能通过
          return
        }
        // 预校验通过，发起axios请求
        const res = await this.$http.put('users/' + this.updateUserInfo.id, {
          email: this.updateUserInfo.email,
          mobile: this.updateUserInfo.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        this.$message.success('修改用户信息成功')
        // 隐藏修改用户的对话框
        this.isActiveUpdateUser = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    openDeleteMsgBox (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message({
          type: 'success',
          message: '删除用户成功!'
        })
        this.getUserList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    /* 点击分配角色按钮后触发的函数 */
    async setRole (userInfo) {
      /* 打开分配角色对话框 */
      this.setRoleDialogVisible = true
      this.userInfo = userInfo
      /* 保存用户id，用于更新该用户的角色 */
      this.userIdToUpdateRid = userInfo.id
      /* 发请求获取角色列表 */
      const res = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      /* 保存返回的角色列表数据 */
      this.roleList = res.data
    },
    /* 点击分配角色对话框中的确定按钮后发请求更新用户的角色 */
    async updateRole () {
      const res = await this.$http.put(`users/${this.userIdToUpdateRid}/role`,
        { rid: this.selectRole })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      // 提示成功信息
      this.$message.success('分配角色成功')
      // 关闭当前对话框
      this.setRoleDialogVisible = false
      // 重新请求用户列表
      this.getUserList()
    },
    setRoleDialogClosed () {
      this.selectRole = null
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
  .formBox {
    display: flex;
    justify-content: center;
    .addUser_form {
      width: 50%;
    }
  }
  p{
    margin-top: 15px;
  }
</style>
