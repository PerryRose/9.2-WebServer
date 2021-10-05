<template>
    <h1>Create A Schedule</h1>

    <div class="response-message" v-if="responseMessage">
        <h3>{{ responseMessage }}</h3><button @click="router.push('/schedules')">Go Back</button>
    </div>
    <div v-else>
        <br>
    </div>

    <span v-if="!isLoading">
    <!-- Finished Loading -->

        <table class="table">
            <tr>
                <th>Name</th>
                <td>
                    <input v-model="scheduleName" type="text" placeholder="Schedule Name" />
                </td>
            </tr>
            <tr>
                <th>At</th>
                <td>
                    <input v-model="startTime" type="text" placeholder="Start Time (24hr)"/>
                </td>
            </tr>
            <tr>
                <th>Set room</th> 
                <td>
                    <select v-model="roomId">
                        <option disabled value="">Select a Room</option>
                        <option v-for="room in rooms"
                            v-bind:key="room" v-bind:value="room._id">
                            {{ room.name }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr>
                <th>To</th>
                <td>
                    <select v-model="action">
                        <option disabled value="">Select an Action</option>
                        <option value="Turn On">Turn On</option>
                        <option value="Turn Off">Turn Off</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th>With Brightness</th>
                <td>
                    <input v-model="brightness" type="text" placeholder="100%" />
                </td>
            </tr>
        </table>

        <button @click="createNewSchedule">Create Schedule</button>

    </span>
    <span v-else>
        <h2>Loading...</h2>
    </span>

</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const axios = require('axios');
const mqtt = require('mqtt');
const router = useRouter();
const client = mqtt.connect('ws://wbe99751.ap-southeast-1.emqx.cloud:8083/mqtt', {
    username: 'perryrose',
    password: 'XyK9x8imaeU6dp2'
});

const baseTopic = '/sit-314-task92';
const outgoingTopic = baseTopic + '/from/website';

const isLoading = ref(true);
const rooms = ref([]);

const scheduleName = ref('');
const startTime = ref('');
const roomId = ref('');
const action = ref('');
const brightness = ref('');
const responseMessage = ref();
const restServerAddress = 'http://RESTLoadBalancer-1559106515.ap-southeast-2.elb.amazonaws.com:3000';
let accessToken;

// If user is logged out
if (!document.cookie) {
    // User is logged out
    router.push('/login');
}
else {
    // User is logged in
    accessToken = document.cookie.split("accessToken=")[1];

    getRooms();
}

// Get Rooms from Server
async function getRooms() {
    // Get request
    const res = await axios.get(restServerAddress + '/get-rooms', {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    // Get data
    const roomArray = res.data;

    // Add rooms to array
    roomArray.forEach(room => {
        rooms.value.unshift(room);
    })

    // Finish Loading
    isLoading.value = false;
}

async function createNewSchedule() {
    // Get Room Name from Id
    const roomName = rooms.value.find(room => room._id == roomId.value).name;

    // POST Request
    const res = await axios.post(restServerAddress + '/create-schedule', {
        name: scheduleName.value,
        startTime: startTime.value,
        roomId: roomId.value,
        roomName: roomName,
        action: action.value,
        brightness: brightness.value
    }, {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    // If no error
    if (res.status !== 403) {
        responseMessage.value = 'Success';

        // Tell Control Server there's a new Schedule
        client.publish(outgoingTopic + '/add-schedule', JSON.stringify({
            name: scheduleName.value,
            startTime: startTime.value,
            roomId: roomId.value,
            roomName: roomName,
            action: action.value,
            brightness: brightness.value
        }));

    }
    else {
        // Error
        responseMessage.value = 'There was an error';
    }
}
</script>

<style scoped>
input, select {
    width: 80%;
}

button {
    margin: 1.5em;
}
</style>