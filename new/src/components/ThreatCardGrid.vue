<template>
  <div class="threat-grid w-full">
    <div ref="gridEl"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: "500px",
  },
});

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
    columns: [
      { title: "이름", field: "name", editor: "input", widthGrow: 2 },
      { title: "태그", field: "tags", editor: "input", widthGrow: 2 },
      {
        title: "레벨",
        field: "level",
        editor: "number",
        editorParams: { min: 1, max: 99 },
        hozAlign: "center",
        width: 80,
      },
      { title: "공격력", field: "attack", editor: "input", hozAlign: "center", width: 90 },
      { title: "방어력", field: "guard", editor: "input", hozAlign: "center", width: 90 },
      { title: "생명력", field: "hp", editor: "input", hozAlign: "center", width: 90 },
      {
        title: "묘사",
        field: "desc",
        editor: "textarea",
        editorParams: { verticalNavigation: "editor" },
        widthGrow: 3,
      },
      {
        title: "효과",
        field: "effect",
        editor: "textarea",
        editorParams: { verticalNavigation: "editor" },
        widthGrow: 3,
      },
    ],
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

// 빈 행 추가 / 선택한 행 삭제
function addRow(row) {
  if (table) {
    table.addRow(row || {});
  }
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
defineExpose({ getJson, setJson, addRow, deleteSelected, importCsv });
</script>

<style>
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
