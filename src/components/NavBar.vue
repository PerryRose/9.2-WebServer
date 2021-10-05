<template>
    <div id="nav">
        <!-- Nav Bar Logo -->
        <router-link class="nav-logo" to="/">IoT Light Solution</router-link>

        <!-- Nav Bar items -->
        <div class="nav-items">
            <router-link class="nav-item" to="/">Lights & Rooms</router-link> |
            <router-link class="nav-item" to="/schedules">Schedules</router-link>
        </div>
    </div>
</template>

<style scoped>
#nav {
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.nav-items a {
  font-weight: bold;
  color: white;
  text-decoration: none;
  font-size: 1.5em;
}
.nav-logo {
  padding-left: 1em;
  display: block;
  font-size: 2em;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
  color: white;
  text-decoration: none;
}
.nav-item {
  padding: 1em;
}
.nav-items a.router-link-exact-active {
  color: #879eb6;
}
#nav a:hover {
  color:#879eb6;
}
</style>