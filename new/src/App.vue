<template>
  <div class="w-full min-h-screen bg-slate-200">
    <div class="max-w-7xl mx-auto bg-white pb-10">
      <h1 class="text-5xl font-bold py-10 ml-5 mb-6">신화창세RPG 아마데우스 위협/괴물 카드 생성기</h1>
      <CardTypeTabs />
    </div>
    <div class="max-w-7xl mx-auto bg-gray-800 text-gray-400 p-10 text-sm">
      페이지 제작자: 녹조하임 (트위터 <a href="https://twitter.com/FF14_dasse" class="underline">@FF14_dasse</a>)
    </div>
  </div>
</template>

<script setup>
import CardTypeTabs from "@/components/CardTypeTabs.vue";
</script>
