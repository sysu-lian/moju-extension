<template>
  <div class="page-a">这里渲染PageA组件</div>
</template>

<script>
export default {
  name: "PageA",
  components: {},
  props: {
    msg: String
  },
  data() {
    return {
      fileTree:[]
    };
  },
  methods: {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.page-a {
}
</style>
