/**
 * 카드 종류별 설정 (위협 / 괴물) 단일 소스
 *
 * - label          : 탭에 표시할 이름
 * - imageUrl       : 카드 배경 이미지 파일명 (src/assets 기준)
 * - fileNamePrefix : ZIP 파일명 접두어
 * - hpLabel        : hp 컬럼 헤더 (내구도 / 생명력)
 * - attrField      : 속성 필드명 (위협 tAttr / 괴물 mAttr)
 * - defaults       : 새 행 추가 시 기본값
 * - requiredFields : 다운로드 전 반드시 입력해야 하는 컬럼 (비어 있으면 alert)
 * - extraColumns   : 카드 종류에만 있는 컬럼 (위협: 판정, 위력)
 */

export const CARD_TYPES = {
  threat: {
    type: "threat",
    label: "위협 카드",
    imageUrl: "card_threat.png",
    fileNamePrefix: "threat_cards",
    hpLabel: "내구도",
    attrField: "tAttr",
    attrOptions: ["공격", "술식"],
    defaults: {
      tAttr: "공격",
      tDice: "무용",
      tDamage: "",
    },
    // 다운로드 전 필수 입력 컬럼 (레벨 / 위력 / 공격치 / 방어치 / 내구도)
    requiredFields: ["level", "tDamage", "attack", "guard", "hp"],
    extraColumns: [
      {
        title: "판정",
        field: "tDice",
        editor: "list",
        editorParams: {
          values: ["무용", "기술", "두뇌", "영력", "애정", "일상"],
          autocomplete: true,
        },
        hozAlign: "center",
        width: 90,
      },
      {
        title: "위력",
        field: "tDamage",
        editor: "input",
        hozAlign: "center",
        width: 80,
      },
    ],
  },
  monster: {
    type: "monster",
    label: "본체 카드", // 구 UI 표기: "본체 카드"
    imageUrl: "card_monster.png",
    fileNamePrefix: "monster_cards",
    hpLabel: "생명력",
    attrField: "mAttr",
    attrOptions: ["적", "청", "녹", "백", "흑"],
    defaults: {
      mAttr: "적",
    },
    // 다운로드 전 필수 입력 컬럼 (생명력 / 이름 / 태그 / 레벨 / 공격치 / 방어치)
    requiredFields: ["hp", "name", "tags", "level", "attack", "guard"],
    extraColumns: [],
  },
};

// 탭 표시 순서
export const CARD_TYPE_ORDER = ["threat", "monster"];

export function getCardTypeConfig(type) {
  return CARD_TYPES[type] || CARD_TYPES.threat;
}

// 입력값 정화 규칙 (구 App.vue 의 check() 규칙을 필드별로 분리)
export const SANITIZERS = {
  level: /[^0-9]/g,
  attack: /[^0-9+-]/g,
  guard: /[^0-9+-]/g,
  hp: /[^0-9]/g,
  tDamage: /[^0-9+-dD]/g,
};

/**
 * 필드별로 허용되지 않는 문자를 제거
 * @param {string} field 필드명 (SANITIZERS 의 키)
 * @param {*} value 원본 값
 * @returns {string} 정화된 문자열 (규칙이 없는 필드는 문자열 그대로)
 */
export function sanitizeValue(field, value) {
  const text = value == null ? "" : String(value);
  const pattern = SANITIZERS[field];
  return pattern ? text.replace(pattern, "") : text;
}

/**
 * 공통 컬럼 + 카드 종류별 컬럼을 조립해 반환
 * Tabulator 가 정의를 변형할 수 있으므로 호출할 때마다 새 객체를 만든다.
 * @param {"threat"|"monster"} type 카드 종류
 */
export function buildColumns(type) {
  const cfg = getCardTypeConfig(type);

  return [
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
    {
      title: "속성",
      field: cfg.attrField,
      editor: "list",
      editorParams: { values: cfg.attrOptions, autocomplete: true },
      hozAlign: "center",
      width: 90,
    },
    ...cfg.extraColumns.map((column) => ({
      ...column,
      editorParams: { ...column.editorParams },
    })),
    { title: "공격치", field: "attack", editor: "input", hozAlign: "center", width: 85 },
    { title: "방어치", field: "guard", editor: "input", hozAlign: "center", width: 85 },
    { title: cfg.hpLabel, field: "hp", editor: "input", hozAlign: "center", width: 85 },
    {
      title: "묘사",
      field: "desc",
      editor: "textarea",
      editorParams: { verticalNavigation: "editor" },
      widthGrow: 2,
    },
    {
      title: "효과",
      field: "effect",
      editor: "textarea",
      editorParams: { verticalNavigation: "editor" },
      widthGrow: 2,
    },
  ];
}

/**
 * 필드명 -> 컬럼 헤더 매핑 (검증 메시지에 컬럼명을 표시하기 위함)
 * @param {"threat"|"monster"} type 카드 종류
 */
export function getFieldTitles(type) {
  return buildColumns(type).reduce((titles, column) => {
    titles[column.field] = column.title;
    return titles;
  }, {});
}

/**
 * 카드 종류별 필수 컬럼이 비어 있는 셀을 찾는다.
 * @param {Array<object>} rows 그리드 행 데이터
 * @param {"threat"|"monster"} type 카드 종류
 * @returns {string[]} "n행 (컬럼명)" 형태의 목록 (비어 있으면 빈 배열)
 */
export function findMissingCells(rows, type) {
  const cfg = getCardTypeConfig(type);
  const titles = getFieldTitles(type);
  const missing = [];

  (rows || []).forEach((row, index) => {
    cfg.requiredFields.forEach((field) => {
      const value = row ? row[field] : null;
      // 0 은 유효한 값으로 본다 (빈 문자열/공백/null/undefined 만 미입력)
      const isEmpty = value === null || value === undefined || String(value).trim() === "";
      if (isEmpty) {
        missing.push(`${index + 1}행 (${titles[field] || field})`);
      }
    });
  });

  return missing;
}
