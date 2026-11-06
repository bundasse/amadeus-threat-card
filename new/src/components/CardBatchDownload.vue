<template>
  <div class="w-full">
    <!-- 컨트롤 -->
    <div class="flex flex-wrap items-center gap-3">
      <select
        v-model="format"
        :disabled="locked"
        class="border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
      >
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
      </select>

      <button
        :disabled="locked || !rows || !rows.length"
        class="bg-green-500 hover:bg-green-300 text-white hover:text-black text-center px-5 py-2 rounded-lg disabled:opacity-50 disabled:hover:bg-green-500 disabled:hover:text-white"
        @click="downloadZip"
      >
        {{ busy ? `생성 중 ${done}/${total}` : "카드 이미지 ZIP 다운로드" }}
      </button>

      <button
        :disabled="locked || !rows || !rows.length"
        class="bg-slate-700 hover:bg-slate-400 text-white hover:text-black text-center px-5 py-2 rounded-lg disabled:opacity-50 disabled:hover:bg-slate-700 disabled:hover:text-white"
        @click="printAll"
      >
        인쇄
      </button>

      <button
        v-if="busy"
        class="bg-rose-500 hover:bg-rose-300 text-white hover:text-black text-center px-4 py-2 rounded-lg"
        @click="cancel"
      >
        취소
      </button>

      <span v-if="message" class="text-sm" :class="isError ? 'text-rose-500' : 'text-slate-600'">
        {{ message }}
      </span>
    </div>

    <!-- 진행률 -->
    <div v-if="busy" class="w-full h-2 bg-slate-200 rounded overflow-hidden mt-3">
      <div class="h-full bg-green-500 transition-all" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 화면 밖 렌더 영역 (인쇄/캡처용, 사용자에게 보이지 않음) -->
    <div v-if="renderCards && renderCards.length" ref="stage" class="card-export-stage" aria-hidden="true">
      <div v-for="(card, index) in renderCards" :key="index" class="card-export-item">
        <ThreatCardFace v-bind="card" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import ThreatCardFace from "./ThreatCardFace.vue";
import { downloadCardsZip, printCards as printCardsToWindow } from "@/utils/cardExport";

const props = defineProps({
  // Tabulator 그리드에서 넘어온 행 데이터 배열
  rows: {
    type: Array,
    default: () => [],
  },
  // zip 파일명 (생략 시 cards_타임스탬프)
  fileName: {
    type: String,
    default: "",
  },
  // 이미지 배율 (2 = 1182 x 1774)
  pixelRatio: {
    type: Number,
    default: 2,
  },
  defaultFormat: {
    type: String,
    default: "png",
  },
});

const format = ref(props.defaultFormat);
const busy = ref(false);
const printing = ref(false);
const canceled = ref(false);
const done = ref(0);
const total = ref(0);
const message = ref("");
const isError = ref(false);

// 화면 밖 렌더 영역 / 카드 목록
const stage = ref(null);
const renderCards = ref(null);

const locked = computed(() => busy.value || printing.value);
const progressPercent = computed(() => {
  if (!total.value) return 0;
  return Math.round((done.value / total.value) * 100);
});

// 그리드 행 데이터 -> 카드 props 로 변환 (없는 값은 기본값)
function normalizeRow(row = {}) {
  const name = row.name || "";
  const card = {
    imageUrl: row.imageUrl || row.cardType || "card_threat.png",
    name,
    tags: row.tags || "",
    level: row.level ?? 1,
    mAttr: row.mAttr || "적",
    tAttr: row.tAttr || row.attr || "공격",
    tDice: row.tDice || row.dice || "무용",
    tDamage: row.tDamage ?? row.damage ?? "",
    attack: row.attack ?? null,
    guard: row.guard ?? null,
    hp: row.hp ?? null,
    desc: row.desc || "",
    effect: row.effect || "",
  };
  // 이름이 길면 App.vue 와 동일하게 작은 글씨 사용
  card.nameFontSize = row.nameFontSize || (name.length > 14 ? "text-4xl" : "text-5xl");
  return card;
}

// 카드 props 로 변환된 배열
function buildCards(rows) {
  return (rows || []).map((row) => normalizeRow(row));
}

async function downloadZip() {
  if (locked.value) return;

  isError.value = false;
  message.value = "";
  done.value = 0;
  total.value = 0;
  canceled.value = false;
  renderCards.value = buildCards(props.rows);
  busy.value = true;

  try {
    // 카드 DOM 이 화면 밖에 렌더링될 때까지 대기
    await nextTick();

    if (!stage.value) throw new Error("카드 렌더 영역을 찾을 수 없습니다.");

    const items = stage.value.querySelectorAll(".card-export-item");
    total.value = items.length;

    await downloadCardsZip(items, {
      fileName: props.fileName || `cards_${Date.now()}`,
      format: format.value,
      pixelRatio: props.pixelRatio,
      onProgress: (count, countTotal) => {
        done.value = count;
        total.value = countTotal;
      },
      shouldCancel: () => canceled.value,
    });

    message.value = `${total.value}장 다운로드 완료`;
  } catch (e) {
    if (e && e.message === "CANCELED") {
      message.value = "다운로드를 취소했습니다.";
    } else {
      isError.value = true;
      message.value = (e && e.message) || "다운로드에 실패했습니다.";
      console.error("[CardBatchDownload]", e);
    }
  } finally {
    busy.value = false;
    renderCards.value = null;
    done.value = 0;
  }
}

async function printAll() {
  if (locked.value) return;

  isError.value = false;
  message.value = "";
  renderCards.value = buildCards(props.rows);
  printing.value = true;

  try {
    await nextTick();

    if (!stage.value) throw new Error("카드 렌더 영역을 찾을 수 없습니다.");

    await printCardsToWindow(stage.value.querySelectorAll(".card-export-item"));
    message.value = "인쇄 창을 열었습니다. (카드 1장 = 1페이지)";
  } catch (e) {
    isError.value = true;
    message.value = (e && e.message) || "인쇄에 실패했습니다.";
    console.error("[CardBatchDownload]", e);
  } finally {
    printing.value = false;
    renderCards.value = null;
  }
}

function cancel() {
  canceled.value = true;
}

defineExpose({ downloadZip, printAll });
</script>

<style scoped>
/* 사용자 화면 밖에 렌더링해서 캡처 (display:none 이면 레이아웃이 계산되지 않음) */
.card-export-stage {
  position: fixed;
  top: 0;
  left: -100000px;
  width: 591px;
  pointer-events: none;
}

.card-export-item {
  width: 591px;
  height: 887px;
  overflow: hidden;
}
</style>
