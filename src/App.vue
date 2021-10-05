<template>
  <NavBar/>
  <router-view/>
</template>

<script setup>
import NavBar from "../src/components/NavBar.vue";
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
    margin: 0;
    background: #f5f6f7;
}

h1 {
    margin-bottom: 0;
}

.table {
    margin-left: auto;
    margin-right: auto;
    border-collapse: collapse;
    width: 380px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.table td, .table th {
  border: 1px solid rgb(211, 210, 210);
  padding: 8px;
}

.table tr:nth-child(odd){
    background-color: #fafafa;
}

.table tr:nth-child(even){
    background-color: #e6e6e6;
}

.table tr:hover {
    background-color: #ddd;
}

button {
    margin-left: 0.25em;
    margin-right: 0.25em;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 1s ease;
    height: 230px;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    height: 0;
}

.fade-light-enter-active,
.fade-light-leave-active {
    transition: all 1s ease;
    height: 39px;
}
.fade-light-enter-from,
.fade-light-leave-to {
    opacity: 0;
    height: 0;
}

.response-message {
    margin-bottom: 1em; 
    display: flex; 
    align-items: center; 
    justify-content: center;
}
</style>
