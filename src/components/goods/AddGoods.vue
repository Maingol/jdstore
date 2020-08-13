<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- Alert警告信息 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条区域 -->
      <!--
        align-center属性设置步骤条居中显示
        active属性控制的是步骤条中哪一个步骤被激活
      -->
      <div class="step">
        <!-- activeIndex-0的作用是将activeIndex变量中的字符串转换为数字 -->
        <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
      </div>

      <!-- Tab栏区域 -->
      <!-- label-position="top"的作用是将表单中的label文字显示在输入框的上面 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'"
                 :before-leave="beforeLeaveFunc" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <!-- label属性指定对应输入框前的提示文字，prop属性指定对应的校验规则 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格(元)" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"
                        onKeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))">
              </el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"
                        onKeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))">
              </el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"
                        onKeypress="return (/[\d\.]/.test(String.fromCharCode(event.keyCode)))">
              </el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cate">
              <el-cascader
                placeholder="请选择商品分类"
                v-model="addForm.goods_cate"
                :options="cateList"
                :props="cascaderProps"
                clearable
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :key="item.attr_id" v-for="item in dynamicParam" :label="item.attr_name">
              <!-- 多选框组 -->
              <el-checkbox-group v-model="item.attr_value">
                <el-checkbox
                  :key=index
                  v-for="(i,index) in item.attr_vals"
                  :label="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :key="item.attr_id" v-for="item in staticProp" :label="item.attr_name">
              <el-input v-model="item.attr_value"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--
              * action属性表示图片要上传到的后台API地址。
              * 这个地址不是后端保存图片磁盘路径，而是上传图片时访问的后端api接口，
                具体保存到哪个位置要在后端对应的controller层中定义。
              * 这个地址不可以写相对路径，因为相对路径对应的基准路径是前端项目的
                运行地址（端口号8900），所以这里要写绝对路径。
              * 由于这个上传图片的请求不是axios请求，所以需要手动将sessionstorage
                中的token取出并追加到这个请求中。
              * list-type的值可以决定上传图片时呈现出的ui效果
              * headers属性用于设置上传的请求头部
            -->
            <el-upload
              name="uploadPicture"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/jpeg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor
              v-model="addForm.goods_introduce"
            />
            <el-button type="primary" class="btnAdd" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片时显示的对话框 -->
    <el-dialog
      title="预览图片"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewURL" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'Add.Vue',
  data () {
    return {
      // 步骤条中激活项的索引
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cate: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品的表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cate: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
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
      // 商品参数面板中复选框选中项绑定的数组
      checkboxGroup: [],
      // 上传图片时发起请求的url
      uploadURL: 'http://127.0.0.1:8700/api/private/v1/upload',
      // 上传图片时发起请求的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片时图片的url地址
      previewURL: '',
      // 控制预览图片对话框的显示与否
      previewVisible: false
    }
  },
  methods: {
    async getCateList () {
      const res = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
    },
    // 选择商品分类的级联选择框发生变化时触发的函数
    handleChange () {
      // 证明选中的不是三级分类
      if (this.addForm.goods_cate.length !== 3) {
        this.addForm.goods_cate = []
      }
    },
    // 切换tabs标签页时触发的函数
    beforeLeaveFunc (activeName, oldActiveName) {
      if (oldActiveName === '0' &&
        this.addForm.goods_cate.length !== 3) {
        // 即将离开第一个标签页，并且未选择商品分类，阻止切换tabs标签页
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 获取动态参数列表
    async getDynamicParam () {
      const res = await this.$http.get(`categories/${this.catId}/attributes`, {
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
        item.attr_value = _.cloneDeep(item.attr_vals)
      })
      this.dynamicParam = res.data
    },
    // 获取静态属性列表
    async getStaticProp () {
      const res = await this.$http.get(`categories/${this.catId}/attributes`, {
        params: {
          sel: 'only'
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取静态属性列表失败')
      }
      res.data.forEach(item => {
        item.attr_value = _.cloneDeep(item.attr_vals)
      })
      this.staticProp = res.data
    },
    // 点击tabs标签页时触发的函数
    tabClicked () {
      if (this.activeIndex === '1') {
        // 获取动态参数列表
        this.getDynamicParam()
      } else if (this.activeIndex === '2') {
        // 获取静态属性列表
        this.getStaticProp()
      }
    },
    // 点击上传完成的图片进行预览时触发的函数
    handlePreview (file) {
      this.previewURL = file.response.data.url
      this.previewVisible = true
    },
    // 移除图片后触发的函数
    handleRemove (file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从pics数组中，找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的splice方法，把图片信息对象从pics数组中移除
      this.addForm.pics.splice(index, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess (response, file, fileList) {
      // 这里的上传成功只能证明后端有相对应的接口，是否真的上传成功还需要做进一步判断
      if (response.meta.status !== 200) {
        this.$message.error('上传图片失败，失败原因：' + response.meta.msg)
        fileList.splice(fileList.length - 1, 1)
        return
      }
      this.$message.success('上传图片成功')
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象添加到pics数组中
      this.addForm.pics.push(picInfo)
    },
    // 点击添加商品按钮时触发
    addGood () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cate = form.goods_cate.join(',')
        this.dynamicParam.forEach(item => {
          const arr1 = []
          const arr2 = []
          // item.attr_vals.forEach(item => {
          //   arr1.push(item)
          // })
          for (let i = 0; i < item.attr_vals.length; i++) {
            arr1.push(item.attr_vals[i])
          }
          for (let i = 0; i < item.attr_value.length; i++) {
            arr2.push(item.attr_value[i])
          }
          // item.attr_vals = item.attr_vals.join(' ')
          item.attr_vals = arr1.join(' ')
          item.attr_value = arr2.join(' ')
          form.attrs.push(item)
        })

        this.staticProp.forEach(item => {
          form.attrs.push(item)
        })
        form.goods_price = Number(form.goods_price)
        form.goods_weight = Number(form.goods_weight)
        form.goods_number = Number(form.goods_number)
        // form.goods_cate = form.goods_cate.join(',')

        const res = await this.$http.post('goods', form)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    catId () {
      if (this.addForm.goods_cate.length === 3) {
        return this.addForm.goods_cate[2]
      }
      return null
    }
  },
  created () {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
  .step {
    display: flex;
    justify-content: center;
  }
  .el-steps {
    width: 1200px;
  }
  .el-cascader {
    width: 270px;
  }
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .previewImg {
    width: 100%;
    height: 500px;
  }
  /* 添加商品按钮 */
  .btnAdd {
    margin-top: 15px;
  }
</style>
