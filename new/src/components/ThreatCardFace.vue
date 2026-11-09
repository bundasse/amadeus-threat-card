<template>
  <div class="relative inline-block" style="width: 591px; height: 887px;">
    <!-- 본체카드 텍스트 -->
    <div class="z-10" style="font-family: 'BookkMyungjo-Bd';">
      <!-- 이름 -->
      <h3
        v-if="nameFontSize === 'text-4xl'"
        class="absolute font-bold left-[180px] top-[72px] w-[300px] text-center"
        :class="nameFontSize"
        v-html="name"
      ></h3>
      <h3
        v-else
        class="absolute font-bold left-[180px] top-[95px] w-[300px] text-center"
        :class="nameFontSize"
        v-html="name"
      ></h3>
      <!-- 태그 -->
      <p class="absolute left-[180px] w-[300px] top-[155px] text-2xl text-center">{{ tags }}</p>
      <!-- 레벨+속성 -->
      <p class="absolute tStroke numText font-bold text-5xl right-[5px] top-[60px] w-16 text-center tracking-tighter">{{ level }}</p>
      <div>
        <p v-if="isMonster" class="absolute font-bold text-6xl left-[45px] top-[70px] -rotate-[11deg]">{{ mAttr }}</p>
        <p v-else class="absolute w-10 font-bold text-6xl left-[50px] top-[30px] first-letter:-ml-3 -rotate-[11deg]">{{ tAttr }}</p>
      </div>
      <!-- 판정 -->
      <p v-if="!isMonster" class="absolute top-[255px] text-2xl left-10 text-center w-20">{{ tDice }}</p>
      <p v-if="!isMonster" class="absolute numText top-[415px] text-2xl left-12 text-center w-20">{{ tDamage }}</p>
      <!-- 공격방어생명 -->
      <p class="absolute numText top-[415px] text-5xl left-[150px] text-center tracking-tighter w-20">{{ attack }}</p>
      <p class="absolute numText top-[415px] text-4xl right-[32px] text-center tracking-tighter w-16">{{ guard }}</p>
      <p class="absolute numText top-[410px] text-5xl left-[420px] text-center tracking-tighter w-20">{{ hp }}</p>
      <!-- 묘사 -->
      <div class="absolute top-[200px] text-2xl text-left" :class="isMonster ? 'left-[120px] w-[450px]' : 'left-[170px] w-[400px]'">
        <p class="whitespace-pre-line line-clamp-5">{{ desc }}</p>
      </div>
      <!-- 효과 -->
      <div class="absolute w-[500px] left-16 top-[540px] text-2xl text-left">
        <p class="whitespace-pre-line line-clamp-[9]">{{ effect }}</p>
      </div>
    </div>
    <!-- 카드 배경 이미지 -->
    <img :src="cardImage" :alt="imageUrl" width="591" height="887">
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // 카드 종류 (threat = 위협 / monster = 괴물). 이 값으로 카드 레이아웃을 분기한다.
  cardType: { type: String, default: "threat" },
  imageUrl: { type: String, default: "card_threat.png" },
  name: { type: String, default: "" },
  tags: { type: String, default: "" },
  level: { type: [String, Number], default: 1 },
  mAttr: { type: String, default: "적" },
  tAttr: { type: String, default: "공격" },
  tDice: { type: String, default: "무용" },
  tDamage: { type: [String, Number], default: "" },
  attack: { type: [String, Number], default: null },
  guard: { type: [String, Number], default: null },
  hp: { type: [String, Number], default: null },
  desc: { type: String, default: "" },
  effect: { type: String, default: "" },
  nameFontSize: { type: String, default: "text-5xl" },
});

// 괴물 카드 여부 (구 App.vue 의 imageUrl 문자열 비교를 대체)
const isMonster = computed(() => props.cardType === "monster");

const cardImage = computed(() => require(`@/assets/${props.imageUrl}`));
</script>
