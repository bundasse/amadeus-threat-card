<template>
  <div class="w-full min-h-screen bg-slate-200">
    <div class="max-w-7xl mx-auto bg-white pb-10">
      <div class="flex flex-wrap">
        <h1 class="basis-full text-5xl font-bold py-10 ml-5 mb-10">신화창세RPG 아마데우스 본체/위협 카드 생성기</h1>
        <div class="w-full flex flex-wrap">
          <!-- 카드 이미지 출력 공간 -->
          <div class="basis-full xl:basis-[49%] xl:order-1 order-2 text-center">
            <div ref="capture" class="relative inline-block">
              <!-- 본체카드 텍스트 -->
              <div class="z-10" style="font-family: 'BookkMyungjo-Bd';">
                <!-- 이름 -->
                <h3 v-if="nameFontSize === 'text-4xl'" class="absolute font-bold left-[180px] top-[72px] w-[300px] text-center" :class="nameFontSize" v-html="name"></h3>
                <h3 v-else class="absolute font-bold left-[180px] top-[95px] w-[300px] text-center" :class="nameFontSize" v-html="name"></h3>
                <!-- 태그 -->
                <p class="absolute left-[180px] w-[300px] top-[155px] text-2xl text-center">{{tags}}</p>
                <!-- 레벨+속성 -->
                <p class="absolute tStroke numText font-bold text-5xl right-[5px] top-[60px] w-16 text-center tracking-tighter ">{{ level }}</p>
                <div>
                  <p v-if="imageUrl === 'card_monster.png'" class="absolute font-bold text-6xl left-[45px] top-[70px] -rotate-[11deg]">{{ mAttr }}</p>
                  <p v-else class="absolute w-10 font-bold text-6xl left-[50px] top-[30px] first-letter:-ml-3 -rotate-[11deg]">{{ tAttr }}</p>
                </div>
                <!-- 판정 -->
                <p v-if="imageUrl === 'card_threat.png'" class="absolute top-[255px] text-2xl left-10 text-center w-20">{{ tDice }}</p>
                <p v-if="imageUrl === 'card_threat.png'" class="absolute numText top-[415px] text-2xl left-12 text-center w-20">{{ tDamage }}</p>
                <!-- 공격방어생명 -->
                <p class="absolute numText top-[415px] text-5xl left-[150px] text-center tracking-tighter w-20">{{ attack }}</p>
                <p class="absolute numText top-[415px] text-4xl right-[32px] text-center tracking-tighter w-16">{{guard}}</p>
                <p class="absolute numText top-[410px] text-5xl left-[420px] text-center tracking-tighter w-20">{{hp}}</p>
                <!-- 묘사 -->
                <div class="absolute top-[200px] text-2xl text-left" :class="imageUrl === 'card_monster.png'? 'left-[120px] w-[450px]': 'left-[170px] w-[400px]'">
                  <p class="whitespace-pre-line line-clamp-5">{{desc}}</p>
                </div>
                <!-- 효과 -->
                <div class="absolute w-[500px] left-16 top-[540px] text-2xl text-left">
                  <p class="whitespace-pre-line line-clamp-[9]">{{ effect }}</p>
                </div>
              </div>
              <!-- 위협카드 텍스트 -->
              <!-- <img src="/card_monster.png" :alt="imageUrl" width="591" height="887"> -->
              <img :src="require(`@/assets/${imageUrl}`)" :alt="imageUrl" width="591" height="887">
            </div>
          </div>
          <!-- 텍스트 입력 공간 -->
          <div class="basis-full xl:basis-[49%] xl:order-2 order-1 px-[5%] xl:px-0 mb-10 xl:mb-0">
            <div class="mb-10 ml-5">
                <!-- 카드 선택 -->
                <input v-model="imageUrl" @change="Reset()" type="radio" name="cardType" id="typeMonster" value="card_monster.png">
                <label for="typeMonster" class="ml-2">본체 카드</label>      
                <input checked v-model="imageUrl" @change="Reset()" type="radio" name="cardType" id="typeThreat" value="card_threat.png" class="ml-10">
                <label for="typeThreat" class="ml-2">위협 카드</label>   
            </div>
            <div class="flex flex-wrap gap-y-4">
              <div class="basis-full">
                <label for="name">이름 :</label>
                <input type="text" v-model="name" id="name">
                <input type="radio" class="ml-5" v-model="nameFontSize" id="text-4xl" value="text-4xl">
                <label for="text-4xl" class="ml-2 text-base">작은 글씨(이름 2줄 이상)</label> 
                <input type="radio" v-model="nameFontSize" id="text-5xl" value="text-5xl" checked>
                <label for="text-5xl" class="ml-2 text-base">큰 글씨</label> 
              </div>
              <span class="text-sm text-gray-500">※이름 줄바꿈이 필요할 때는 &lt;br&gt;을 입력하시면 원하는 위치에서 줄을 바꿀 수 있습니다.</span>
              <div class="basis-full">
                <label for="tags">태그 :</label>
                <input type="text" v-model="tags" id="tags">
              </div>
              <div class="basis-4/12 xl:basis-full">
                <label for="level">레벨 :</label>
                <input type="text" class="w-20" v-model="level" id="level" @input="check">
                <div v-if="imageUrl === 'card_monster.png'" class="inline-block">
                  <label for="mAttr" class="ml-10">속성 :</label>
                  <select v-model="mAttr" name="mAttr" id="mAttr" class="w-20 text-center">
                    <option value="적" selected>적</option>
                    <option value="청">청</option>
                    <option value="녹">녹</option>
                    <option value="백">백</option>
                    <option value="흑">흑</option>
                  </select>
                </div>
                <div v-if="imageUrl === 'card_threat.png'"  class="inline-block">
                  <label for="tAttr" class="ml-10">속성 :</label>
                  <select v-model="tAttr" name="tAttr" id="tAttr" class="w-20 text-center">
                    <option value="공격" selected>공격</option>
                    <option value="술식">술식</option>
                  </select>
                </div>
              </div>
              <div class="basis-4/12 xl:basis-full" v-if="imageUrl === 'card_threat.png'">
                <label for="tDice">판정 :</label>
                <select v-model="tDice" name="tDice" id="tDice" class="w-20 text-center">
                    <option value="무용" selected>무용</option>
                    <option value="기술">기술</option>
                    <option value="두뇌">두뇌</option>
                    <option value="영력">영력</option>
                    <option value="애정">애정</option>
                    <option value="일상">일상</option>
                  </select>
                  <label for="tDamage" class="ml-10">위력 :</label>
                  <input type="text" class="w-20" v-model="tDamage" id="tDamage" @input="check">
              </div>
              <div class="basis-full flex gap-x-2">
                <label for="attack">공격치 :
                  <input class="w-16 font-normal" type="text" v-model="attack" id="attack" @input="check">
                </label>
                <label for="guard">방어치 :
                  <input class="w-16 font-normal" type="text" v-model="guard" id="guard" @input="check">
                </label>
                <label for="hp"><span v-html="imageUrl === 'card_monster.png'? '생명력' : '내구도'"></span> :
                  <input class="w-16 font-normal" type="text" v-model="hp" id="hp" @input="check">
                </label>
              </div>
              <div class="basis-full flex items-start">
                <label for="desc" class="mr-5">묘사</label>
                <textarea v-model="desc" id="desc" rows="5" class="text-base w-1/2 xl:w-3/5"></textarea>
              </div>
              <div class="basis-full flex items-start">
                <label for="effect" class="mr-5">효과</label>
                <textarea v-model="effect" id="effect" rows="5" class="text-base w-1/2 xl:w-3/5"></textarea>
              </div>
            </div>
            <div class="basis-full mt-5 xl:text-right pr-10">
              <button @click="Reset()" class="bg-rose-500 hover:bg-rose-300 text-white hover:text-black text-center px-5 py-2 rounded-lg">리셋하기</button>
              <button @click="SaveFile()" class="bg-green-500 ml-5 hover:bg-green-300 text-white hover:text-black text-center px-5 py-2 rounded-lg">이미지 다운로드</button>
            </div>
            <p class="text-gray-600 text-sm mt-5 w-4/5">
              <span class="text-xl">※주의사항</span>
              <ul class="list-disc ml-10">
                <li>공식 사이트의 본체/위협카드 배포 이미지를 잘라 사용했습니다. 아직 이미지가 일본어로 되어있습니다.</li>
                <li>모바일에서는 이미지 사이즈와 폰트 배치가 왜곡되어 제대로 생성되지 않을 수 있습니다.</li>
                <li>제작자의 지식이 부족하여 [다른 이름으로 저장]이 아직 구현되지 않았습니다. 조속한 시일 내로 힘내보겠습니다.</li>
              </ul>
            </p>
          </div>
        </div>

      </div>
    </div>
    <div class="max-w-7xl mx-auto bg-gray-800 text-gray-400 p-10 text-sm">
      페이지 제작자: 녹조하임 (트위터 <a href="https://twitter.com/FF14_dasse" class="underline">@FF14_dasse</a>)
    </div>
  </div>
</template>

<script>
import domtoimage from 'dom-to-image';
import FileSaver from 'file-saver';
export default {
  name: 'App',
  data() {
    return {
      name:"",
      imageUrl: "card_threat.png",
      tags:'',
      level:1,
      mAttr: "적",
      tAttr: "공격",
      tDice:'무용',
      tDamage:'',
      attack:null,
      guard:null,
      hp:null,
      desc:'',
      effect:'',
      nameFontSize:"text-5xl"
    }
  },
  components: {
  },
  methods: {
    SaveFile(){
      var node = this.$refs.capture;
        domtoimage.toBlob(node).then(function (blob) {
          FileSaver.saveAs(blob);
        });
    },
    check(){
      if(this.attack){
        return this.attack = this.attack.replace(/[^0-9+-]/g, '');     
      }
      if(this.guard){
        return this.guard = this.guard.replace(/[^0-9+-]/g, '');     
      }
      if(this.level){
        return this.level = this.level.replace(/[^0-9]/g, '');     
      }
      if(this.hp){
        return this.hp = this.hp.replace(/[^0-9]/g, '');     
      }
      if(this.tDamage){
        return this.tDamage = this.tDamage.replace(/[^0-9+-dD]/g, '');     
      }
    },
    Reset(){
      this.name=""
      this.tags=''
      this.level=1
      this.mAttr= "적"
      this.tAttr= "공격"
      this.tDice='무용'
      this.tDamage=''
      this.attack=null
      this.guard=null
      this.hp=null
      this.desc=''
      this.effect=''
    }
  },
  watch:{
  }
}
</script>

<style>
label{
  margin: 0 5px;
  font-size: 1.2em;
  font-weight: bold;
}
input,select{
  border:1px solid lightgrey;
  text-align: center;
}
textarea{
  border:1px solid lightgrey;
}
.numText{
  font-family: 'BMDOHYEON';
}
.tStroke{
  text-shadow: 3px 0 #fff, 0 3px #fff, -3px 0 #fff, 0 -3px #fff;
}
</style>
