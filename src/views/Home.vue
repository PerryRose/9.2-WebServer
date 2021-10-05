<template>
    <h1>Lights & Rooms</h1>

    <span v-if="!isLoading">
        <!-- Finished Loading -->

        <button @click="createNewRoom" style="margin:1.5em;">Create Room</button>

        <span v-if="rooms.length !== 0">
            <!-- Rooms Exist -->

            <transition-group name="fade">
                <div v-for="(room, index) in rooms"
                    v-bind:key="room">

                    <table class="table">
                        <tr>
                            <!-- Room Name -->
                            <td colspan="4">
                                <span v-if="isEditing && editingRoomIndex == index">
                                    <!-- Updating Room Name -->
                                    <h2>
                                        <input v-model="room.name" type="text" />
                                        <button @click="updateRoomName(room._id, room.name)">
                                            Update
                                        </button>
                                    </h2>
                                </span>
                                <span v-else>
                                    <!-- Not Updating Room Name -->
                                    <h2>
                                        {{ room.name }}
                                        <button @click="beginEditingRoomName(index)">
                                            Rename
                                        </button>
                                        <button @click="deleteRoom(room._id)">
                                            Delete
                                        </button>
                                    </h2>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <th>Light Id</th>
                            <th>State</th>
                            <th>Brightness</th>
                            <th>Actions</th>
                        </tr>
                        <!-- Room has Lights -->
                        <transition-group name="fade-light">
                            <tr v-for="light in room.lights"
                                v-bind:key="light">
                                <td>{{ light.id }}</td>
                                <td>{{ light.state }}</td>
                                <td>{{ light.brightness }}</td>
                                <td>
                                    <button @click="changeLightState(room._id, light.id, light.state == 'On' ? 'Off' : 'On')">
                                        Turn {{ light.state == 'On' ? 'Off' : 'On' }}
                                    </button>
                                    <button @click="deleteLight(room._id, light.id)">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </transition-group>
                        <!-- Room doesn't have Lights -->
                        <tr v-if="room.lights.length === 0">
                            <td colspan="4">
                                No lights have been created
                            </td>
                        </tr>
                        <!-- Create new Light -->
                        <tr>
                            <td colspan="4">
                                <button @click="createNewLight(room._id)">Create Light</button>
                            </td>
                        </tr>
                    </table>
                    <br>
                </div>
            </transition-group>
        </span>
        <span v-else>
            <!-- No Rooms -->
            <br>
            No Rooms have been created
        </span>

    </span>
    <span v-else>
        <h2>Loading...</h2>
    </span>

    <button @click="logout">Log Out</button>

</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const axios = require('axios');
const mqtt = require('mqtt');
const client = mqtt.connect('ws://wbe99751.ap-southeast-1.emqx.cloud:8083/mqtt', {
    username: 'perryrose',
    password: 'XyK9x8imaeU6dp2'
});
const baseTopic = '/sit-314-task92';
const outgoingTopic = baseTopic + '/from/website';
const incomingTopic = baseTopic + '/to/website';
const restServerAddress = 'http://RESTLoadBalancer-1559106515.ap-southeast-2.elb.amazonaws.com:3000';

const isLoading = ref(true);
const rooms = ref([]);

const isEditing = ref(false);
const editingRoomIndex = ref();

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
    });

    // Finish Loading
    isLoading.value = false;
}

async function createNewRoom() {
    // Get request
    const res = await axios.get(restServerAddress + '/create-room', {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    // If no error
    if (res.status !== 403) {
        // Add room to array
        rooms.value.unshift(res.data);
    }
    else {
        // Log error
        console.log(res.data);
    }
}

async function createNewLight(roomId) {
    // Post request
    const res = await axios.post(restServerAddress + '/create-light', { roomId: roomId }, {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    // If no error
    if (res.status !== 403) {
        // For each room
        rooms.value.forEach(room => {
            // Find current room
            if (room._id === roomId) {
                // Add light to lights
                room.lights.push(res.data);
            }
        })
    }
    else {
        // Log error
        console.log(res.data); // Does this actually work?
    }
}

function beginEditingRoomName(index) {
    isEditing.value = true;
    editingRoomIndex.value = index;
}

async function updateRoomName(roomId, newName) {
    // Post request
    const res = await axios.post(restServerAddress + '/update-room-name', { roomId: roomId, newName: newName }, {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    // If no error
    if (res.status !== 403) {
        // For each room
        rooms.value.forEach(room => {
            // For current room
            if (room._id === roomId) {
                // Update name
                room.name = newName;
                
                // Stop editing
                isEditing.value = false;
                editingRoomIndex.value = -1;
            }
        });
    }
    else {
        // Log error
        console.log(res.data);
    }
}

// Update Light State: Control Server -> Website
async function updateLightState(roomId, lightId, state) { 
    console.log(`Updating Light State: ${roomId}, ${lightId}, ${state}`);

    // For each room
    rooms.value.forEach(room => {
        // For current room
        if (room._id === roomId) {
            // For each light
            room.lights.forEach(light => {
                // For current light
                if (light.id === lightId) {
                    // Update state
                    light.state = state;
                }
            });
        }
    });
}

// Change Light State: Website -> REST API, Website -> Control Server
async function changeLightState(roomId, lightId, state) {
    console.log(`Changing Light State: ${roomId}, ${lightId}, ${state}`);

    // Post request
    const res = await axios.post(restServerAddress + '/update-light-state', { roomId: roomId, lightId: lightId, newState: String(state) }, {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    // If no error
    if (res.status !== 403) {
        // For each room
        rooms.value.forEach(room => {
            // For current room
            if (room._id === roomId) {
                // For each light
                room.lights.forEach(light => {
                    // For current light
                    if (light.id === lightId) {
                        // Update state
                        light.state = state;

                        // Tell control server
                        client.publish(outgoingTopic + '/update-state', JSON.stringify({
                            lightId: lightId,
                            newState: state
                        }));
                    }
                });
            }
        });
    }
    else {
        // Log error
        console.log(res.data);
    }
}

// async function updateAndChangeLightBrightness(roomId, lightId, brightness) {
//     // Change Brightness
//     const res = await axios.post(restServerAddress + '/update-light-brightness', { roomId: roomId, lightId: lightId, brightness: Number(brightness) });

//     // If no error
//     if (res.status !== 403) {
//         // For each room
//         rooms.value.forEach(room => {
//             // For current room
//             if (room._id === roomId) {
//                 // For each light
//                 room.lights.forEach(light => {
//                     // For current light
//                     if (light.id === lightId) {
//                         // Update Brightness
//                         light.brightness = brightness;
//                     }
//                 });
//             }
//         });
//     }
//     else {
//         // Log error
//         console.log(res.data);
//     }
// }

function updateLightBrightness(roomId, lightId, brightness) {
    // For each room
    rooms.value.forEach(room => {
        // For current room
        if (room._id === roomId) {
            // For each light
            room.lights.forEach(light => {
                // For current light
                if (light.id === lightId) {
                    // Update Brightness
                    light.brightness = brightness;
                }
            });
        }
    });
}

async function deleteRoom(roomId) {
    // Confirm with user
    if (confirm('Are you sure you want to delete this room?')) {
        // Post request
        const res = await axios.post(restServerAddress + '/delete-room', { roomId: roomId }, {
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

            // If no error
        if (res.status !== 403) {
            // Remove room
            rooms.value = rooms.value.filter(room => room._id != roomId);
        }
        else {
            // Log error
            console.log(res.data);
        }
    }
}

async function deleteLight(roomId, lightId) {
    // Confirm with user
    if (confirm('Are you sure you want to delete this light?')) {
        // Post request
        const res = await axios.post(restServerAddress + '/delete-light', { roomId: roomId, lightId: lightId }, {
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        // If no error
        if (res.status !== 403) {
            // For each room
            rooms.value.forEach(room => {
                // If current room
                if (room._id === roomId) {
                    // Remove light
                    room.lights = room.lights.filter(light => light.id != lightId);
                }
            });
        }
        else {
            // Log error
            console.log(res.data);
        }
    }
}

function logout() {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
}

//////////
// MQTT //
//////////
client.on('connect', () => {
    console.log('[mqtt connected]');

    // Subscribe to incoming messages
    client.subscribe(incomingTopic + '/#');
});

client.on('message', (topic, message) => {
    console.log(`[Incoming]: Topic: ${topic} - Message: ${message}`);

    // Listen for update
    if (topic.includes('/update-state')) {
        // Convert message to object
        const messageObj = JSON.parse(message);

        const roomId = messageObj.roomId;
        const lightId = messageObj.lightId;
        const newState = messageObj.newState;

        console.log(`Must update Light ${lightId}'s state to ${newState}`);

        updateLightState(roomId, lightId, newState);
    }
    else if (topic.includes('/update-brightness')) {
        // Convert message to object
        const messageObj = JSON.parse(message);

        const roomId = messageObj.roomId;
        const lightId = messageObj.lightId;
        const brightness = messageObj.brightness;

        console.log(`Must update Light ${lightId}'s brightness to ${brightness}`);

        updateLightBrightness(roomId, lightId, brightness);
    }
});
</script>