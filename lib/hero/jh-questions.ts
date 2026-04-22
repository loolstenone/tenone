/**
 * JH (Job Hope) 12문항 정의
 * docs/HeRo_Matching_Tetrad_v1.md 기반
 */

export type JHPickType = "single" | "pick2" | "pick3" | "text";

export interface JHQuestion {
    key: string;
    label: string;
    type: JHPickType;
    options?: { value: string; label: string; hint?: string }[];
    placeholder?: string;
    required: boolean;
}

export const JH_QUESTIONS: JHQuestion[] = [
    {
        key: "jh1",
        label: "내가 풀고 싶은 문제의 결은 어떤 것인가요?",
        type: "pick2",
        required: true,
        options: [
            { value: "a", label: "사회의 불공정·단절", hint: "격차, 배제, 구조적 문제" },
            { value: "b", label: "산업의 비효율·낡음", hint: "오래된 관행, 생산성 병목" },
            { value: "c", label: "조직의 혼란·흩어짐", hint: "일하는 방식, 문화의 결" },
            { value: "d", label: "개인의 삶의 질·성장", hint: "소비자·사용자·학습자" },
            { value: "e", label: "기술의 한계·가능성", hint: "새로운 도구·플랫폼·엔진" },
            { value: "f", label: "사람의 잠재력·기회", hint: "발굴, 육성, 매칭" },
            { value: "g", label: "아직 없는 것·새로운 영역", hint: "개척, 블루오션" },
            { value: "h", label: "사라져가는 것·지켜야 할 것", hint: "보존, 전승, 복원" },
        ],
    },
    {
        key: "jh2",
        label: "내가 매혹되는 상황의 모양은?",
        type: "single",
        required: true,
        options: [
            { value: "a", label: "불가능해 보이는 것을 해내는 순간" },
            { value: "b", label: "망가진 것을 고치고 되살리는 순간" },
            { value: "c", label: "무에서 유를 만드는 순간" },
            { value: "d", label: "어지러운 것을 정돈하고 흐름을 잡는 순간" },
            { value: "e", label: "끊긴 것을 잇고 사람을 모으는 순간" },
            { value: "f", label: "묻힌 것을 드러내고 알리는 순간" },
        ],
    },
    {
        key: "jh3",
        label: "내가 잘 쓰이고 있다고 느낄 때는?",
        type: "pick3",
        required: true,
        options: [
            { value: "a", label: "누군가가 나 덕분에 바뀌는 걸 볼 때" },
            { value: "b", label: "팀 전체의 기준이 내 손으로 올라갈 때" },
            { value: "c", label: '고객·사용자가 "고맙다"고 말할 때' },
            { value: "d", label: "새로운 것이 세상에 나올 때" },
            { value: "e", label: "어려운 문제가 내 앞에서 풀릴 때" },
            { value: "f", label: "누군가가 성장하는 걸 내가 도왔을 때" },
            { value: "g", label: "복잡한 것이 내 손으로 단순해질 때" },
            { value: "h", label: "조직이 내 덕분에 단단해질 때" },
        ],
    },
    {
        key: "jh4",
        label: "내가 다른 사람들과 다르게 해내는 한 가지는?",
        type: "single",
        required: true,
        options: [
            { value: "a", label: "남들보다 빠르게 움직인다" },
            { value: "b", label: "남들보다 깊게 판다" },
            { value: "c", label: "남들보다 넓게 본다" },
            { value: "d", label: "남들보다 정확하게 짚는다" },
            { value: "e", label: "남들보다 끈질기게 버틴다" },
            { value: "f", label: "남들보다 부드럽게 엮는다" },
            { value: "g", label: "남들보다 과감하게 결정한다" },
            { value: "h", label: "남들보다 섬세하게 짜낸다" },
        ],
    },
    {
        key: "jh5",
        label: "나의 다음 1~3년 성장 방향은?",
        type: "single",
        required: true,
        options: [
            { value: "a", label: "지금의 전문성을 더 깊게" },
            { value: "b", label: "인접 영역으로 더 넓게" },
            { value: "c", label: "사람을 이끄는 경험으로" },
            { value: "d", label: "책임과 결정의 크기로" },
            { value: "e", label: "새로운 도메인·산업으로" },
            { value: "f", label: "독립·창업의 방향으로" },
            { value: "g", label: "가르치고 전수하는 자리로" },
            { value: "h", label: "아직 모름 — 함께 그려가고 싶다" },
        ],
    },
    {
        key: "jh6",
        label: "나의 5~10년 후 자화상은?",
        type: "single",
        required: true,
        options: [
            { value: "a", label: "이 분야의 최고 전문가로 인정받는 사람" },
            { value: "b", label: "조직을 이끄는 리더로 자리잡은 사람" },
            { value: "c", label: "독립된 브랜드·사업을 가진 사람" },
            { value: "d", label: "후배·제자들을 키워낸 사람" },
            { value: "e", label: "새로운 영역을 개척한 사람" },
            { value: "f", label: "여러 영역을 연결하는 사람" },
            { value: "g", label: "사회에 영향을 만든 사람" },
            { value: "h", label: "일과 삶이 균형 잡힌 사람" },
        ],
    },
    {
        key: "jh7",
        label: "내가 서고 싶은 국면은?",
        type: "single",
        required: true,
        options: [
            { value: "a", label: "안정된 곳에서 축을 단단히 하고 싶다" },
            { value: "b", label: "무언가 새로 열리는 곳에 올라타고 싶다" },
            { value: "c", label: "팀과 사람 속에서 단단히 자리 잡고 싶다" },
            { value: "d", label: "어려움을 함께 넘어갈 곳이면 좋다" },
            { value: "e", label: "모르겠다 · 상황에 따라" },
        ],
    },
    {
        key: "jh8",
        label: "내가 기여하고 싶은 단위는?",
        type: "single",
        required: true,
        options: [
            { value: "a", label: "한 명 한 명의 변화에 기여하고 싶다" },
            { value: "b", label: "하나의 팀이 달라지는 데 기여하고 싶다" },
            { value: "c", label: "하나의 조직이 바뀌는 데 기여하고 싶다" },
            { value: "d", label: "하나의 산업이 움직이는 데 기여하고 싶다" },
            { value: "e", label: "사회 전체가 나아지는 데 기여하고 싶다" },
        ],
    },
    {
        key: "jh9",
        label: "나의 일하는 방식의 스펙트럼은?",
        type: "single",
        required: true,
        options: [
            { value: "a", label: "혼자서 깊게 파고들 때 가장 잘한다" },
            { value: "b", label: "둘·셋이서 집중해서 함께 파는 게 편하다" },
            { value: "c", label: "작은 팀에서 긴밀하게 움직일 때가 좋다" },
            { value: "d", label: "여러 팀을 잇는 허브 자리가 편하다" },
            { value: "e", label: "큰 조직 전체를 움직이는 일이 맞는다" },
        ],
    },
    {
        key: "jh10",
        label: "나의 동력원은?",
        type: "pick2",
        required: true,
        options: [
            { value: "a", label: "배움", hint: "끊임없이 새로 알아가는 것" },
            { value: "b", label: "도전", hint: "해본 적 없는 것에 부딪히는 것" },
            { value: "c", label: "인정", hint: "내 일이 정당하게 평가받는 것" },
            { value: "d", label: "관계", hint: "함께 일하는 사람들과의 유대" },
            { value: "e", label: "의미", hint: "이 일이 무언가에 쓸모 있다는 실감" },
            { value: "f", label: "자율", hint: "내가 결정하고 내가 책임지는 것" },
            { value: "g", label: "완성", hint: "내 손으로 무언가 마무리되는 것" },
            { value: "h", label: "영향", hint: "내가 한 일이 변화로 이어지는 것" },
        ],
    },
    {
        key: "jh11",
        label: "내가 피하고 싶은 조직은?",
        type: "pick2",
        required: true,
        options: [
            { value: "a", label: "문제를 회피하고 덮는 곳" },
            { value: "b", label: "사람을 도구로 쓰는 곳" },
            { value: "c", label: "성장이 멈춘 곳" },
            { value: "d", label: "진실을 숨기는 곳" },
            { value: "e", label: "방향이 없는 곳" },
            { value: "f", label: "사람을 갈아 쓰는 곳" },
            { value: "g", label: "결정이 투명하지 않은 곳" },
            { value: "h", label: "다양성을 용납하지 않는 곳" },
        ],
    },
    {
        key: "jh12",
        label: "지금 내가 풀고 싶은 문제를 한 줄로 써주세요.",
        type: "text",
        required: false,
        placeholder: '예) "중소 제조업이 유통 대기업에 휘둘리는 구조를 깨고 싶다"',
    },
];
