import { createRouter, createWebHistory } from "vue-router";
import { useStore } from "vuex";
import Home from "../views/Home.vue";
import User from "../views/User.vue";
import Plan from "../views/Plan.vue";
import Expense from "../views/Expense.vue";
import Recommendation from "../views/Recommendation.vue";
import SignIn from "../views/SignIn.vue";
import SignUp from "../views/SignUp.vue";
import SignOut from "../views/SignOut.vue";
import PasswordReset from "../views/PasswordReset.vue";

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
      path: "/plan",
      name: "plan",
      component: Plan,
    },
    {
      path: "/expense",
      name: "expense",
      component: Expense,
    },
    {
      path: "/recommendation",
      name: "recommendation",
      component: Recommendation,
    },
    {
      path: "/signin",
      name: "signin",
      component: SignIn,
    },
    {
      path: "/signup",
      name: "signup",
      component: SignUp,
    },
    {
      path: "/signout",
      name: "signout",
      component: SignOut,
    },
    {
      path: "/reset",
      name: "reset",
      component: PasswordReset,
    }
  ],
});

router.beforeResolve(async (to, from, next) => {
  const store = useStore();
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

  next();
});

export default router;
