<template>
  <div>
    <el-menu
      :default-active="
        routes[0].children.length > 0
          ? routes[0].children[0].name
          : routes[0].name
      "
      class="el-menu-vertical-demo1"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :collapse="false"
      @select="handleSelect"
    >
      <el-submenu v-for="route in routes" :key="route.name" :index="route.name">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>{{ route.meta.title }}</span>
        </template>
        <el-menu-item
          v-for="child in route.children"
          :key="child.name"
          :index="child.name"
          >{{ child.meta.title }}</el-menu-item
        >
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import { routes } from "@/router";
export default {
  name: "MjMenu",
  data() {
    return {
      isCollapse: false,
      routes: routes
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      this.$router.push({
        name: key
      });
      console.log(key, keyPath);
    }
  },
  mounted() {}
};
</script>
