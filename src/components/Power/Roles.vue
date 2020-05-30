<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-button type="primary">添加角色</el-button>
      <!-- 角色列表 -->
      <el-table :data="roleList" style="width: 100%" border stripe>
        <!-- el-table-column标签若不指定width属性，自动铺满整行 -->
        <!-- 添加Table展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 每个el-row占一行 -->
            <el-row :class="['bdBottom',i===0 ? 'bdTop' : '']"
                    :key=item1.id v-for="(item1,i) in scope.row.children">
              <!-- 渲染一级菜单 -->
              <!-- 每个el-col占一列，每列占5格，多个el-col占一行 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRightById(scope.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级菜单 -->
              <el-col :span="19">
                <!-- 二级权限和三级权限在同一行。除了第一行，都添加一个上边框线 -->
                <el-row :class="i===0 ? '' : 'bdTop'"
                        :key=item2.id v-for="(item2,i) in item1.children">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteRightById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" closable @close="deleteRightById(scope.row,item3.id)"
                            :key=item3.id v-for="item3 in item2.children">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 添加索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button type="warning" icon="el-icon-setting" size="mini"
                       @click="openSetRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 对话框区域 -->
    <!-- 点击分配权限按钮弹出的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialog"
      width="50%"
      @close="defaultChecked=[]">
      <el-tree :data="rightsTree"
               show-checkbox
               :props="defaultProps"
               node-key="id"
               ref="tree"
               :default-checked-keys="defaultChecked"
               default-expand-all>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialog = false">取 消</el-button>
        <el-button type="primary" @click="updateRoleRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      /* 所有角色的权限列表 */
      roleList: [],
      /* 控制分配权限的对话框关闭与否 */
      setRightsDialog: false,
      /* 存储请求得到的树形权限列表 */
      rightsTree: [],
      /* 树形控件的必要属性 */
      defaultProps: {
        /* 子节点所在的字段 */
        children: 'children',
        /* 节点名称 */
        label: 'authName'
      },
      /* 树形控件默认展开的节点 */
      defaultChecked: [],
      /* 点击分配权限对话框中的确认按钮后，准备更新权限的角色id */
      updatingRole: 0
    }
  },
  methods: {
    async getRoleList () {
      const res = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      // console.log(this.roleList)
    },
    deleteRightById (row, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`roles/${row.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        }
        this.$message.success('删除权限成功')
        /* 更新scope.row中的数据，与发请求重新获取角色列表的方法相比，
        这样可以避免发生展开行的折叠 */
        row.children = res.data
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    /* 点击分配权限按钮后触发的函数 */
    async openSetRightsDialog (row) {
      /* 把即将更新的角色id保存下来 */
      this.updatingRole = row.id
      // console.log(row.id)
      /* 获取当前角色的所有三级权限，用于展示树形控件的默认勾选节点 */
      for (const item1 of row.children) {
        for (const item2 of item1.children) {
          for (const item3 of item2.children) {
            // console.log(item3.id)
            this.defaultChecked.push(item3.id)
          }
        }
      }
      /* 发起axios请求获取树形权限列表 */
      const res = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取树形权限失败')
      }
      this.rightsTree = res.data
      // console.log(this.rightsTree)
      this.setRightsDialog = true
    },
    /* 点击分配权限对话框中确认按钮后触发的函数 */
    async updateRoleRights () {
      // console.log(this.$refs.tree.getCheckedKeys())
      /* 获取树形控件中被选中和半选中的所有节点的id */
      let RoleRights = [...this.$refs.tree.getCheckedKeys(), ...this.$refs.tree.getHalfCheckedKeys()]
      /* 由于角色授权接口需要请求参数是字符形式的权限 ID 列表，
      * 所以这里将字符串数组变成一个字符串 */
      RoleRights = RoleRights.join(',')
      // console.log(typeof RoleRights, RoleRights)
      // 发请求更新角色权限
      const res = await this.$http.post(`roles/${this.updatingRole}/rights`, { rids: RoleRights })
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }
      // 更新页面数据
      this.getRoleList()
      // 隐藏对话框
      this.setRightsDialog = false
      // 给出成功提示
      this.$message.success('更新权限成功')
    }
  },
  created () {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
  .el-tag{
    /* 距离外界上下左右都是7px */
    margin: 7px;
  }
  .bdTop{
    border-top: 1px solid #eee;
  }
  .bdBottom{
    border-bottom: 1px solid #eee;
  }
  .el-row{
    display: flex;
    align-items: center;
  }
</style>
