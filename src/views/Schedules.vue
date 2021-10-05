<template>
    <h1>Schedules</h1>

    <span v-if="!isLoading">
        <!-- Finished Loading -->

        <button @click="router.push('/create-schedule')" style="margin:1.5em;">Create Schedule</button>

        <span v-if="schedules.length !== 0">
            <!-- Schedules Exist -->

            <div v-for="(schedule, index) in schedules"
                v-bind:key="schedule">

                <table class="table">
                    <tr>
                        <td colspan="2">
                            <span v-if="isEditing && editingScheduleIndex == index">
                                <!-- Updating Schedule Name -->
                                <h2>
                                    <input v-model="schedule.name" type="text" />
                                    <button @click="updateScheduleName(schedule._id, schedule.name)">
                                        Update
                                    </button>
                                </h2>
                            </span>
                            <span v-else>
                                <!-- Not Updating Schedule Name -->
                                <h2>
                                    {{ schedule.name }}
                                    <button @click="beginEditingScheduleName(index)">
                                        Rename
                                    </button>
                                    <button @click="deleteSchedule(schedule._id)">
                                        Delete
                                    </button>
                                </h2>
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <th>At</th>
                        <td>
                            {{ schedule.startTime }}
                        </td>
                    </tr>
                    <tr>
                        <th>Set room</th> 
                        <td>
                            {{ schedule.roomName }}
                        </td>
                    </tr>
                    <tr>
                        <th>To</th>
                        <td>
                            {{ schedule.action }}
                        </td>
                    </tr>
                    <tr>
                        <th>With Brightness</th>
                        <td>
                            {{ schedule.brightness }}
                        </td>
                    </tr>
                </table>
                <br>
            </div>

        </span>
        <span v-else>
            <!-- No Schedules -->
            <br>
            No Schedules have been created
        </span>

    </span>
    <span v-else>
        <h2>Loading...</h2>
    </span>

</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const axios = require('axios');
const router = useRouter();
const mqtt = require('mqtt');
const client = mqtt.connect('ws://wbe99751.ap-southeast-1.emqx.cloud:8083/mqtt', {
    username: 'perryrose',
    password: 'XyK9x8imaeU6dp2'
});

const baseTopic = '/sit-314-task92';
const outgoingTopic = baseTopic + '/from/website';
const restServerAddress = 'http://RESTLoadBalancer-1559106515.ap-southeast-2.elb.amazonaws.com:3000';

const isLoading = ref(true);
const isEditing = ref(false);
const editingScheduleIndex = ref();
const schedules = ref([]);
let accessToken;

// If user is logged out
if (!document.cookie) {
    // User is logged out
    router.push('/login');
}
else {
    // User is logged in
    accessToken = document.cookie.split("accessToken=")[1];

    getSchedules();
}

// Get Schedules from Server
async function getSchedules() {
    // Get request
    const res = await axios.get(restServerAddress + '/get-schedules', {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    // Get data
    const schedulesArray = res.data;

    // Add schedules to array
    schedulesArray.forEach(schedule => {
        schedules.value.unshift(schedule);
    });

    // Finish Loading
    isLoading.value = false;
}

function beginEditingScheduleName(index) {
    isEditing.value = true;
    editingScheduleIndex.value = index;
}

async function updateScheduleName(scheduleId, newName) {
    // Post request
    const res = await axios.post(restServerAddress + '/update-schedule-name', { scheduleId: scheduleId, newName: newName }, {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    // If no error
    if (res.status !== 403) {
        // For each schedule
        schedules.value.forEach(schedule => {
            // For current schedule
            if (schedule._id === scheduleId) {
                // Update name
                schedule.name = newName;

                // Stop editing
                isEditing.value = false;
                editingScheduleIndex.value = -1;
            }
        });
    }
    else {
        // Log error
        console.log(res.data);
    }
}

async function deleteSchedule(scheduleId) {
    // Confirm with user
    if (confirm('Are you sure you want to delete this Schedule?')) {
        // Post request
        const res = await axios.post(restServerAddress + '/delete-schedule', { scheduleId: scheduleId }, {
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });


        // If no error
        if (res.status !== 403) {
            // Remove Schedule
            schedules.value = schedules.value.filter(schedule => schedule._id != scheduleId);

            // Tell Control Server a Schedule has been deleted
            client.publish(outgoingTopic + '/delete-schedule', scheduleId);
        }
        else {
            // Log error
            console.log(res.data);
        }
    }
}

</script>