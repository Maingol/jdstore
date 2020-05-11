<template>
  <div class="login_container">
    <!--登陆盒子-->
    <div class="login_box">
      <!--头像区域-->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!--登陆表单区域-->
      <el-form class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <!--用户名-->
        <el-form-item style="order:3" prop="userName">
          <!--使用el-form-item标签包裹起来的元素底部会有一个空隙-->
          <el-input prefix-icon="el-icon-user" v-model="loginForm.userName"
                    placeholder="用户名"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item style="order:2" prop="passWord">
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.passWord"
                    type="password" placeholder="密码">
          </el-input>
        </el-form-item>
        <el-form-item style="order:1" class="login_btn">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
        <!--
          如果盒子内元素过多导致需要指定多个order的值，可以使用Emmet语法自动补全
          语法：el-form-item[style=order:$@-]*3
          生成的标签元素如下所示：
          <el-form-item style="order:3"></el-form-item>
          <el-form-item style="order:2"></el-form-item>
          <el-form-item style="order:1"></el-form-item>
        -->
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      /* 这是登陆表单的数据绑定对象 */
      loginForm: {
        userName: 'admin',
        passWord: '123456'
      },
      /* 这是登陆表单的验证规则对象 */
      loginFormRules: {
        /* 这里的字段必须和上面的绑定对象中的字段相对应 */
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        passWord: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (valid) {
          // axios请求的简化写法
          // const result = await this.$http.post('login', this.loginForm)

          // axios请求的完整写法
          const res = await this.$http({
            url: 'login',
            method: 'post',
            data: this.loginForm
          })
          if (res.meta.status === 200) {
            this.$message.success('登陆成功')
            /* 1. 将登陆成功之后的token保存到客户端的sessionStorage中
            *   1.1 项目中除了登陆之外的其他API接口，必须在登陆之后才能访问
            *   1.2 token只应在网站打开期间生效，所以将token保存在sessionStorage中 */
            window.sessionStorage.setItem('token', res.data.token)
            /* 2. 通过编程式导航跳转到后台主页，路由地址是 /home */
            await this.$router.push('/home')
          } else {
            this.$message.error('登陆失败')
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
    display: flex;
    /*设置垂直居中*/
    align-items: center;
    /*设置水平居中*/
    justify-content: center;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    /*为盒子设置圆角边框*/
    border-radius: 3px;
    display: flex;
    /*设置盒内元素（头像）水平居中*/
    justify-content: center;
    .avatar_box {
      height: 130px;
      width: 130px;
      /*生成头像的父盒子的边框*/
      border: 1px solid #eee;
      /*将头像的父盒子边框设置为圆角*/
      border-radius: 50%;
      /*让父盒子和头像之间生成间隙*/
      padding: 10px;
      /*设置父盒子外围的阴影*/
      box-shadow: 0 0 10px #ddd;
      /*以下两句的作用是让头像向上位移自身一半的高度*/
      position: absolute;
      transform: translate(0,-50%);
      /*为头像父盒子设置背景色为白色*/
      background-color: #fff;
      img {
        /*让图片跟随父盒子的大小*/
        width: 100%;
        height: 100%;
        /*将头像也设置为圆角样式*/
        border-radius: 50%;
        /*为头像添加灰色背景*/
        background-color: #eee;
      }
    }
  }
  .login_form{
    width: 80%;
    display: flex;
    flex-direction: column-reverse;
    .login_btn{
      display: flex;
      flex-direction: row-reverse;
    }
  }
</style>
