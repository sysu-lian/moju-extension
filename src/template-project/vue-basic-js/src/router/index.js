import VueRouter from "vue-router";
import { routes } from "./custom";
import Vue from "vue";

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

Vue.use(VueRouter);
export const router = new VueRouter({
  routes
});

export { routes };
