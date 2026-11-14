<template>
  <div class="threat-grid w-full">
    <div ref="gridEl"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import { buildColumns, getCardTypeConfig, SANITIZERS, sanitizeValue } from "@/constants/cardTypes";

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: "500px",
  },
  // 카드 종류 (threat = 위협 / monster = 괴물) — 컬럼 구성과 기본값이 달라진다
  cardType: {
    type: String,
    default: "threat",
  },
});

// 카드 종류별 컬럼에 편집 시 값 정화(mutatorEdit)를 결합
// (cardType 은 생성 시 고정이므로 마운트 시점에 한 번만 만든다)
const columns = buildColumns(props.cardType).map((column) =>
  SANITIZERS[column.field]
    ? { ...column, mutatorEdit: (value) => sanitizeValue(column.field, value) }
    : { ...column }
);

const emit = defineEmits(["update:rows"]);

const gridEl = ref(null);
let table = null;

onMounted(() => {
  table = new Tabulator(gridEl.value, {
    data: props.rows,
    height: props.height,
    layout: "fitColumns",
    // 붙여넣기(엑셀에서 복사 → Ctrl+V) 활성화
    clipboard: true,
    clipboardPasteAction: "insert",
    editTriggerEvent: "dblclick",
    placeholder: "데이터가 없습니다.",
    columns,
  });

  table.on("dataChanged", (data) => {
    emit("update:rows", data);
  });
});
onBeforeUnmount(() => {
  if (table) {
    table.destroy();
    table = null;
  }
});

// 현재 그리드 데이터를 JSON(배열)으로 반환
function getJson() {
  return table ? table.getData() : [];
}

// JSON(배열)로 그리드 데이터 교체
function setJson(rows) {
  if (table) {
    table.replaceData(rows || []);
  }
}

// 빈 행 추가 (카드 종류별 기본값 병합) / 선택한 행 삭제
function addRow(row) {
  if (table) {
    const defaults = getCardTypeConfig(props.cardType).defaults;
    table.addRow({ ...defaults, ...(row || {}) });
  }
}

// 모든 행 삭제 (행이 없는 상태로 초기화)
function clearRows() {
  if (!table) return;
  table.clearData();
  // clearData() 의 dataChanged 가 발생하지 않는 버전도 있어 직접 알린다
  emit("update:rows", []);
}

function deleteSelected() {
  if (!table) return;
  const rows = table.getSelectedRows();
  if (rows.length) {
    table.deleteRow(rows);
  }
}

// CSV 파일 가져오기 (xlsx는 SheetJS 별도 등록 필요)
function importCsv() {
  if (table) {
    table.import("csv", ".csv");
  }
}

// 부모에서 ref 로 접근할 수 있도록 메서드 노출
defineExpose({ getJson, setJson, addRow, clearRows, deleteSelected, importCsv });
</script>

<style>
/* 그리드 에디터 입력값 가운데 정렬 (구 App.vue 의 input 규칙 대체) */
.threat-grid input {
  text-align: center;
}

/* 밝은 테마 (Tabulator 기본 CSS 위에 덮어쓰기) */
.threat-grid .tabulator {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  color: #1e293b;
  font-size: 13px;
}

.threat-grid .tabulator .tabulator-header {
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.threat-grid .tabulator .tabulator-header .tabulator-col {
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.threat-grid .tabulator .tabulator-header .tabulator-col .tabulator-col-content {
  padding: 8px;
}

.threat-grid .tabulator .tabulator-row {
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.threat-grid .tabulator .tabulator-row.tabulator-row-even {
  background-color: #fafbfc;
}

.threat-grid .tabulator .tabulator-row.tabulator-selectable:hover {
  background-color: #eff6ff;
}

.threat-grid .tabulator .tabulator-row .tabulator-cell {
  border-right: 1px solid #f1f5f9;
  padding: 6px 8px;
}

.threat-grid .tabulator .tabulator-row .tabulator-cell.tabulator-editing {
  background-color: #ffffff;
  outline: 2px solid #60a5fa;
  outline-offset: -2px;
}

.threat-grid .tabulator .tabulator-footer {
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  color: #475569;
}

.threat-grid .tabulator .tabulator-placeholder .tabulator-placeholder-contents {
  color: #94a3b8;
  font-size: 14px;
}
</style>
