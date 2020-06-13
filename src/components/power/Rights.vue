<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 权限列表 -->
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <!-- el-table-column标签若不指定width属性，自动铺满整行 -->
        <!-- 添加索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称">
        </el-table-column>
        <el-table-column prop="path" label="路径">
        </el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <!-- 添加标签 -->
            <!-- 这里使用v-if也可以达到目的 -->
            <el-tag :type="rightsLevel[scope.row.level].type">
              {{rightsLevel[scope.row.level].text}}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data () {
    return {
      /* 获取权限列表（list形式）后，将数据保存至这里 */
      rightsList: [],
      /* 权限等级映射 */
      rightsLevel: {
        0: {
          text: '一级',
          type: ''
        },
        1: {
          text: '二级',
          type: 'success'
        },
        2: {
          text: '三级',
          type: 'warning'
        }
      }
    }
  },
  methods: {
    async getRightsList () {
      const res = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      /* 将权限列表数据挂载到Vue实例的data中 */
      this.rightsList = res.data
    }
  },
  created () {
    /* 页面刚一加载就发起axios请求获取权限列表 */
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped>

</style>
