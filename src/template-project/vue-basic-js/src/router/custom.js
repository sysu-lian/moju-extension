import PageList from "./pageList";
const Container = () =>
  import(/* webpackChunkName: 'Container' */ "@/Container.vue");
export const routes = [
  {
    // 页面A,
    path: "/page-a",
    name: PageList.PAGE_A,
    component: () =>
      import(/* webpackChunkName: 'pageA' */ "@/views/pageA.vue"),
  },
  {
    // 页面B,
    path: "/page-b",
    name: PageList.PAGE_B,
    component: () =>
      import(/* webpackChunkName: 'pageB' */ "@/views/pageB.vue"),
  },
];
