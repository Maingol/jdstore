<template>
  <div>
    Home组件
    <button @click="handle">鉴权测试</button>
    <div>
      <el-button type="info" round @click="logout">退出</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    async handle () {
      const res = await this.$http({
        url: 'menus',
        method: 'get'
      })
      console.log(res)
    },
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>

</style>
