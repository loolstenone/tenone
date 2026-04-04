/** HIT A — 기저요인 문항 (B-환경 시트에서 추출) */
import type { BaseQuestion } from "@/types/hit";

export const baseQuestions: BaseQuestion[] = [
  {
    "id": "base_001",
    "text": "부모님의 양육 방식은 어떻게 되었나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "도전적인 목표를 설정하고 성취하도록 독려했다."
      },
      {
        "value": "I" as const,
        "label": "사회적 활동에 참여하도록 장려하고 지원했다."
      },
      {
        "value": "S" as const,
        "label": "꾸준한 지지와 안정된 환경을 제공했다."
      },
      {
        "value": "C" as const,
        "label": "체계적인 학습과 분석적인 사고를 장려했다."
      }
    ]
  },
  {
    "id": "base_002",
    "text": "부모님은 주로 어떤 방식으로 당신을 격려하셨나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "성취한 목표에 대해 주로 칭찬했다."
      },
      {
        "value": "I" as const,
        "label": "사회적 활동과 사람들과의 교류를 통해 격려하셨다."
      },
      {
        "value": "S" as const,
        "label": "차분하고 안정적인 환경을 제공하며 격려하셨다."
      },
      {
        "value": "C" as const,
        "label": "논리적이고 분석적인 피드백을 통해 격려하셨다."
      }
    ]
  },
  {
    "id": "base_003",
    "text": "부모님은 당신이 문제를 일으켰을 때 어떻게 반응하셨나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "즉각적으로 문제를 지적하고 행동을 하게끔했다."
      },
      {
        "value": "I" as const,
        "label": "문제에 대해 대화하며 이해하려고 노력했다."
      },
      {
        "value": "S" as const,
        "label": "차분하게 문제를 지적하고 해결하도록 도와주셨다."
      },
      {
        "value": "C" as const,
        "label": "문제의 원인에 대해 심사숙고하고 논리적으로 이야기해 주셨다."
      }
    ]
  },
  {
    "id": "base_004",
    "text": "어렸을 때, 가정에서의 규칙이나 규율이 있을 때, 당신은 어떻게 따랐나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "규칙을 빠르게 이해하고 따랐다."
      },
      {
        "value": "I" as const,
        "label": "규칙에 대해 가족들과 논의하고 이해하려 했다."
      },
      {
        "value": "S" as const,
        "label": "규칙을 신중하게 받아들이고 따랐다."
      },
      {
        "value": "C" as const,
        "label": "규칙의 이유와 목적을 분석하고 따랐다."
      }
    ]
  },
  {
    "id": "base_005",
    "text": "가족 구성원 안에서 당신은 주로 어떤 역할을 했나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "이벤트를 주도하고 리더 역할을 했다."
      },
      {
        "value": "I" as const,
        "label": "모든 가족 구성원들과 활발히 소통했다."
      },
      {
        "value": "S" as const,
        "label": "조용히 가족들을 지켜보고 지원하는 역할을 했다."
      },
      {
        "value": "C" as const,
        "label": "가족들이 직면한 문제를 분석하고 해결책을 제시했다."
      }
    ]
  },
  {
    "id": "base_006",
    "text": "어렸을 때, 어려운 상황에서 당신은 주로 어떻게 대처했나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "빠르게 해결책을 찾아 행동했다."
      },
      {
        "value": "I" as const,
        "label": "친구나 가족에게 도움을 요청했다."
      },
      {
        "value": "S" as const,
        "label": "신중하게 상황을 관찰하고 대응했다."
      },
      {
        "value": "C" as const,
        "label": "문제를 분석하고 계획을 세워 해결했다."
      }
    ]
  },
  {
    "id": "base_007",
    "text": "어렸을 때, 가족 구성원 간에 의견 차이가 있을 때 어떻게 해결했나요?",
    "options": [
      {
        "value": "D" as const,
        "label": "빠르게 결정을 내리고 의견을 조율했다."
      },
      {
        "value": "I" as const,
        "label": "대화를 통해 모든 가족 구성원의 의견을 듣고 조정했다."
      },
      {
        "value": "S" as const,
        "label": "차분히 시간을 두고 신중하게 의견을 조율했다."
      },
      {
        "value": "C" as const,
        "label": "문제의 원인을 분석하고 논리적으로 해결했다."
      }
    ]
  }
];
