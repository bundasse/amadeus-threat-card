<template>
  <section class="px-5 pb-8">
    <!-- 그리드 도구 -->
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <span class="font-bold text-lg text-slate-800">{{ config.label }}</span>
      <span class="text-slate-500 text-sm">({{ rows.length }}행)</span>
      <span class="flex-1"></span>
      <button
        class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-3 py-1.5 rounded-lg"
        @click="gridRef && gridRef.addRow()"
      >
        행 추가
      </button>
      <button
        class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-3 py-1.5 rounded-lg"
        @click="gridRef && gridRef.deleteSelected()"
      >
        선택 삭제
      </button>
      <button
        class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-3 py-1.5 rounded-lg"
        @click="gridRef && gridRef.importCsv()"
      >
        CSV 가져오기
      </button>
    </div>

    <!-- 카드 종류에 맞춘 그리드 -->
    <ThreatCardGrid
      ref="gridRef"
      :card-type="cardType"
      :height="gridHeight"
      @update:rows="onRowsUpdate"
    />

    <!-- 규격 선택 + 다운로드/인쇄 -->
    <CardBatchDownload
      class="mt-5"
      :card-type="cardType"
      :rows="rows"
      :default-format="defaultFormat"
    />
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import ThreatCardGrid from "./ThreatCardGrid.vue";
import CardBatchDownload from "./CardBatchDownload.vue";
import { getCardTypeConfig } from "@/constants/cardTypes";

const props = defineProps({
  // 카드 종류 (threat = 위협 / monster = 괴물)
  cardType: {
    type: String,
    required: true,
  },
  // 그리드 높이
  gridHeight: {
    type: String,
    default: "480px",
  },
  // 카드 이미지 형식 기본값
  defaultFormat: {
    type: String,
    default: "png",
  },
});

const config = computed(() => getCardTypeConfig(props.cardType));

// 그리드에서 편집된 데이터 (다운로드/인쇄의 원본)
const rows = ref([]);

const gridRef = ref(null);

// 그리드에서 편집된 행 데이터를 동기화 (script setup 의 ref 는 템플릿에서 .value 로 대입)
function onRowsUpdate(newRows) {
  rows.value = newRows;
}
</script>
