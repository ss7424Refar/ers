<template>
  <div id="headBar">
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand href="#">
        <img src="../../../public/assets/cat.jpeg" class="d-inline-block align-top" alt="Kitten">
        往来账款管理
      </b-navbar-brand>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav right>
          <b-nav-item>Ver1.0.0.0 - {{date}}</b-nav-item>
        </b-nav>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script>
  export default {
    name: 'Head',
    data() {
      return {
        date: this.$moment().format('YYYY-MM-DD HH:mm:ss')
      }
    },
    mounted() {
      let _this = this; // 声明一个变量指向Vue实例this，保证作用域一致
      this.timer = setInterval(() => {
        _this.date = this.$moment().format('YYYY-MM-DD HH:mm:ss')
      }, 1000)
    },
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
      }
    }
  }
</script>

<style scoped>
  #headBar {
    margin-bottom: 10px;
  }
</style>
