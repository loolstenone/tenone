/** HIT A — DISC 40문항 (Pre-Test 20 + Main 20) */
import type { DISCQuestion } from "@/types/hit";

export const discQuestions: DISCQuestion[] = [
  {
    "id": "disc_001",
    "source": "" as const,
    "text": "월요일 아침, 이번 주에 새 프로젝트 킥오프 미팅이 잡혔다는 알림을 받았습니다. 미팅 전까지 당신은 무엇을 하나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "프로젝트 배경과 목표를 빠르게 훑어보고 내가 맡을 수 있는 범위를 가늠한다."
      },
      {
        "value": "I" as const,
        "label": "어떤 재미있는 프로젝트인지 궁금해하며 가벼운 마음으로 기다린다."
      },
      {
        "value": "S" as const,
        "label": "어떤 사람들이 함께하는지, 팀 분위기는 어떨지 알아본다."
      },
      {
        "value": "C" as const,
        "label": "미팅 안건과 자료를 미리 확인해서 질문할 것을 정리해 둔다."
      }
    ]
  },
  {
    "id": "disc_002",
    "source": "" as const,
    "text": "킥오프 미팅에서 자유롭게 질문할 시간이 주어졌습니다. 당신이 가장 먼저 던질 질문은?",
    "options": [
      {
        "value": "D" as const,
        "label": "이 프로젝트가 회사에 어떤 실질적인 영향을 미치나요?"
      },
      {
        "value": "I" as const,
        "label": "비슷한 시도를 해본 팀이 있다면 어떤 결과를 얻었나요?"
      },
      {
        "value": "S" as const,
        "label": "각 멤버의 역할과 책임 범위가 어떻게 나뉘나요?"
      },
      {
        "value": "C" as const,
        "label": "성공을 판단하는 구체적인 기준이나 지표가 있나요?"
      }
    ]
  },
  {
    "id": "disc_003",
    "source": "" as const,
    "text": "프로젝트에 합류한 첫 주, 당신에게 맡겨진 업무를 시작하기 전에 가장 먼저 하는 일은?",
    "options": [
      {
        "value": "D" as const,
        "label": "이 일을 성공시키기 위한 핵심 요소와 예상되는 장애물을 정리한다."
      },
      {
        "value": "I" as const,
        "label": "관련 사례나 참고할 만한 벤치마크를 찾아본다."
      },
      {
        "value": "S" as const,
        "label": "최종 결과물의 수준과 기대치를 구체적으로 설정한다."
      },
      {
        "value": "C" as const,
        "label": "동료들과 업무 분담 방식과 협업 프로세스를 먼저 맞춰본다."
      }
    ]
  },
  {
    "id": "disc_004",
    "source": "" as const,
    "text": "팀이 모여서 프로젝트의 최종 목표를 확정하는 자리입니다. 당신이 가장 중시하는 점은?",
    "options": [
      {
        "value": "D" as const,
        "label": "목표 달성에 필요한 인력, 예산, 도구가 충분한지 점검한다."
      },
      {
        "value": "I" as const,
        "label": "팀원들이 자유롭게 의견을 내고 함께 방향을 정하는 과정이 중요하다."
      },
      {
        "value": "S" as const,
        "label": "목표까지의 구체적인 단계와 실행 계획이 명확한지 확인한다."
      },
      {
        "value": "C" as const,
        "label": "각 팀원의 상황과 역량을 고려해서 현실적인 목표인지 검토한다."
      }
    ]
  },
  {
    "id": "disc_005",
    "source": "" as const,
    "text": "팀장이 특정 주제에 대한 조사 보고서를 요청했습니다. 작업을 시작하기 전 당신의 접근법은?",
    "options": [
      {
        "value": "D" as const,
        "label": "팀장이 기대하는 수준과 방향을 먼저 확인하고 합의한다."
      },
      {
        "value": "I" as const,
        "label": "팀장이 이 보고서로 궁극적으로 하려는 것이 무엇인지 파악한다."
      },
      {
        "value": "S" as const,
        "label": "프로젝트 전체 목표와의 연결 고리를 먼저 생각해본다."
      },
      {
        "value": "C" as const,
        "label": "일정, 분량, 포맷 등 구체적인 요구사항을 정리한다."
      }
    ]
  },
  {
    "id": "disc_006",
    "source": "" as const,
    "text": "업무를 진행하다가 혼자 해결하기 어려운 문제에 부딪혔습니다. 당신의 대처 방식은?",
    "options": [
      {
        "value": "D" as const,
        "label": "빠르게 관련 정보를 찾아보고 스스로 해결책을 시도해본다."
      },
      {
        "value": "I" as const,
        "label": "문제의 근본 원인을 파고들어 여러 해결 방안을 비교한다."
      },
      {
        "value": "S" as const,
        "label": "문제가 얼마나 심각한지 객관적으로 평가한 뒤 대응 수위를 정한다."
      },
      {
        "value": "C" as const,
        "label": "이 문제를 겪어본 선배나 동료를 찾아 경험담과 조언을 듣는다."
      }
    ]
  },
  {
    "id": "disc_007",
    "source": "" as const,
    "text": "프로젝트가 한창 진행 중인데 갑자기 한 시간 뒤 중간 점검 미팅이 잡혔습니다. 당신은?",
    "options": [
      {
        "value": "D" as const,
        "label": "핵심 성과와 진행 현황만 빠르게 정리해서 가져간다."
      },
      {
        "value": "I" as const,
        "label": "준비한 자료의 완성도를 최대한 높여서 발표한다."
      },
      {
        "value": "S" as const,
        "label": "동료들과 각자 발표 범위를 나누고 역할을 사전 조율한다."
      },
      {
        "value": "C" as const,
        "label": "완성도와 중요도를 기준으로 공유할 내용의 우선순위를 정한다."
      }
    ]
  },
  {
    "id": "disc_008",
    "source": "" as const,
    "text": "프로젝트 중간에 아무도 예상하지 못한 기술적 문제가 터졌습니다. 당신의 첫 번째 반응은?",
    "options": [
      {
        "value": "D" as const,
        "label": "관련 팀원들을 바로 모아서 함께 해결 방안을 논의한다."
      },
      {
        "value": "I" as const,
        "label": "문제의 구조를 빠르게 파악하고 가능한 해결책을 떠올린다."
      },
      {
        "value": "S" as const,
        "label": "문제의 원인을 차분하게 추적하고 다음 수순을 계획한다."
      },
      {
        "value": "C" as const,
        "label": "문제의 범위와 영향도를 팀에 공유하고 의견을 수렴한다."
      }
    ]
  },
  {
    "id": "disc_009",
    "source": "" as const,
    "text": "팀에 업무 태도가 좋지 않고 자주 문제를 일으키는 멤버가 있습니다. 당신이라면?",
    "options": [
      {
        "value": "D" as const,
        "label": "해당 멤버에게 직접 만나서 솔직하게 문제를 이야기한다."
      },
      {
        "value": "I" as const,
        "label": "그 멤버의 역할 비중을 고려해서 대응 강도를 조절한다."
      },
      {
        "value": "S" as const,
        "label": "다른 팀원들과 먼저 상의해서 공동 대응 방안을 마련한다."
      },
      {
        "value": "C" as const,
        "label": "구체적으로 어떤 부분이 문제인지 한동안 관찰한 뒤 판단한다."
      }
    ]
  },
  {
    "id": "disc_010",
    "source": "" as const,
    "text": "여러 차례 피드백을 줬지만 해당 멤버가 전혀 개선되지 않고 있습니다. 다음 단계는?",
    "options": [
      {
        "value": "D" as const,
        "label": "에너지 낭비 대신 내가 직접 그 일까지 처리해 버린다."
      },
      {
        "value": "I" as const,
        "label": "마지막으로 한 번 더 설득해보고, 그래도 안 되면 단호하게 선을 긋는다."
      },
      {
        "value": "S" as const,
        "label": "상위 리더에게 공식적으로 보고하고 조치를 요청한다."
      },
      {
        "value": "C" as const,
        "label": "다른 멤버들과 현실적인 해결책을 함께 찾아본다."
      }
    ]
  },
  {
    "id": "disc_011",
    "source": "" as const,
    "text": "프로젝트 일정이 예정보다 밀리기 시작했습니다. 당신의 대응은?",
    "options": [
      {
        "value": "D" as const,
        "label": "병목 구간을 찾아내서 집중 투입으로 일정을 만회한다."
      },
      {
        "value": "I" as const,
        "label": "팀원들과 함께 현실적인 새 일정을 다시 잡는다."
      },
      {
        "value": "S" as const,
        "label": "일정 지연의 근본 원인을 파악하고 재발 방지책을 세운다."
      },
      {
        "value": "C" as const,
        "label": "각 업무의 효율을 높일 방법을 팀과 함께 모색한다."
      }
    ]
  },
  {
    "id": "disc_012",
    "source": "" as const,
    "text": "잘 되고 있던 프로젝트의 팀장이 갑자기 이직했습니다. 당신이 리더를 맡을 수도 있는 상황이라면?",
    "options": [
      {
        "value": "D" as const,
        "label": "지금까지 진행 상황을 재점검하고 놓친 부분이 없는지 확인한다."
      },
      {
        "value": "I" as const,
        "label": "내 역량을 증명할 기회로 보고, 반드시 성공시키겠다는 의지가 생긴다."
      },
      {
        "value": "S" as const,
        "label": "각 멤버의 현재 역할과 상태를 점검해서 공백이 없는지 확인한다."
      },
      {
        "value": "C" as const,
        "label": "현재 흐름을 유지하면서 혼란을 최소화하는 방법을 멤버들과 논의한다."
      }
    ]
  },
  {
    "id": "disc_013",
    "source": "" as const,
    "text": "새 팀장으로서 프로젝트를 이어받았습니다. 가장 먼저 하고 싶은 일은?",
    "options": [
      {
        "value": "D" as const,
        "label": "개별 면담을 통해 멤버들과의 신뢰 관계를 빠르게 구축한다."
      },
      {
        "value": "I" as const,
        "label": "내가 직접 더 깊이 고민해서 팀에 새로운 방향을 제시한다."
      },
      {
        "value": "S" as const,
        "label": "기존 체계를 유지하면서 전환기의 불안을 안정시킨다."
      },
      {
        "value": "C" as const,
        "label": "나의 업무 방식에 맞게 일정과 역할 배분을 재정비한다."
      }
    ]
  },
  {
    "id": "disc_014",
    "source": "" as const,
    "text": "완전히 새로운 프로젝트가 시작됩니다. 당신이 가장 먼저 착수하는 것은?",
    "options": [
      {
        "value": "D" as const,
        "label": "핵심 목표와 달성 전략의 큰 그림을 먼저 그린다."
      },
      {
        "value": "I" as const,
        "label": "팀원들의 강점을 파악하고 시너지 낼 수 있는 구조를 구상한다."
      },
      {
        "value": "S" as const,
        "label": "마일스톤별 세부 실행 계획을 꼼꼼하게 수립한다."
      },
      {
        "value": "C" as const,
        "label": "팀원들과 일정, 예산, 범위를 함께 논의하며 합의를 이끌어낸다."
      }
    ]
  },
  {
    "id": "disc_015",
    "source": "" as const,
    "text": "프로젝트 도중 두 팀원 사이에 의견 충돌이 심해졌습니다. 당신이 리더라면?",
    "options": [
      {
        "value": "D" as const,
        "label": "양쪽 주장의 타당성을 냉정하게 비교 분석해서 방향을 결정한다."
      },
      {
        "value": "I" as const,
        "label": "각자의 의견에서 좋은 점을 조합해서 절충안을 만들어낸다."
      },
      {
        "value": "S" as const,
        "label": "양쪽을 따로 만나 이야기를 들은 뒤 대화의 장을 마련한다."
      },
      {
        "value": "C" as const,
        "label": "서로의 입장을 이해할 수 있는 분위기를 조성하며 합의점을 찾는다."
      }
    ]
  },
  {
    "id": "disc_016",
    "source": "" as const,
    "text": "리더로서 이끈 프로젝트가 끝났는데, 실패는 아니지만 기대만큼의 성과는 아닙니다. 당신의 반응은?",
    "options": [
      {
        "value": "D" as const,
        "label": "실패하지 않았으니 일단 괜찮다, 다음에 더 높이 가면 된다."
      },
      {
        "value": "I" as const,
        "label": "기대에 못 미친 원인을 구체적으로 분석해서 교훈을 뽑는다."
      },
      {
        "value": "S" as const,
        "label": "목표 대비 갭을 인정하고, 어디서 부족했는지 솔직히 돌아본다."
      },
      {
        "value": "C" as const,
        "label": "팀원 모두의 노력을 인정하고, 다음엔 더 잘할 수 있다고 격려한다."
      }
    ]
  },
  {
    "id": "disc_017",
    "source": "" as const,
    "text": "회사가 해당 프로젝트를 보완해서 재도전하기로 결정했습니다. 여전히 당신이 리더입니다. 첫 생각은?",
    "options": [
      {
        "value": "D" as const,
        "label": "이번에는 내가 더 깊이 파고들어서 확실히 성과를 낸다."
      },
      {
        "value": "I" as const,
        "label": "멤버들의 사기를 다시 끌어올려서 팀 결속력을 높이겠다."
      },
      {
        "value": "S" as const,
        "label": "이전에 발생한 돌발 변수를 사전에 차단할 수 있도록 대비하겠다."
      },
      {
        "value": "C" as const,
        "label": "지난번에 잘된 것과 부족했던 것을 체계적으로 비교 분석하겠다."
      }
    ]
  },
  {
    "id": "disc_018",
    "source": "" as const,
    "text": "재도전 프로젝트가 많은 어려움 끝에 훌륭한 성과를 거뒀습니다. 지금 당신의 마음은?",
    "options": [
      {
        "value": "D" as const,
        "label": "마무리까지 잘 끝나서 홀가분하다."
      },
      {
        "value": "I" as const,
        "label": "내가 세웠던 목표를 달성했다는 성취감이 크다."
      },
      {
        "value": "S" as const,
        "label": "힘든 시간을 함께한 멤버들에게 고마움을 직접 표현하고 싶다."
      },
      {
        "value": "C" as const,
        "label": "이번 성공의 핵심 요인이 무엇이었는지 기록해 두고 싶다."
      }
    ]
  },
  {
    "id": "disc_019",
    "source": "" as const,
    "text": "프로젝트 성공에 대한 포상이 예정되어 있습니다. 리더로서 배분 기준에 대한 당신의 생각은?",
    "options": [
      {
        "value": "D" as const,
        "label": "개인별 기여도를 데이터로 정리해서 합리적으로 나눠야 한다."
      },
      {
        "value": "I" as const,
        "label": "리더와 멤버 각각의 역할 가치에 맞게 차등 지급해야 한다."
      },
      {
        "value": "S" as const,
        "label": "최종 책임을 진 리더가 더 큰 몫을 받는 것이 맞다."
      },
      {
        "value": "C" as const,
        "label": "모두가 힘든 시간을 견뎠으니 균등하게 나누는 것이 공정하다."
      }
    ]
  },
  {
    "id": "disc_020",
    "source": "" as const,
    "text": "조만간 또 다른 프로젝트가 시작될 예정이지만, 아직 내용도 리더도 정해지지 않았습니다. 지금 당신의 생각은?",
    "options": [
      {
        "value": "D" as const,
        "label": "성공을 함께 경험한 현재 팀원들과 계속 같이 하고 싶다."
      },
      {
        "value": "I" as const,
        "label": "이번 경험을 바탕으로 어떤 프로젝트든 더 잘할 자신이 있다."
      },
      {
        "value": "S" as const,
        "label": "이번에도 내가 리더를 맡아서 주도적으로 이끌고 싶다."
      },
      {
        "value": "C" as const,
        "label": "프로젝트 내용을 보고 나서 참여 여부를 신중하게 결정하겠다."
      }
    ]
  },
  {
    "id": "disc_021",
    "source": "" as const,
    "text": "분기 목표가 공유되었고, 각자 실행 방안을 수립해야 합니다. 당신의 접근 방식은?",
    "options": [
      {
        "value": "D" as const,
        "label": "당장 실행 가능한 것부터 빠르게 착수해서 결과를 만든다."
      },
      {
        "value": "I" as const,
        "label": "팀원들과 아이디어를 나누며 에너지를 모아 함께 시작한다."
      },
      {
        "value": "S" as const,
        "label": "주어진 리소스 내에서 무리 없는 실행 계획을 먼저 설계한다."
      },
      {
        "value": "C" as const,
        "label": "목표를 세분화하고 각 단계의 체크포인트를 상세히 정한다."
      }
    ]
  },
  {
    "id": "disc_022",
    "source": "" as const,
    "text": "연속된 야근과 촉박한 마감으로 스트레스가 쌓이고 있습니다. 당신은 어떻게 하나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "스트레스의 원인인 업무 자체를 빠르게 끝내버려서 해소한다."
      },
      {
        "value": "I" as const,
        "label": "동료들과 함께 밥을 먹거나 수다를 떨며 기분을 전환한다."
      },
      {
        "value": "S" as const,
        "label": "잠시 혼자만의 시간을 갖고 조용히 마음을 정리한다."
      },
      {
        "value": "C" as const,
        "label": "스트레스를 유발하는 요인을 목록으로 정리하고 하나씩 제거한다."
      }
    ]
  },
  {
    "id": "disc_023",
    "source": "" as const,
    "text": "팀 회식 자리에서 자연스럽게 대화가 이어지고 있습니다. 당신은 주로 어떤 포지션인가요?",
    "options": [
      {
        "value": "D" as const,
        "label": "화제를 던지고 대화의 방향을 이끌어가는 편이다."
      },
      {
        "value": "I" as const,
        "label": "재미있는 이야기로 분위기를 살리고 웃음을 만든다."
      },
      {
        "value": "S" as const,
        "label": "옆 사람과 조용히 깊은 이야기를 나누는 걸 좋아한다."
      },
      {
        "value": "C" as const,
        "label": "주로 듣고 있다가 흥미로운 주제에만 의견을 보탠다."
      }
    ]
  },
  {
    "id": "disc_024",
    "source": "" as const,
    "text": "이전에 해본 적 없는 완전히 새로운 업무가 떨어졌습니다. 당신의 첫 반응은?",
    "options": [
      {
        "value": "D" as const,
        "label": "일단 부딪혀보면서 배우는 게 가장 빠르다고 생각한다."
      },
      {
        "value": "I" as const,
        "label": "새로운 걸 해볼 수 있다니 흥미롭다, 주변에 경험자가 있는지 물어본다."
      },
      {
        "value": "S" as const,
        "label": "맡긴 이유가 있겠지, 차근차근 알아가면서 해보겠다."
      },
      {
        "value": "C" as const,
        "label": "관련 자료를 충분히 조사하고 프로세스를 이해한 뒤 시작한다."
      }
    ]
  },
  {
    "id": "disc_025",
    "source": "" as const,
    "text": "중요한 의사결정의 순간입니다. 선택지 A와 B 모두 장단점이 있을 때 당신은?",
    "options": [
      {
        "value": "D" as const,
        "label": "빠르게 하나를 선택하고 실행하면서 수정해간다."
      },
      {
        "value": "I" as const,
        "label": "팀원들에게 각자 생각을 물어보고 다수 의견을 참고한다."
      },
      {
        "value": "S" as const,
        "label": "각각의 리스크를 충분히 비교한 뒤 신중하게 결정한다."
      },
      {
        "value": "C" as const,
        "label": "데이터와 근거를 모아서 논리적으로 더 나은 쪽을 도출한다."
      }
    ]
  },
  {
    "id": "disc_026",
    "source": "" as const,
    "text": "부서 간 협업에서 의견이 팽팽히 맞서고 있습니다. 당신의 행동 방식은?",
    "options": [
      {
        "value": "D" as const,
        "label": "내가 직접 양쪽 사이에서 결론을 내리겠다."
      },
      {
        "value": "I" as const,
        "label": "양쪽 모두의 이야기를 듣고 공통점을 찾아 합의를 이끈다."
      },
      {
        "value": "S" as const,
        "label": "충돌이 커지지 않도록 조심스럽게 분위기를 관리한다."
      },
      {
        "value": "C" as const,
        "label": "감정을 배제하고 객관적인 팩트만으로 판단 기준을 정리한다."
      }
    ]
  },
  {
    "id": "disc_027",
    "source": "" as const,
    "text": "타 부서 사람들과 처음 함께 일하게 되었습니다. 협업 초기에 당신이 중시하는 것은?",
    "options": [
      {
        "value": "D" as const,
        "label": "각자의 목표와 기대치를 명확히 해서 방향을 빨리 잡는다."
      },
      {
        "value": "I" as const,
        "label": "가벼운 대화부터 시작해서 서로 편한 관계를 먼저 만든다."
      },
      {
        "value": "S" as const,
        "label": "서로의 업무 스타일을 파악하고 맞춰가는 시간을 갖는다."
      },
      {
        "value": "C" as const,
        "label": "역할, 일정, 커뮤니케이션 규칙을 처음부터 명확히 정한다."
      }
    ]
  },
  {
    "id": "disc_028",
    "source": "" as const,
    "text": "일하면서 가장 보람을 느끼는 순간은 언제인가요?",
    "options": [
      {
        "value": "D" as const,
        "label": "도전적인 목표를 끝내 달성했을 때."
      },
      {
        "value": "I" as const,
        "label": "함께한 사람들과 성취의 기쁨을 나눌 때."
      },
      {
        "value": "S" as const,
        "label": "꾸준히 쌓아온 것이 안정적인 결과로 이어졌을 때."
      },
      {
        "value": "C" as const,
        "label": "꼼꼼하게 준비한 것이 오류 없이 정확하게 작동할 때."
      }
    ]
  },
  {
    "id": "disc_029",
    "source": "" as const,
    "text": "상사에게 예상치 못한 날카로운 피드백을 받았습니다. 그 순간 당신은?",
    "options": [
      {
        "value": "D" as const,
        "label": "알겠다, 바로 수정하자 — 즉시 개선 행동에 들어간다."
      },
      {
        "value": "I" as const,
        "label": "아쉽지만 배울 점이 있네 — 긍정적으로 수용하고 대화를 이어간다."
      },
      {
        "value": "S" as const,
        "label": "그 말이 맞는지 곰곰이 생각해 본 뒤 천천히 반영한다."
      },
      {
        "value": "C" as const,
        "label": "피드백의 근거를 되짚어보고 개선 방향을 체계적으로 설계한다."
      }
    ]
  },
  {
    "id": "disc_030",
    "source": "" as const,
    "text": "요즘 업무 동기가 좀 떨어진 것 같습니다. 당신에게 가장 효과적인 동기 부여 방법은?",
    "options": [
      {
        "value": "D" as const,
        "label": "더 높은 목표나 도전적인 과제를 스스로 부여한다."
      },
      {
        "value": "I" as const,
        "label": "동료들의 응원이나 인정을 받으면 다시 불이 붙는다."
      },
      {
        "value": "S" as const,
        "label": "안정적인 환경과 명확한 역할이 주어지면 힘이 난다."
      },
      {
        "value": "C" as const,
        "label": "내 일의 결과물이 실질적인 문제를 해결할 때 보람을 느낀다."
      }
    ]
  },
  {
    "id": "disc_031",
    "source": "" as const,
    "text": "업계 컨퍼런스에서 처음 보는 사람들과 네트워킹 시간이 주어졌습니다. 당신은?",
    "options": [
      {
        "value": "D" as const,
        "label": "먼저 악수를 건네고 내 소개와 함께 대화를 시작한다."
      },
      {
        "value": "I" as const,
        "label": "분위기에 자연스럽게 녹아들면서 여러 사람과 가볍게 대화한다."
      },
      {
        "value": "S" as const,
        "label": "한두 명과 깊은 이야기를 나누며 관계를 천천히 쌓는다."
      },
      {
        "value": "C" as const,
        "label": "상대방의 이야기를 먼저 듣고, 공통 관심사를 파악한 뒤 대화에 참여한다."
      }
    ]
  },
  {
    "id": "disc_032",
    "source": "" as const,
    "text": "새로운 업무 도구나 시스템을 배워야 할 때, 당신이 선호하는 학습법은?",
    "options": [
      {
        "value": "D" as const,
        "label": "일단 직접 써보면서 몸으로 익힌다."
      },
      {
        "value": "I" as const,
        "label": "이미 잘 아는 동료에게 물어가며 함께 배운다."
      },
      {
        "value": "S" as const,
        "label": "매뉴얼이나 가이드를 천천히 읽으며 단계별로 따라한다."
      },
      {
        "value": "C" as const,
        "label": "전체 구조와 원리를 먼저 이해한 뒤 세부 기능을 탐색한다."
      }
    ]
  },
  {
    "id": "disc_033",
    "source": "" as const,
    "text": "일하다 보면 유독 지치거나 짜증이 나는 상황이 있습니다. 당신에게 그 상황은?",
    "options": [
      {
        "value": "D" as const,
        "label": "결정이 미뤄지고 실행이 지연되는 비효율적인 상황."
      },
      {
        "value": "I" as const,
        "label": "팀 분위기가 냉랭하거나 소통이 단절된 상황."
      },
      {
        "value": "S" as const,
        "label": "갑작스러운 방향 전환이 반복되는 불안정한 상황."
      },
      {
        "value": "C" as const,
        "label": "근거 없는 판단이나 부정확한 정보로 일이 진행되는 상황."
      }
    ]
  },
  {
    "id": "disc_034",
    "source": "" as const,
    "text": "새해를 맞아 올해의 업무 목표를 세워야 합니다. 당신이 세우는 목표의 특징은?",
    "options": [
      {
        "value": "D" as const,
        "label": "작년보다 확실히 높은, 도전적인 숫자 목표를 잡는다."
      },
      {
        "value": "I" as const,
        "label": "팀이나 주변 사람들과 함께 달성할 수 있는 공동 목표를 설정한다."
      },
      {
        "value": "S" as const,
        "label": "무리하지 않는 선에서 꾸준히 성장할 수 있는 현실적인 목표를 잡는다."
      },
      {
        "value": "C" as const,
        "label": "달성 여부를 명확히 판단할 수 있도록 수치와 기한을 구체적으로 정한다."
      }
    ]
  },
  {
    "id": "disc_035",
    "source": "" as const,
    "text": "업무 중 갑자기 시스템 오류로 작업물이 날아갔습니다. 당신의 즉각적인 반응은?",
    "options": [
      {
        "value": "D" as const,
        "label": "곧바로 복구 시도에 들어가고, 안 되면 처음부터 빠르게 다시 한다."
      },
      {
        "value": "I" as const,
        "label": "같은 경험을 해본 동료를 찾아가서 해결 방법을 물어본다."
      },
      {
        "value": "S" as const,
        "label": "잠시 심호흡하고, 남아있는 것을 확인한 뒤 차분하게 복구한다."
      },
      {
        "value": "C" as const,
        "label": "오류 원인을 먼저 파악하고, 같은 일이 반복되지 않도록 대비책을 만든다."
      }
    ]
  },
  {
    "id": "disc_036",
    "source": "" as const,
    "text": "팀 내에서 당신이 자연스럽게 맡게 되는 역할은 무엇인가요?",
    "options": [
      {
        "value": "D" as const,
        "label": "전체 방향을 정하고 추진력을 만들어내는 역할."
      },
      {
        "value": "I" as const,
        "label": "팀 분위기를 띄우고 소통의 가교 역할."
      },
      {
        "value": "S" as const,
        "label": "묵묵히 맡은 바를 해내며 다른 사람을 돕는 역할."
      },
      {
        "value": "C" as const,
        "label": "품질을 관리하고 실수를 미리 잡아내는 역할."
      }
    ]
  },
  {
    "id": "disc_037",
    "source": "" as const,
    "text": "점심시간에 갑자기 오후 회의 안건에 대한 결정을 내려달라는 요청이 왔습니다. 당신은?",
    "options": [
      {
        "value": "D" as const,
        "label": "핵심만 훑어보고 그 자리에서 바로 답을 준다."
      },
      {
        "value": "I" as const,
        "label": "가까운 동료에게 빠르게 의견을 물어보고 결정한다."
      },
      {
        "value": "S" as const,
        "label": "오후 회의 전까지 시간을 달라고 하고 천천히 검토한다."
      },
      {
        "value": "C" as const,
        "label": "관련 자료를 확인하고 논리적 근거를 만든 뒤 답변한다."
      }
    ]
  },
  {
    "id": "disc_038",
    "source": "" as const,
    "text": "오래 함께 일한 동료가 다른 팀으로 이동하게 됩니다. 이별 방식에서 당신의 스타일은?",
    "options": [
      {
        "value": "D" as const,
        "label": "서로의 성장을 위한 일이니 깔끔하게 보내준다."
      },
      {
        "value": "I" as const,
        "label": "작은 송별 모임을 열어 함께한 시간을 즐겁게 마무리한다."
      },
      {
        "value": "S" as const,
        "label": "개인적으로 따로 만나서 진심 어린 감사를 전한다."
      },
      {
        "value": "C" as const,
        "label": "인수인계를 꼼꼼하게 하면서 빈틈 없이 마무리한다."
      }
    ]
  },
  {
    "id": "disc_039",
    "source": "" as const,
    "text": "하루에 처리해야 할 업무가 5개 이상 겹쳤습니다. 당신의 시간 관리법은?",
    "options": [
      {
        "value": "D" as const,
        "label": "가장 임팩트가 큰 일부터 끝내고 나머지를 쳐낸다."
      },
      {
        "value": "I" as const,
        "label": "동료에게 도움을 요청하거나 협업 가능한 것부터 처리한다."
      },
      {
        "value": "S" as const,
        "label": "전체 할 일을 나열하고 시간 블록별로 배분해서 하나씩 한다."
      },
      {
        "value": "C" as const,
        "label": "마감일과 중요도를 기준으로 체크리스트를 만들어 순서대로 진행한다."
      }
    ]
  },
  {
    "id": "disc_040",
    "source": "" as const,
    "text": "금요일 오후, 다음 주 업무를 미리 정리하는 시간입니다. 당신이 가장 먼저 하는 일은?",
    "options": [
      {
        "value": "D" as const,
        "label": "다음 주의 핵심 목표 1-2개를 확정하고 나머지는 유연하게 둔다."
      },
      {
        "value": "I" as const,
        "label": "다음 주에 만날 사람들과 미팅 일정을 먼저 확인한다."
      },
      {
        "value": "S" as const,
        "label": "무리하지 않는 선에서 안정적으로 진행할 수 있는 계획을 짠다."
      },
      {
        "value": "C" as const,
        "label": "이번 주 미완료 사항을 점검하고 다음 주 일정표를 상세히 작성한다."
      }
    ]
  }
];
