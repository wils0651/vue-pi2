<template>
    <div class="border border-gray-800 bg-gray-200 m-3 rounded-sm max-w-lg">
        <div class="mx-3 my-2">
            <h2 class="text-xl font-bold text-gray-800 tracking-tight mb-2">{{ computerInfo.computerName }}</h2>
        </div>
        <div class="mx-4 my-1">
            <div class="flex flex-row">
                <h4 class="text-sm font-bold text-gray-800 tracking-tight mb-3">{{ computerInfo.ipAddress }}</h4>
            </div>
            <div class="flex flex-row border border-gray-300 bg-gray-100">
                <p class="text-m font-bold text-gray-800 tracking-tight my-2 ml-2 mr-2">Last Task</p>
                <p class="text-m text-gray-800 tracking-tight my-2 mr-2 border-l border-gray-500 pl-2">{{
                    computerInfo.computerTaskName }}</p>
                <p class="text-m text-gray-800 tracking-tight my-2 mr-2 border-l border-gray-500 pl-2">{{
                    formatDate(computerInfo.messageDate) }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatDate } from "@/shared/formatters";

defineProps({
    computerInfo: { required: true, type: Object }
});
</script>