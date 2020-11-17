<template>
  <div class="page-b">这里渲染PageB组件</div>
</template>

<script>
export default {
  name: "PageB",
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
.page-b {
}
</style>
