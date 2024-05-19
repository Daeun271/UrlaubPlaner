import { createRouter, createWebHistory } from "vue-router";
import { useStore } from "vuex";
import Home from "../views/Home.vue";
import User from "../views/User.vue";
import Plan from "../views/Plan.vue";
import Chat from "../views/Chat.vue";
import Expense from "../views/Expense.vue";
import Recommendation from "../views/Recommendation.vue";
import SignIn from "../views/SignIn.vue";
import SignUp from "../views/SignUp.vue";
import SignOut from "../views/SignOut.vue";
import PasswordReset from "../views/PasswordReset.vue";
import CreateGroup from "../views/CreateGroup.vue";
import Group from "../views/Group.vue";
import Setting from "../views/Setting.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/user",
      name: "user",
      component: User,
    },
    {
      path: "/signin",
      name: "sign-in",
      component: SignIn,
    },
    {
      path: "/signin/:groupId",
      name: "sign-in-by-group",
      component: SignIn,
    },
    {
      path: "/signup",
      name: "sign-up",
      component: SignUp,
    },
    {
      path: "/signup/:groupId",
      name: "sign-up-by-group",
      component: SignUp,
    },
    {
      path: "/signout",
      name: "sign-out",
      component: SignOut,
    },
    {
      path: "/reset",
      name: "reset",
      component: PasswordReset,
    },
    {
      path: "/create-group",
      name: "create-group",
      component: CreateGroup,
    },
    {
      path: "/trip/:groupId/group",
      name: "group",
      component: Group,
    },
    {
      path: "/trip/:groupId/plan",
      name: "plan",
      component: Plan,
    },
    {
      path: "/trip/:groupId/chat",
      name: "chat",
      component: Chat,
    },
    {
      path: "/trip/:groupId/expense",
      name: "expense",
      component: Expense,
    },
    {
      path: "/trip/:groupId/recommendation",
      name: "recommendation",
      component: Recommendation,
    },
    {
      path: "/setting",
      name: "setting",
      component: Setting,
    },
  ],
});

router.beforeResolve(async (to, from, next) => {
  const store = useStore();
  store.dispatch("setHeaderLinks", []);
  await store.getters.userPromise;

  if (to.path === "/user") {
    store.getters.isLoggedIn ? next() : next({ name: "home" });
    return;
  }

  if (to.path === "/") {
    store.getters.isLoggedIn ? next({ name: "user" }) : next();
    return;
  }

  if (to.path === "/signup") {
    store.getters.isLoggedIn ? next(false) : next();
    return;
  }

  if (to.path === "/signin") {
    store.getters.isLoggedIn ? next(false) : next();
    return;
  }
  
  if (to.path === "/signout") {
    store.getters.isLoggedIn ? next() : next(false);
    return;
  }

  if (to.path === "/create-group") {
    store.getters.isLoggedIn ? next() : next(false);
    return;
  }

  if (to.path === "/setting") {
    store.getters.isLoggedIn ? next() : next(false);
    return;
  }

  if (to.path.startsWith("/trip/")) {
    store.dispatch("setHeaderLinks", [
      { name: "Group", path: `/trip/${to.params.groupId}/group` },
      { name: "Plan", path: `/trip/${to.params.groupId}/plan` },
      { name: "Chat", path: `/trip/${to.params.groupId}/chat` },
      { name: "Expense", path: `/trip/${to.params.groupId}/expense` },
      { name: "Recommendation", path: `/trip/${to.params.groupId}/recommendation` },
    ]);
  }

  next();
});
export default router;