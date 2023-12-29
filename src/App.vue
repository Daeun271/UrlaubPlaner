<template>
  <header>
    <title>Single-Page Application(SPA) using Vue 3</title>
    <meta charset="utf-8" />
    <meta name="description" content="Making a trip plan with your friends/family at UrlaubPlaner" />
    <meta name="keywords" content="UrlaubPlaner, Trip, Plan, Friends, Family" />
    <nav>
      <RouterLink :to="routeURL" class="logo-container"><img scr="#" alt="Logo">UrlaubPlaner</RouterLink>
      <div class="spacer"></div>
      <button v-if="active" @click="click"><img src="@/assets/logos/icons8-information.svg" alt="Notification"></button>
      <ul>
        <li><RouterLink to="/plan">Plan</RouterLink></li>
        <li><RouterLink to="/expense">Expense</RouterLink></li>
        <li><RouterLink to="/recommendation">Recommendation</RouterLink></li>
      </ul>
      <Button v-if="user===null" @click="$router.push('/signin')" btnText="Sign In"/>
      <Button v-if="user===null" @click="$router.push('/signup')" btnText="Sign Up"/>
      <Button v-else @click="$router.push('/signout')" btnText="Sign Out"/>
    </nav>
    <Toast v-if="isClicked" messageTitle="Success" messageContent="Test successed" @click="close"/>
  </header>

  <main>
    <RouterView />
  </main>

  <footer></footer>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { computed, ref } from 'vue'
import Button from './components/Button.vue'
import Toast from './components/Toast.vue'

const store = useStore();
const user = computed(() => store.state.user);
const routeURL = computed(() => (user.value!==null ? '/user' : '/'));

const active = computed(() => {
  if (store.state.user === null) {
    return false;
  }
  return !store.state.user.emailVerified;
});

const isClicked = ref(false);
const click = () => {
  isClicked.value = true;
}

const close = () => {
  isClicked.value = false;
}

</script>

<style scoped>
header {
  flex: 0 0 auto;
}

main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

footer {
  flex: 0 0 auto;
}

header > nav {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-left: 1rem;
  padding-right: 1rem;
  background-color: #fff;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  font-weight: 700;
}

.spacer {
  flex: 1 1 auto;
}

header > nav > button {
  border: none;
  outline: none;
  background-color: transparent;
  padding: 0;
}

header > nav > ul {
  display: flex;
  align-items: center;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

.router-link-exact-active:not(.btn) {
  color: #1994eb;
}

@media (min-width: 1024px) {}
</style>
