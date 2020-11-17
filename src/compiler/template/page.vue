<template>
  <div class="page-name">这里渲染{{ PageName }}组件</div>
</template>

<script>
export default {
  name: "{{ PageName }}",
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
.page-name {
}
</style>
