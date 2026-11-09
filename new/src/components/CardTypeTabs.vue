<template>
  <div>
    <!-- 카드 종류 탭 -->
    <div class="flex gap-2 px-5 mb-4 border-b border-slate-200" role="tablist">
      <button
        v-for="type in CARD_TYPE_ORDER"
        :key="type"
        role="tab"
        :aria-selected="active === type"
        :class="[
          'px-5 py-2 rounded-t-lg font-bold transition-colors',
          active === type
            ? 'bg-slate-700 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        ]"
        @click="active = type"
      >
        {{ CARD_TYPES[type].label }}
      </button>
    </div>

    <!-- 두 탭을 모두 마운트하고 v-show 로 전환한다.
         (Tabulator 를 파괴/재생성하지 않으므로 탭을 바꿔도 입력 데이터·스크롤·선택이 유지된다) -->
    <CardBatchPanel v-show="active === 'threat'" card-type="threat" />
    <CardBatchPanel v-show="active === 'monster'" card-type="monster" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import CardBatchPanel from "./CardBatchPanel.vue";
import { CARD_TYPES, CARD_TYPE_ORDER } from "@/constants/cardTypes";

// 현재 선택된 탭 (threat = 위협 / monster = 괴물)
const active = ref("threat");
</script>
