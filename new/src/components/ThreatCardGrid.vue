<template>
  <div class="threat-grid w-full">
    <div ref="gridEl"></div>
  </div>
</template>

<script>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

export default {
  name: "ThreatCardGrid",
  props: {
    // 초기 데이터 (없으면 빈 그리드)
    rows: {
      type: Array,
      default: () => [],
    },
    height: {
      type: String,
      default: "500px",
    },
  },
  emits: ["update:rows"],
  data() {
    return {
      table: null,
    };
  },
  mounted() {
    this.table = new Tabulator(this.$refs.gridEl, {
      data: this.rows,
      height: this.height,
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

    this.table.on("dataChanged", (data) => {
      this.$emit("update:rows", data);
    });
  },
  beforeUnmount() {
    if (this.table) {
      this.table.destroy();
      this.table = null;
    }
  },
  methods: {
    // 현재 그리드 데이터를 JSON(배열)으로 반환
    getJson() {
      return this.table ? this.table.getData() : [];
    },
    // JSON(배열)로 그리드 데이터 교체
    setJson(rows) {
      if (this.table) {
        this.table.replaceData(rows || []);
      }
    },
    // 빈 행 추가 / 선택한 행 삭제
    addRow(row) {
      if (this.table) {
        this.table.addRow(row || {});
      }
    },
    deleteSelected() {
      if (!this.table) return;
      const rows = this.table.getSelectedRows();
      if (rows.length) {
        this.table.deleteRow(rows);
      }
    },
    // CSV 파일 가져오기 (xlsx는 SheetJS 별도 등록 필요)
    importCsv() {
      if (this.table) {
        this.table.import("csv", ".csv");
      }
    },
  },
};
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
