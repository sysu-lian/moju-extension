<template>
  <el-container>
    <!-- <el-header> </el-header> -->
    <el-container>
      <el-aside width="200px">
        <MjMenu></MjMenu>
      </el-aside>
      <el-main>
        <router-view class="app-child"></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import MjMenu from "./HelloWorld.vue";

export default {
  name: "Layout",
  components: { MjMenu }
};
</script>
