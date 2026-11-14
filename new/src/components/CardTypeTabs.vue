<template>
  <div>
    <!-- 카드 종류 탭 -->
    <div class="flex items-center gap-2 px-5 mb-4 border-b border-slate-200">
      <div class="flex gap-2" role="tablist">
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

      <span class="flex-1"></span>

      <!-- 위협/괴물 탭 어디에서나 보이며, 현재 표시 중인 탭의 그리드만 초기화한다 -->
      <button
        class="bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold px-3 py-1.5 rounded-lg border border-rose-200"
        @click="clearActiveGrid"
      >
        그리드 초기화
      </button>
    </div>

    <!-- 두 탭을 모두 마운트하고 v-show 로 전환한다.
         (Tabulator 를 파괴/재생성하지 않으므로 탭을 바꿔도 입력 데이터·스크롤·선택이 유지된다) -->
    <CardBatchPanel v-show="active === 'threat'" ref="threatPanel" card-type="threat" />
    <CardBatchPanel v-show="active === 'monster'" ref="monsterPanel" card-type="monster" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import CardBatchPanel from "./CardBatchPanel.vue";
import { CARD_TYPES, CARD_TYPE_ORDER } from "@/constants/cardTypes";

// 현재 선택된 탭 (threat = 위협 / monster = 괴물)
const active = ref("threat");

// 각 탭 패널 (그리드 초기화를 위해 ref 로 접근)
const threatPanel = ref(null);
const monsterPanel = ref(null);

// 현재 표시 중인 탭의 그리드만 비운다 (다른 탭 데이터는 유지)
function clearActiveGrid() {
  const panel = active.value === "threat" ? threatPanel.value : monsterPanel.value;
  if (!panel) return;

  const label = CARD_TYPES[active.value].label;
  if (!window.confirm(`${label} 그리드의 입력값을 모두 지웁니다. 계속할까요?`)) return;

  panel.clearRows();
}
</script>
