/** HIT A — MBTI 80문항 (전체 구조.xlsx C-MBTI 80 시트에서 추출) */
import type { MBTIQuestion } from "@/types/hit";

export const mbtiQuestions: MBTIQuestion[] = [
  {
    "id": "mbti_001",
    "axis": "" as const,
    "text": "새로운 일을 맡게 되었을 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "계획을 세우고 체계적으로 일을 진행한다.",
        "value": "J"
      },
      {
        "label": "상황을 보며 유연하게 일을 진행한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_002",
    "axis": "" as const,
    "text": "당신이 작성한 보고서에 대한 피드백을 받을 때, 당신은 무엇에 더 집중하나요?",
    "options": [
      {
        "label": "피드백의 논리와 데이터에 집중한다.",
        "value": "T"
      },
      {
        "label": "피드백을 준 사람의 감정과 의도에 집중한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_003",
    "axis": "" as const,
    "text": "집안 청소를 할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "청소 계획을 세우고 체계적으로 한다.",
        "value": "J"
      },
      {
        "label": "필요할 때마다 즉흥적으로 청소한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_004",
    "axis": "" as const,
    "text": "새로운 사람을 만났을 때, 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "먼저 다가가서 대화를 시작하고 친해지려 노력한다.",
        "value": "E"
      },
      {
        "label": "상대방이 먼저 다가오기를 기다리며 천천히 친해진다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_005",
    "axis": "" as const,
    "text": "책을 읽을 때, 당신은 어떤 부분에 더 집중하나요?",
    "options": [
      {
        "label": "이야기의 흐름과 전체적인 의미에 집중한다.",
        "value": "N"
      },
      {
        "label": "세부적인 설명과 사실에 집중한다.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_006",
    "axis": "" as const,
    "text": "당신은 보통 회의나 모임에서 어떻게 참여하나요?",
    "options": [
      {
        "label": "주로 듣는 편이고 꼭 필요할 때만 의견을 낸다.",
        "value": "I"
      },
      {
        "label": "적극적으로 의견을 내고 논의에 참여한다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_007",
    "axis": "" as const,
    "text": "낯선 장소에 갔을 때, 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "조용히 주변을 관찰하며 분위기에 적응한다.",
        "value": "I"
      },
      {
        "label": "적극적으로 탐험하고 사람들과 대화한다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_008",
    "axis": "" as const,
    "text": "회사에서 팀 프로젝트가 주어졌을 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "팀원들과 활발히 소통하고 협력한다.",
        "value": "E"
      },
      {
        "label": "주어진 역할에 집중하며 필요한 최소한의 소통만 한다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_009",
    "axis": "" as const,
    "text": "친구와의 약속이 취소되면 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "집에서 혼자만의 시간을 즐긴다.",
        "value": "I"
      },
      {
        "label": "다른 사람에게 연락해 새로운 약속을 잡는다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_010",
    "axis": "" as const,
    "text": "당신은 일과 후에 어떤 활동을 선호하나요?",
    "options": [
      {
        "label": "동료들과 함께 어울리며 시간을 보낸다.",
        "value": "E"
      },
      {
        "label": "혼자 조용한 곳에서 책을 읽거나 취미를 즐긴다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_011",
    "axis": "" as const,
    "text": "당신은 새로운 그룹에 합류할 때 어떻게 행동하나요?",
    "options": [
      {
        "label": "천천히 적응하며 그룹의 분위기를 파악한다.",
        "value": "I"
      },
      {
        "label": "적극적으로 참여하고 그룹의 일원이 되기 위해 노력한다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_012",
    "axis": "" as const,
    "text": "혼자 있는 시간이 길어지면 어떤 느낌이 드나요?",
    "options": [
      {
        "label": "지루하고 외롭다.",
        "value": "E"
      },
      {
        "label": "편안하고 재충전되는 느낌이다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_013",
    "axis": "" as const,
    "text": "새로운 정보를 접할 때, 당신은 주로 어떤 방식으로 이해하나요?",
    "options": [
      {
        "label": "전체적인 개념과 가능성을 통해 이해한다.",
        "value": "N"
      },
      {
        "label": "구체적이고 실질적인 예시를 통해 이해한다.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_014",
    "axis": "" as const,
    "text": "일상적인 문제를 해결할 때, 당신은 어떻게 접근하나요?",
    "options": [
      {
        "label": "기존의 방법과 경험을 바탕으로 해결한다.",
        "value": "S"
      },
      {
        "label": "창의적이고 새로운 방법을 시도한다.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_015",
    "axis": "" as const,
    "text": "새로운 기술을 배울 때, 당신은 어떤 방식으로 배우나요?",
    "options": [
      {
        "label": "전체적인 개념을 이해한 후에 배운다.",
        "value": "N"
      },
      {
        "label": "단계별로 실습하며 배운다.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_016",
    "axis": "" as const,
    "text": "당신은 단체 활동과 개인 활동 중 어떤 것을 더 좋아하나요?",
    "options": [
      {
        "label": "개인 활동을 통해 자신만의 시간을 갖는 것을 좋아한다.",
        "value": "I"
      },
      {
        "label": "단체 활동을 통해 여러 사람들과 어울리는 것을 좋아한다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_017",
    "axis": "" as const,
    "text": "당신은 보통 주말에 어떻게 시간을 보내나요?",
    "options": [
      {
        "label": "친구들과 만나거나 외출한다.",
        "value": "E"
      },
      {
        "label": "집에서 편안하게 쉰다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_018",
    "axis": "" as const,
    "text": "당신은 주로 어떤 방식으로 의사 결정을 하나요?",
    "options": [
      {
        "label": "현재 상황과 구체적인 정보를 바탕으로 결정한다.",
        "value": "S"
      },
      {
        "label": "미래의 가능성과 잠재적인 결과를 고려하여 결정한다.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_019",
    "axis": "" as const,
    "text": "일기 예보를 볼 때, 당신은 무엇에 더 주목하나요?",
    "options": [
      {
        "label": "날씨 변화의 경향과 패턴.",
        "value": "N"
      },
      {
        "label": "구체적인 날씨와 기온 정보.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_020",
    "axis": "" as const,
    "text": "새로운 직장에서 첫날, 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "동료들과 친해지며 관계를 형성하려고 한다.",
        "value": "F"
      },
      {
        "label": "업무 절차와 규칙을 파악하고 따르려고 한다.",
        "value": "T"
      }
    ]
  },
  {
    "id": "mbti_021",
    "axis": "" as const,
    "text": "친구가 당신에게 조언을 구할 때, 당신은 어떻게 응답하나요?",
    "options": [
      {
        "label": "문제 해결을 위한 구체적인 방법을 제시한다.",
        "value": "T"
      },
      {
        "label": "친구의 감정을 공감하고 위로하며 조언한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_022",
    "axis": "" as const,
    "text": "직장에서 스트레스를 받을 때, 당신은 어떻게 대처하나요?",
    "options": [
      {
        "label": "문제의 원인을 분석하고 해결책을 찾는다.",
        "value": "T"
      },
      {
        "label": "동료나 친구와 대화를 나누며 감정을 풀어낸다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_023",
    "axis": "" as const,
    "text": "대화를 나눌 때, 당신은 어떤 이야기에 더 관심이 있나요?",
    "options": [
      {
        "label": "실제로 일어난 사건과 경험.",
        "value": "S"
      },
      {
        "label": "가능성과 아이디어에 대한 이야기.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_024",
    "axis": "" as const,
    "text": "문제를 분석할 때, 당신은 어떤 방식으로 접근하나요?",
    "options": [
      {
        "label": "세부 사항을 철저히 분석한다.",
        "value": "S"
      },
      {
        "label": "큰 그림을 보고 패턴을 파악한다.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_025",
    "axis": "" as const,
    "text": "당신은 보통 어떤 종류의 영화를 더 좋아하나요?",
    "options": [
      {
        "label": "상상력이 풍부하고 창의적인 영화.",
        "value": "N"
      },
      {
        "label": "현실적이고 사실적인 영화.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_026",
    "axis": "" as const,
    "text": "주말에 평소에 관심 있던 큰 모임이 있다고 합니다. 당신은 어떻게 할 것인가요?",
    "options": [
      {
        "label": "소수의 가까운 친구들과 갈 수 있으면 가고 아니면 집에 있겠다.",
        "value": "I"
      },
      {
        "label": "적극적으로 참석하고 여러 사람들과 어울리겠다",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_027",
    "axis": "" as const,
    "text": "새로운 음식을 시도할 때, 당신은 무엇에 더 주목하나요?",
    "options": [
      {
        "label": "음식의 재료와 조리 방법.",
        "value": "S"
      },
      {
        "label": "음식의 독특한 맛과 새로운 경험.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_028",
    "axis": "" as const,
    "text": "친구와 여행을 갈 때, 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "여행 중에 즉흥적으로 계획을 바꾼다.",
        "value": "P"
      },
      {
        "label": "여행 일정을 상세하게 계획하고 준비한다.",
        "value": "J"
      }
    ]
  },
  {
    "id": "mbti_029",
    "axis": "" as const,
    "text": "중요한 결정을 내릴 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "계획을 세우고 신중하게 결정을 내린다.",
        "value": "J"
      },
      {
        "label": "상황을 보고 즉흥적으로 결정을 내린다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_030",
    "axis": "" as const,
    "text": "일상적인 대화를 할 때, 당신은 어떤 주제를 더 좋아하나요?",
    "options": [
      {
        "label": "미래의 가능성과 꿈에 대한 이야기.",
        "value": "N"
      },
      {
        "label": "현재 일어나고 있는 일과 구체적인 상황.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_031",
    "axis": "" as const,
    "text": "프로젝트를 시작할 때, 당신은 어떻게 준비하나요?",
    "options": [
      {
        "label": "구체적인 계획을 세우고 단계를 나눈다.",
        "value": "S"
      },
      {
        "label": "전체적인 목표를 설정하고 유연하게 진행한다.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_032",
    "axis": "" as const,
    "text": "휴가를 계획할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "혼자서 조용히 휴식을 취할 계획을 세운다.",
        "value": "I"
      },
      {
        "label": "친구들이나 가족들과 함께 떠나는 계획을 세운다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_033",
    "axis": "" as const,
    "text": "당신은 보통 어떤 방식으로 스트레스를 푸나요?",
    "options": [
      {
        "label": "친구들과 수다를 떨거나 외출을 한다.",
        "value": "E"
      },
      {
        "label": "혼자서 산책을 하거나 음악을 듣는다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_034",
    "axis": "" as const,
    "text": "일상 생활에서의 변화를 어떻게 받아들이나요?",
    "options": [
      {
        "label": "변화를 쉽게 받아들이지 않고 현재 상태를 유지하려 한다.",
        "value": "S"
      },
      {
        "label": "변화를 기회로 보고 새로운 것을 시도하려 한다.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_035",
    "axis": "" as const,
    "text": "당신은 주로 어떤 스타일의 일을 선호하나요?",
    "options": [
      {
        "label": "규칙적이고 체계적인 일을 선호한다.",
        "value": "S"
      },
      {
        "label": "창의적이고 유연한 일을 선호한다.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_036",
    "axis": "" as const,
    "text": "새로운 정보를 기억할 때, 당신은 어떤 방식으로 기억하나요?",
    "options": [
      {
        "label": "개념과 아이디어를 기억한다.",
        "value": "N"
      },
      {
        "label": "구체적인 사실과 데이터를 기억한다.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_037",
    "axis": "" as const,
    "text": "당신은 보통 어떤 방식으로 사람들과 소통하나요?",
    "options": [
      {
        "label": "비유적이고 추상적으로 소통한다.",
        "value": "N"
      },
      {
        "label": "직접적이고 구체적으로 소통한다.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_038",
    "axis": "" as const,
    "text": "친구가 직장에서 힘든 상황을 이야기할 때, 당신은 어떻게 반응하나요?",
    "options": [
      {
        "label": "문제를 해결할 수 있는 구체적인 조언을 해준다.",
        "value": "T"
      },
      {
        "label": "친구의 감정을 이해하고 위로한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_039",
    "axis": "" as const,
    "text": "중요한 결정을 내릴 때, 당신은 어떤 기준을 더 중요시하나요?",
    "options": [
      {
        "label": "자신의 가치관과 감정에 기반하여 결정한다.",
        "value": "F"
      },
      {
        "label": "논리적이고 객관적인 정보에 기반하여 결정한다.",
        "value": "T"
      }
    ]
  },
  {
    "id": "mbti_040",
    "axis": "" as const,
    "text": "팀 프로젝트에서 의견이 충돌할 때, 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "갈등을 최소화하고 조화를 이루기 위해 노력한다.",
        "value": "F"
      },
      {
        "label": "논리적인 논쟁을 통해 최선의 결론을 도출한다.",
        "value": "T"
      }
    ]
  },
  {
    "id": "mbti_041",
    "axis": "" as const,
    "text": "친구들과의 모임에서 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "주로 듣는 편이고 필요한 때에만 말한다.",
        "value": "I"
      },
      {
        "label": "대화를 주도하며 분위기를 띄운다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_042",
    "axis": "" as const,
    "text": "새로운 직장에서 첫날, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "동료들에게 먼저 다가가 인사하고 대화한다.",
        "value": "E"
      },
      {
        "label": "동료들이 먼저 다가오기를 기다리며 관찰한다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_043",
    "axis": "" as const,
    "text": "친구가 약속을 지키지 않았을 때, 당신은 어떻게 느끼나요?",
    "options": [
      {
        "label": "약속을 어긴 이유를 논리적으로 설명해달라고 요구한다.",
        "value": "T"
      },
      {
        "label": "친구의 사정을 이해하고 공감하려고 노력한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_044",
    "axis": "" as const,
    "text": "친구들과의 약속을 잡을 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "미리 날짜와 시간을 정하고 계획한다.",
        "value": "J"
      },
      {
        "label": "약속 당일에 즉흥적으로 시간을 정한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_045",
    "axis": "" as const,
    "text": "집안일을 할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "필요할 때마다 즉흥적으로 집안일을 한다.",
        "value": "P"
      },
      {
        "label": "계획을 세우고 체계적으로 집안일을 한다.",
        "value": "J"
      }
    ]
  },
  {
    "id": "mbti_046",
    "axis": "" as const,
    "text": "회사에서 중요한 발표를 준비할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "청중의 감정을 고려하여 발표를 준비한다.",
        "value": "F"
      },
      {
        "label": "데이터를 철저히 분석하고 논리적으로 구성한다.",
        "value": "T"
      }
    ]
  },
  {
    "id": "mbti_047",
    "axis": "" as const,
    "text": "상사가 비판적인 피드백을 줄 때, 당신은 어떻게 반응하나요?",
    "options": [
      {
        "label": "피드백을 분석하고 개선할 방법을 찾는다.",
        "value": "T"
      },
      {
        "label": "상사의 의도를 이해하고 자신의 감정을 표현한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_048",
    "axis": "" as const,
    "text": "중요한 이메일을 작성할 때, 당신은 무엇에 더 신경 쓰나요?",
    "options": [
      {
        "label": "이메일의 어조가 상대방에게 어떻게 전달될지 신경 쓴다.",
        "value": "F"
      },
      {
        "label": "이메일의 내용이 논리적이고 명확한지 신경 쓴다.",
        "value": "T"
      }
    ]
  },
  {
    "id": "mbti_049",
    "axis": "" as const,
    "text": "상사의 기대에 부응하지 못했을 때, 당신은 어떻게 느끼나요?",
    "options": [
      {
        "label": "논리적으로 이유를 분석하고 개선할 방법을 찾는다.",
        "value": "T"
      },
      {
        "label": "상사의 실망감을 이해하고 공감한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_050",
    "axis": "" as const,
    "text": "가족과의 갈등이 있을 때, 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "논리적으로 문제를 해결하려고 한다.",
        "value": "T"
      },
      {
        "label": "가족의 감정을 이해하고 화해하려고 한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_051",
    "axis": "" as const,
    "text": "중요한 선택을 할 때, 당신은 어떤 방식을 더 선호하나요?",
    "options": [
      {
        "label": "논리적인 분석과 데이터를 바탕으로 선택한다.",
        "value": "T"
      },
      {
        "label": "자신의 감정과 직관을 바탕으로 선택한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_052",
    "axis": "" as const,
    "text": "친구가 고민을 털어놓을 때, 당신은 어떻게 반응하나요?",
    "options": [
      {
        "label": "친구의 감정을 공감하고 위로하며 듣는다.",
        "value": "F"
      },
      {
        "label": "문제 해결을 위한 구체적인 방법을 제시한다.",
        "value": "T"
      }
    ]
  },
  {
    "id": "mbti_053",
    "axis": "" as const,
    "text": "여행을 계획할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "철저한 계획을 세우고 일정을 정한다.",
        "value": "J"
      },
      {
        "label": "자유롭게 일정을 정하지 않고 유연하게 계획한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_054",
    "axis": "" as const,
    "text": "일을 마칠 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "여유롭게 일을 마무리하고, 때로는 마지막 순간에 완성한다.",
        "value": "P"
      },
      {
        "label": "마감일을 지키기 위해 계획적으로 일한다.",
        "value": "J"
      }
    ]
  },
  {
    "id": "mbti_055",
    "axis": "" as const,
    "text": "일과를 마친 후, 당신은 어떻게 시간을 보낼 것인가요?",
    "options": [
      {
        "label": "미리 계획한 활동을 한다.",
        "value": "J"
      },
      {
        "label": "기분에 따라 즉흥적으로 활동을 선택한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_056",
    "axis": "" as const,
    "text": "친구의 생일 선물을 고를 때, 당신은 어떤 기준으로 선택하나요?",
    "options": [
      {
        "label": "실용적이고 필요할 것 같은 선물을 선택한다.",
        "value": "T"
      },
      {
        "label": "친구가 좋아할 것 같은 감성적인 선물을 선택한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_057",
    "axis": "" as const,
    "text": "갈등 상황에서 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "감정적으로 상대방을 이해하고 화해하려고 노력한다.",
        "value": "F"
      },
      {
        "label": "논리적으로 문제를 해결하려고 노력한다.",
        "value": "T"
      }
    ]
  },
  {
    "id": "mbti_058",
    "axis": "" as const,
    "text": "팀원과 의견이 맞지 않을 때, 당신은 어떻게 해결하나요?",
    "options": [
      {
        "label": "논리적으로 자신의 의견을 설득하려고 한다.",
        "value": "T"
      },
      {
        "label": "팀원의 감정을 이해하고 타협점을 찾으려고 한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_059",
    "axis": "" as const,
    "text": "프로젝트를 시작할 때, 당신은 어떻게 준비하나요?",
    "options": [
      {
        "label": "철저한 계획과 일정을 세운다.",
        "value": "J"
      },
      {
        "label": "필요한 자료를 모으고 유연하게 시작한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_060",
    "axis": "" as const,
    "text": "휴가를 보낼 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "휴가 중에 즉흥적으로 활동을 결정한다.",
        "value": "P"
      },
      {
        "label": "미리 계획하고 일정을 정한다.",
        "value": "J"
      }
    ]
  },
  {
    "id": "mbti_061",
    "axis": "" as const,
    "text": "새로운 프로젝트를 시작할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "목표와 일정을 세우고 계획적으로 진행한다.",
        "value": "J"
      },
      {
        "label": "프로젝트의 흐름에 따라 유연하게 진행한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_062",
    "axis": "" as const,
    "text": "일상생활에서 당신은 어떻게 시간을 관리하나요?",
    "options": [
      {
        "label": "상황에 따라 유연하게 시간을 관리한다.",
        "value": "P"
      },
      {
        "label": "일정표를 작성하고 계획적으로 시간을 관리한다.",
        "value": "J"
      }
    ]
  },
  {
    "id": "mbti_063",
    "axis": "" as const,
    "text": "업무 중에 갑작스러운 변경이 생기면 어떻게 대응하나요?",
    "options": [
      {
        "label": "계획을 수정하여 새로운 일정에 맞춘다.",
        "value": "J"
      },
      {
        "label": "상황에 맞게 즉흥적으로 대응한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_064",
    "axis": "" as const,
    "text": "일정을 계획할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "구체적이고 현실적인 계획을 세운다.",
        "value": "S"
      },
      {
        "label": "큰 그림을 그리고 유연하게 계획을 수정한다.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_065",
    "axis": "" as const,
    "text": "친구가 여행 이야기를 할 때, 당신은 무엇에 더 관심이 있나요?",
    "options": [
      {
        "label": "여행 중에 했던 구체적인 활동과 경험.",
        "value": "S"
      },
      {
        "label": "여행을 통해 얻은 통찰과 깨달음.",
        "value": "N"
      }
    ]
  },
  {
    "id": "mbti_066",
    "axis": "" as const,
    "text": "당신은 혼자서 여행을 떠나게 된다면 어떤 생각이 드나요?",
    "options": [
      {
        "label": "외롭고 지루할 것 같아 걱정된다.",
        "value": "E"
      },
      {
        "label": "새로운 경험을 할 수 있을 것 같아 기대된다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_067",
    "axis": "" as const,
    "text": "새로운 사람들과의 첫 만남에서 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "조용히 듣고 상대방이 먼저 말을 걸기를 기다린다.",
        "value": "I"
      },
      {
        "label": "대화를 주도하며 분위기를 이끌어간다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_068",
    "axis": "" as const,
    "text": "친구들과의 모임에서 당신은 어떻게 행동하나요?",
    "options": [
      {
        "label": "모임 중에 즉흥적으로 활동을 결정한다.",
        "value": "P"
      },
      {
        "label": "모임의 일정을 미리 계획하고 준비한다.",
        "value": "J"
      }
    ]
  },
  {
    "id": "mbti_069",
    "axis": "" as const,
    "text": "친구와의 다툼 후, 당신은 어떻게 해결하려고 하나요?",
    "options": [
      {
        "label": "문제의 원인을 분석하고 해결책을 제시한다.",
        "value": "T"
      },
      {
        "label": "친구의 감정을 이해하고 화해하려고 노력한다.",
        "value": "F"
      }
    ]
  },
  {
    "id": "mbti_070",
    "axis": "" as const,
    "text": "중요한 회의를 준비할 때, 당신은 무엇에 더 집중하나요?",
    "options": [
      {
        "label": "회의에 참여하는 사람들의 감정을 고려한다.",
        "value": "F"
      },
      {
        "label": "회의의 목적과 논리적인 전개에 집중한다.",
        "value": "T"
      }
    ]
  },
  {
    "id": "mbti_071",
    "axis": "" as const,
    "text": "일상적인 쇼핑을 할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "쇼핑 목록을 작성하고 계획적으로 쇼핑한다.",
        "value": "J"
      },
      {
        "label": "필요할 때마다 즉흥적으로 쇼핑한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_072",
    "axis": "" as const,
    "text": "중요한 발표를 준비할 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "발표 당일에 필요한 내용을 준비한다.",
        "value": "P"
      },
      {
        "label": "철저하게 계획하고 연습한다.",
        "value": "J"
      }
    ]
  },
  {
    "id": "mbti_073",
    "axis": "" as const,
    "text": "중요한 결정을 내릴 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "혼자서 신중히 생각하고 결정을 내린다.",
        "value": "I"
      },
      {
        "label": "주변 사람들과 상의하고 여러 의견을 듣는다.",
        "value": "E"
      }
    ]
  },
  {
    "id": "mbti_074",
    "axis": "" as const,
    "text": "당신은 새로운 취미를 시작할 때 어떻게 하나요?",
    "options": [
      {
        "label": "동호회나 모임에 가입해 사람들과 함께 시작한다.",
        "value": "E"
      },
      {
        "label": "혼자서 조용히 배우고 연습한다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_075",
    "axis": "" as const,
    "text": "긴 하루를 보낸 후, 당신은 어떻게 휴식을 취하나요?",
    "options": [
      {
        "label": "친구들과 어울리거나 외출한다.",
        "value": "E"
      },
      {
        "label": "집에서 조용히 책을 읽거나 영화를 본다.",
        "value": "I"
      }
    ]
  },
  {
    "id": "mbti_076",
    "axis": "" as const,
    "text": "직장에서 갑작스러운 업무 요청이 들어왔을 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "유연하게 상황에 맞춰 업무를 처리한다.",
        "value": "P"
      },
      {
        "label": "기존 계획을 수정하고 새로운 요청에 맞춘다.",
        "value": "J"
      }
    ]
  },
  {
    "id": "mbti_077",
    "axis": "" as const,
    "text": "회의를 할 때, 당신은 어떤 부분에 더 집중하나요?",
    "options": [
      {
        "label": "아이디어와 가능성에 대해 논의한다.",
        "value": "N"
      },
      {
        "label": "구체적인 사실과 데이터에 집중한다.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_078",
    "axis": "" as const,
    "text": "당신은 보통 어떤 방식으로 목표를 설정하나요?",
    "options": [
      {
        "label": "도전적이고 혁신적인 목표를 설정한다.",
        "value": "N"
      },
      {
        "label": "실질적이고 현실적인 목표를 설정한다.",
        "value": "S"
      }
    ]
  },
  {
    "id": "mbti_079",
    "axis": "" as const,
    "text": "새로운 직장에서의 첫날, 당신은 어떻게 준비하나요?",
    "options": [
      {
        "label": "첫날 일정을 철저하게 계획하고 준비한다.",
        "value": "J"
      },
      {
        "label": "첫날 상황에 맞춰 유연하게 행동한다.",
        "value": "P"
      }
    ]
  },
  {
    "id": "mbti_080",
    "axis": "" as const,
    "text": "주말 계획을 세울 때, 당신은 어떻게 하나요?",
    "options": [
      {
        "label": "주말에 할 일을 미리 계획한다.",
        "value": "J"
      },
      {
        "label": "주말에 기분에 따라 즉흥적으로 활동을 결정한다.",
        "value": "P"
      }
    ]
  }
];
