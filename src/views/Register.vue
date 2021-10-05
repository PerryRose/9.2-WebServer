<template>
    <h1>Create an Account</h1>

    <span v-if="responseMessage">
        {{ responseMessage }}
    </span>

    <p><input type="text" placeholder="First Name" v-model="firstName" /></p>
    <p><input type="text" placeholder="Last Name" v-model="lastName" /></p>
    <p><input type="text" placeholder="Email" v-model="email" /></p>
    <p><input type="password" placeholder="Password" v-model="password" /></p>

    <p>Have an account? <button @click="router.push('/login')">Log In</button></p>

    <p><button @click="register">Register</button></p>

</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const axios = require('axios');
const restServerAddress = 'http://RESTLoadBalancer-1559106515.ap-southeast-2.elb.amazonaws.com:3000';

const firstName = ref();
const lastName = ref();
const email = ref();
const password = ref();
const responseMessage = ref();

// Check if User is logged in
if (document.cookie) {
    // User is logged in
    router.push('/');
}

async function register() {
    try {
        await axios.post(restServerAddress + '/users', JSON.stringify({
            "firstName": firstName.value,
            "lastName": lastName.value,
            "email": email.value,
            "password": password.value
        }), {
            headers: {
                "Content-type": "application/json"
            }
        });

        logIn();
    }
    catch (err) {
        console.log(err.response.data.error);
    }
}

async function logIn() {
    try {
        const res = await axios.post(restServerAddress + '/auth', JSON.stringify({
            "email": email.value,
            "password": password.value
        }), {
            headers: {
                "Content-type": "application/json"
            }
        });

        const accessToken = res.data.accessToken;
        const refreshToken = res.data.refreshToken;

        responseMessage.value = 'Success';

        document.cookie = `accessToken=${accessToken}; path=/;`;
    
        console.log(`Received ${accessToken}\n${refreshToken}`);

        router.push('/');
    } 
    catch (err) {
        const errorMessage = err.response.data;
        responseMessage.value = errorMessage;
    }

}

</script>