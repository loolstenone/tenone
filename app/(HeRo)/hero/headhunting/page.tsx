"use client";

/**
 * 헤드헌팅 (2026-10-13) — HeRo 담당자가 직접 후보를 찾아 추천·면접 조율
 * 유료직업소개사업 등록 전제 (사용자 결정) · 후보 정보는 본인 동의 후에만 기업에 (제17조)
 */
import { Search, UserCheck, CalendarCheck } from "lucide-react";
import { BusinessServicePage } from "@/features/hero/business/BusinessServicePage";

export default function HeadhuntingPage() {
    return (
        <BusinessServicePage
            service="headhunting"
            title={<>꼭 맞는 한 사람,<br />HeRo가 직접 찾습니다</>}
            desc="공고로는 잘 오지 않는 자리라면 HeRo 담당자가 직접 나섭니다. 포지션과 팀 상황을 깊게 듣고, HeRo 인재 풀과 네트워크에서 후보를 골라 추천하고 면접까지 조율합니다."
            deliverables={[
                { icon: Search, title: "포지션 정리", desc: "맡을 일·필요한 역량·팀 상황을 함께 정리해, 어떤 사람을 찾을지부터 분명히 합니다." },
                { icon: UserCheck, title: "후보 추천", desc: "검사 결과와 경력을 함께 보고 고른 후보를 추천 사유와 함께 드립니다. 후보 본인이 동의한 경우만 정보를 전달합니다." },
                { icon: CalendarCheck, title: "면접 조율", desc: "면접 일정·피드백 전달·처우 협의까지 담당자가 사이에서 챙깁니다." },
            ]}
            steps={[
                { title: "의뢰·상담", desc: "포지션과 조건을 남겨 주시면 담당자가 연락드려 자세히 듣습니다." },
                { title: "후보 찾기", desc: "HeRo 인재 풀과 네트워크에서 후보를 찾고, 후보에게 먼저 의사를 묻습니다." },
                { title: "추천·면접", desc: "동의한 후보를 추천하고 면접 일정을 조율합니다." },
                { title: "합류와 그 뒤", desc: "합류 뒤에도 적응 상황을 확인해 양쪽의 이야기를 듣습니다." },
            ]}
            principles={[
                { title: "후보 동의가 먼저", desc: "후보의 이름·이력은 후보가 이 포지션에 관심을 보이고 동의한 뒤에만 전달합니다." },
                { title: "서류는 기한까지만", desc: "받은 이력서는 채용 절차가 끝나면 돌려주거나 파기하도록 안내합니다 (채용절차법)." },
                { title: "공정한 기준", desc: "성별·나이·출신 등 업무와 무관한 조건으로 후보를 거르지 않습니다." },
            ]}
            faq={[
                { q: "인재 찾기와 무엇이 다른가요?", a: "인재 찾기는 조건을 골라 직접 제안을 보내는 방식이고, 헤드헌팅은 담당자가 포지션을 깊게 듣고 후보를 골라 추천하는 방식입니다. 찾기 어려운 자리나 리더급 포지션에 맞습니다." },
                { q: "얼마나 걸리나요?", a: "포지션에 따라 다릅니다. 상담 때 예상 일정을 함께 정합니다." },
                { q: "HeRo 회원이 아닌 사람도 추천받을 수 있나요?", a: "네트워크로 찾은 후보도 추천할 수 있습니다. 이때도 후보 본인의 동의를 먼저 받습니다." },
            ]}
        />
    );
}
