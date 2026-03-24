"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Save,
  FileDown,
  Eye,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  User,
  Lightbulb,
  CheckCircle2,
  Circle,
} from "lucide-react";
import clsx from "clsx";
import * as heroDb from "@/lib/supabase/hero";
import { useAuth } from "@/lib/auth-context";

// ─── Types ───────────────────────────────────────────────────────

interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  year: string;
  gpa: string;
}

interface Certificate {
  id: string;
  name: string;
  grade: string;
  year: string;
  issuer: string;
}

interface Award {
  id: string;
  year: string;
  contest: string;
  detail: string;
}

interface Judging {
  id: string;
  year: string;
  org: string;
  role: string;
}

interface Lecture {
  id: string;
  year: string;
  org: string;
  course: string;
}

interface ExternalActivity {
  id: string;
  year: string;
  activity: string;
  role: string;
}

interface BrandCategory {
  id: string;
  category: string;
  brands: string;
}

interface Achievement {
  id: string;
  company: string;
  period: string;
  project: string;
  background: string;
  problem: string;
  solution: string;
  role: string;
  result: string;
}

interface CareerSummary {
  id: string;
  period: string;
  company: string;
  position: string;
  summary: string;
}

interface CareerDetail {
  id: string;
  company: string;
  projects: string;
}

// ─── ID Generator ────────────────────────────────────────────────

let _idCounter = 100;
const genId = () => `_${++_idCounter}`;

// ─── Component ───────────────────────────────────────────────────

export default function ResumePage() {
  const { user } = useAuth();
  const [dbResumeId, setDbResumeId] = useState<string | null>(null);

  // Section 1: 타이틀
  const [slogan, setSlogan] = useState("가치로 연결된 세계관을 만드는");
  const [fullName, setFullName] = useState("전천일");

  // Section 2: 개인정보
  const [nameKr, setNameKr] = useState("전천일");
  const [nameHanja, setNameHanja] = useState("全天一");
  const [nameEn, setNameEn] = useState("Cheonil Jeon");
  const [birth, setBirth] = useState("1978.01.01");
  const [address, setAddress] = useState("서울특별시 강남구");
  const [mobile, setMobile] = useState("010-0000-0000");
  const [email, setEmail] = useState("ceo@tenone.biz");
  const [military, setMilitary] = useState("군필 (육군 병장 만기 전역)");
  const [etc, setEtc] = useState("");

  // Section 3: 학력, 자격
  const [educations, setEducations] = useState<Education[]>([
    { id: "e1", school: "동국대학교", major: "경영학과", degree: "학사", year: "2002", gpa: "3.5/4.5" },
  ]);
  const [certificates, setCertificates] = useState<Certificate[]>([
    { id: "ct1", name: "컴퓨터활용능력", grade: "1급", year: "2001", issuer: "대한상공회의소" },
  ]);

  // Section 4: 수상, 강의, 심사, 외부 활동
  const [awards, setAwards] = useState<Award[]>([
    { id: "a1", year: "2019", contest: "대한민국 광고대상", detail: "TV 부문 금상 (LG 캠페인)" },
    { id: "a2", year: "2017", contest: "서울영상광고제", detail: "디지털 부문 대상" },
  ]);
  const [judgings, setJudgings] = useState<Judging[]>([
    { id: "j1", year: "2024", org: "서울산업진흥원 (SBA)", role: "콘텐츠 공모전 심사위원" },
    { id: "j2", year: "2023", org: "한국관광공사", role: "관광 콘텐츠 심사위원" },
  ]);
  const [lectures, setLectures] = useState<Lecture[]>([
    { id: "l1", year: "2025", org: "동국대학교 RISE", course: "브랜드 전략과 크리에이티브" },
  ]);
  const [activities, setActivities] = useState<ExternalActivity[]>([
    { id: "x1", year: "2025", activity: "MADLeague 대학 동아리 연합", role: "설립자 / 운영 총괄" },
  ]);

  // Section 5: 업무 강점
  const [strengthText, setStrengthText] = useState(
    "20년간 종합광고대행사에서 BX 디렉터로 활동하며, 브랜드 전략 수립부터 크리에이티브 디렉션, 캠페인 실행까지 Full-Funnel 경험을 보유. 특히 커뮤니티 기반 브랜드 빌딩과 AI 기술 융합 마케팅에 강점."
  );
  const [atlText, setAtlText] = useState("TV CF 기획/제작 (LG, 삼성, 현대 등), 신문/잡지 광고 캠페인, 라디오 브랜드 캠페인");
  const [btlText, setBtlText] = useState("프로모션 기획 (브랜드 체험 이벤트), 전시/박람회 부스 디자인, 팝업스토어 기획 운영");
  const [digitalText, setDigitalText] = useState("브랜드 사이트 기획, 모바일 앱 UX, 온라인 광고 (DA/SA), 퍼포먼스 마케팅, SNS 콘텐츠 전략");
  const [consultingText, setConsultingText] = useState("소비자 리서치 기반 컨셉 개발, 브랜드 포지셔닝 전략, 시장 분석 및 인사이트 도출");
  const [crmText, setCrmText] = useState("Shopper 마케팅 전략, BI/CI 개발, 전시 마케팅, CRM 캠페인 설계");
  const [brandCategories, setBrandCategories] = useState<BrandCategory[]>([
    { id: "bc1", category: "IT/가전", brands: "LG전자, 삼성전자" },
    { id: "bc2", category: "자동차", brands: "현대자동차, 기아" },
    { id: "bc3", category: "F&B", brands: "CJ제일제당, 농심" },
    { id: "bc4", category: "AI/스타트업", brands: "TenOne Universe, LUKI, RooK" },
  ]);

  // Section 6: 주요 실적
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "ac1",
      company: "TenOne",
      period: "2024 - 현재",
      project: "LUKI AI 아이돌 그룹 런칭",
      background: "AI 크리에이터 시장의 급성장에 따라 차별화된 AI 아이돌 그룹 브랜드가 필요",
      problem: "AI 캐릭터에 대한 대중의 거부감과 팬덤 형성의 어려움",
      solution: "세계관 기반 스토리텔링 + 커뮤니티 참여형 콘텐츠 전략 설계",
      role: "총괄 디렉터 - 컨셉 기획, 세계관 설계, 크리에이티브 디렉션",
      result: "런칭 3개월 내 팬 커뮤니티 1,000명 확보, SNS 누적 조회 50만+",
    },
    {
      id: "ac2",
      company: "TenOne",
      period: "2025 - 현재",
      project: "MADLeague 대학 동아리 연합 구축",
      background: "대학생 크리에이터 생태계와 산업 현장 간 연결 부재",
      problem: "분산된 대학 동아리 간 교류 부족, 체계적 프로그램 부재",
      solution: "10개 대학 연합 네트워크 + 멘토링 프로그램 + 공동 프로젝트 운영",
      role: "설립자 / 운영 총괄 - 네트워크 설계, 프로그램 기획, 파트너십 구축",
      result: "10개 대학 참여, 월 1회 합동 세미나 운영, 3건의 산학협력 프로젝트 진행",
    },
    {
      id: "ac3",
      company: "TenOne",
      period: "2024 - 현재",
      project: "Badak 광고인 네트워크 구축",
      background: "광고/마케팅 업계 경력자 간 느슨한 네트워크 필요성 증가",
      problem: "기존 업계 모임은 폐쇄적이고, 실질적 협업으로 이어지기 어려움",
      solution: "온라인 기반 열린 네트워크 + 콘텐츠 공유 플랫폼 + 정기 밋업",
      role: "기획 총괄 - 플랫폼 설계, 커뮤니티 운영 전략, 콘텐츠 방향",
      result: "광고인 네트워크 300명+ 참여, 월 2회 콘텐츠 발행",
    },
  ]);

  // Section 7: 이력
  const [careerSummaries, setCareerSummaries] = useState<CareerSummary[]>([
    { id: "cs1", period: "2024 - 현재", company: "TenOne", position: "CEO / Founder", summary: "멀티 브랜드 생태계(LUKI, RooK, Badak, MADLeague) 총괄" },
    { id: "cs2", period: "2004 - 2024", company: "HSAD (LG계열 광고대행사)", position: "BX 디렉터 / 부장", summary: "LG전자, LG화학 등 주요 클라이언트 브랜드 전략 및 캠페인 총괄" },
  ]);
  const [careerDetails, setCareerDetails] = useState<CareerDetail[]>([
    { id: "cd1", company: "TenOne (2024 - 현재)", projects: "LUKI AI 아이돌 그룹, RooK AI 크리에이터, Badak 광고인 네트워크, MADLeague 대학 동아리 연합, Ten:One™ Universe 세계관 설계" },
    { id: "cd2", company: "HSAD (2004 - 2024)", projects: "LG전자 글로벌 캠페인 (TV/디지털), LG화학 브랜드 리뉴얼, 현대자동차 론칭 캠페인, 다수 ATL/BTL/디지털 캠페인 기획 및 실행" },
  ]);

  // UI states
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true,
  });
  const [saving, setSaving] = useState(false);

  // ─── DB 로드 ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    heroDb.fetchResumes(user.id)
      .then(rows => {
        if (rows.length > 0) {
          const r = rows[0];
          setDbResumeId(r.id);
          const c = r.content as Record<string, unknown> | undefined;
          if (c) {
            if (c.slogan) setSlogan(c.slogan as string);
            if (c.fullName) setFullName(c.fullName as string);
            if (c.nameKr) setNameKr(c.nameKr as string);
            if (c.nameHanja) setNameHanja(c.nameHanja as string);
            if (c.nameEn) setNameEn(c.nameEn as string);
            if (c.birth) setBirth(c.birth as string);
            if (c.address) setAddress(c.address as string);
            if (c.mobile) setMobile(c.mobile as string);
            if (c.email) setEmail(c.email as string);
            if (c.military) setMilitary(c.military as string);
            if (c.etc) setEtc(c.etc as string);
            if (c.educations) setEducations(c.educations as Education[]);
            if (c.certificates) setCertificates(c.certificates as Certificate[]);
            if (c.awards) setAwards(c.awards as Award[]);
            if (c.judgings) setJudgings(c.judgings as Judging[]);
            if (c.lectures) setLectures(c.lectures as Lecture[]);
            if (c.activities) setActivities(c.activities as ExternalActivity[]);
            if (c.strengthText) setStrengthText(c.strengthText as string);
            if (c.atlText) setAtlText(c.atlText as string);
            if (c.btlText) setBtlText(c.btlText as string);
            if (c.digitalText) setDigitalText(c.digitalText as string);
            if (c.consultingText) setConsultingText(c.consultingText as string);
            if (c.crmText) setCrmText(c.crmText as string);
            if (c.brandCategories) setBrandCategories(c.brandCategories as BrandCategory[]);
            if (c.achievements) setAchievements(c.achievements as Achievement[]);
            if (c.careerSummaries) setCareerSummaries(c.careerSummaries as CareerSummary[]);
            if (c.careerDetails) setCareerDetails(c.careerDetails as CareerDetail[]);
          }
        }
      })
      .catch(() => { /* Mock fallback */ });
  }, [user?.id]);

  // ─── Helpers ─────────────────────────────────────────────────────

  const toggleSection = (n: number) =>
    setOpenSections((prev) => ({ ...prev, [n]: !prev[n] }));

  const handleSave = () => {
    setSaving(true);
    // DB 저장
    if (user?.id) {
      const content = {
        slogan, fullName, nameKr, nameHanja, nameEn, birth, address, mobile, email, military, etc,
        educations, certificates, awards, judgings, lectures, activities,
        strengthText, atlText, btlText, digitalText, consultingText, crmText, brandCategories,
        achievements, careerSummaries, careerDetails,
      };
      const promise = dbResumeId
        ? heroDb.updateResume(dbResumeId, { content })
        : heroDb.createResume({ member_id: user.id, title: `${fullName} 이력서`, content });
      promise
        .then(data => { if (!dbResumeId && data?.id) setDbResumeId(data.id); })
        .catch(() => { /* silent */ });
    }
    setTimeout(() => setSaving(false), 1200);
  };

  // Generic CRUD helpers
  const addRow = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    blank: Omit<T, "id">
  ) => setter((prev) => [...prev, { ...blank, id: genId() } as T]);

  const removeRow = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: string
  ) => setter((prev) => prev.filter((r) => r.id !== id));

  const updateRow = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
    field: keyof T,
    val: string
  ) => setter((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));

  // Progress calculation
  const calcProgress = useCallback(() => {
    let filled = 0;
    const total = 7;
    if (slogan.trim() && fullName.trim()) filled++;
    if (nameKr.trim() && birth.trim() && mobile.trim()) filled++;
    if (educations.length > 0 && educations[0].school.trim()) filled++;
    if (awards.length > 0 || judgings.length > 0 || lectures.length > 0 || activities.length > 0) filled++;
    if (strengthText.trim()) filled++;
    if (achievements.length > 0 && achievements[0].project.trim()) filled++;
    if (careerSummaries.length > 0 && careerSummaries[0].company.trim()) filled++;
    return { filled, total };
  }, [slogan, fullName, nameKr, birth, mobile, educations, awards, judgings, lectures, activities, strengthText, achievements, careerSummaries]);

  const progress = calcProgress();

  // ─── Style classes ──────────────────────────────────────────────

  const inputCls =
    "w-full border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors";
  const textareaCls =
    "w-full border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 resize-none transition-colors";
  const labelCls = "block text-xs text-neutral-500 mb-0.5";
  const addBtnCls =
    "flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 transition-colors";
  const removeBtnCls = "p-1 text-neutral-300 hover:text-red-400 transition-colors";

  // ─── Section Wrapper ────────────────────────────────────────────

  const Section = ({
    num,
    title,
    tip,
    children,
  }: {
    num: number;
    title: string;
    tip: string;
    children: React.ReactNode;
  }) => {
    const isOpen = openSections[num] ?? true;
    return (
      <section className="border border-neutral-200 bg-white mb-3">
        {/* Header */}
        <button
          onClick={() => toggleSection(num)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
        >
          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-neutral-800 text-white text-xs font-bold rounded-sm">
            {num}
          </span>
          <span className="text-sm font-semibold text-neutral-800 flex-1">
            {title}
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          )}
        </button>

        {isOpen && (
          <div className="px-4 pb-4">
            {/* Tip */}
            <div className="flex items-start gap-2 mb-4 p-2.5 bg-neutral-50 border border-neutral-100">
              <Lightbulb className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-neutral-400 leading-relaxed">{tip}</p>
            </div>
            {/* Content */}
            {children}
          </div>
        )}
      </section>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">
            이력서 빌더
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            광고바닥 이력서 양식 기반 &middot; HeRo 프로필 연동
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress */}
          <div className="flex items-center gap-1.5 mr-3">
            {Array.from({ length: progress.total }, (_, i) => (
              <span key={i}>
                {i < progress.filled ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-neutral-700" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-neutral-300" />
                )}
              </span>
            ))}
            <span className="text-xs text-neutral-400 ml-1">
              {progress.filled}/{progress.total}
            </span>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
          >
            <Save className="h-3 w-3" />
            {saving ? "저장 중..." : "저장"}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
            <FileDown className="h-3 w-3" />
            PDF 내보내기
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
            <Eye className="h-3 w-3" />
            두괄식 보기
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         Section 1: 타이틀
         ═══════════════════════════════════════════════════════════ */}
      <Section
        num={1}
        title="타이틀"
        tip="구인 회사가 원하는 양식의 타이틀을 쓰자. 슬로건을 넣어 자신을 어필하자."
      >
        <div className="space-y-3">
          <div>
            <label className={labelCls}>슬로건</label>
            <input
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="끊임 없이 새로운 방법을 찾는"
              className={inputCls}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="flex-1">
              <label className={labelCls}>이름</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
              />
            </div>
            <span className="text-sm text-neutral-400 pt-4">이력서</span>
          </div>
          {/* Preview */}
          <div className="mt-3 p-4 bg-neutral-50 border border-neutral-100 text-center">
            <p className="text-xs text-neutral-400 italic mb-1">
              &ldquo;{slogan}&rdquo;
            </p>
            <p className="text-lg font-bold text-neutral-800">
              {fullName} <span className="font-normal text-neutral-500">이력서</span>
            </p>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         Section 2: 개인정보
         ═══════════════════════════════════════════════════════════ */}
      <Section
        num={2}
        title="개인정보"
        tip="필요한 기본 정보만 기입하자. 흡연/음주/건강/가족 사항은 불필요하다."
      >
        <div className="flex gap-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            <label className={labelCls}>사진 (선택)</label>
            <div className="w-28 h-36 bg-neutral-50 border border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors">
              <User className="h-8 w-8 text-neutral-300 mb-1" />
              <span className="text-xs text-neutral-300">업로드</span>
            </div>
          </div>
          {/* Fields */}
          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2">
            <div>
              <label className={labelCls}>이름 (한글)</label>
              <input value={nameKr} onChange={(e) => setNameKr(e.target.value)} className={inputCls} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={labelCls}>한자</label>
                <input value={nameHanja} onChange={(e) => setNameHanja(e.target.value)} className={inputCls} />
              </div>
              <div className="flex-1">
                <label className={labelCls}>영문</label>
                <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>생년월일</label>
              <input value={birth} onChange={(e) => setBirth(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>연락처 (Mobile)</label>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>현 주소</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>e-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>병적 사항</label>
              <input value={military} onChange={(e) => setMilitary(e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>기타</label>
              <input value={etc} onChange={(e) => setEtc(e.target.value)} placeholder="기타 전달 사항" className={inputCls} />
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         Section 3: 학력, 자격
         ═══════════════════════════════════════════════════════════ */}
      <Section
        num={3}
        title="학력, 자격"
        tip="업무와 관련된 전문성을 보일 수 있는 전공이나 자격사항을 기입하자."
      >
        {/* 학력 사항 */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">학력 사항</h3>
            <button
              onClick={() =>
                addRow(setEducations, { school: "", major: "", degree: "", year: "", gpa: "" })
              }
              className={addBtnCls}
            >
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          {/* Header row */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-2 mb-1">
            <span className="text-xs text-neutral-400">학교명</span>
            <span className="text-xs text-neutral-400">전공</span>
            <span className="text-xs text-neutral-400">학위</span>
            <span className="text-xs text-neutral-400">졸업년도</span>
            <span className="text-xs text-neutral-400">학점</span>
            <span className="w-6" />
          </div>
          <div className="space-y-1.5">
            {educations.map((e) => (
              <div key={e.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-2 items-center">
                <input value={e.school} onChange={(ev) => updateRow(setEducations, e.id, "school", ev.target.value)} className={inputCls} />
                <input value={e.major} onChange={(ev) => updateRow(setEducations, e.id, "major", ev.target.value)} className={inputCls} />
                <input value={e.degree} onChange={(ev) => updateRow(setEducations, e.id, "degree", ev.target.value)} className={inputCls} />
                <input value={e.year} onChange={(ev) => updateRow(setEducations, e.id, "year", ev.target.value)} className={inputCls} />
                <input value={e.gpa} onChange={(ev) => updateRow(setEducations, e.id, "gpa", ev.target.value)} className={inputCls} />
                <button onClick={() => removeRow(setEducations, e.id)} className={removeBtnCls}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* 자격 사항 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">자격 사항</h3>
            <button
              onClick={() =>
                addRow(setCertificates, { name: "", grade: "", year: "", issuer: "" })
              }
              className={addBtnCls}
            >
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 mb-1">
            <span className="text-xs text-neutral-400">자격증명</span>
            <span className="text-xs text-neutral-400">등급</span>
            <span className="text-xs text-neutral-400">취득년도</span>
            <span className="text-xs text-neutral-400">발급기관</span>
            <span className="w-6" />
          </div>
          <div className="space-y-1.5">
            {certificates.map((c) => (
              <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 items-center">
                <input value={c.name} onChange={(ev) => updateRow(setCertificates, c.id, "name", ev.target.value)} className={inputCls} />
                <input value={c.grade} onChange={(ev) => updateRow(setCertificates, c.id, "grade", ev.target.value)} className={inputCls} />
                <input value={c.year} onChange={(ev) => updateRow(setCertificates, c.id, "year", ev.target.value)} className={inputCls} />
                <input value={c.issuer} onChange={(ev) => updateRow(setCertificates, c.id, "issuer", ev.target.value)} className={inputCls} />
                <button onClick={() => removeRow(setCertificates, c.id)} className={removeBtnCls}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         Section 4: 수상, 강의, 심사, 외부 활동 경력
         ═══════════════════════════════════════════════════════════ */}
      <Section
        num={4}
        title="수상, 강의, 심사, 외부 활동 경력"
        tip="업무 관련 어필 포인트가 있다면 앞에 먼저 작성하자. 너무 많으면 핵심만 남기자."
      >
        {/* 수상 경력 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">수상 경력</h3>
            <button onClick={() => addRow(setAwards, { year: "", contest: "", detail: "" })} className={addBtnCls}>
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          <div className="grid grid-cols-[80px_2fr_3fr_auto] gap-2 mb-1">
            <span className="text-xs text-neutral-400">년도</span>
            <span className="text-xs text-neutral-400">대회명</span>
            <span className="text-xs text-neutral-400">수상내용</span>
            <span className="w-6" />
          </div>
          <div className="space-y-1.5">
            {awards.map((a) => (
              <div key={a.id} className="grid grid-cols-[80px_2fr_3fr_auto] gap-2 items-center">
                <input value={a.year} onChange={(ev) => updateRow(setAwards, a.id, "year", ev.target.value)} className={inputCls} />
                <input value={a.contest} onChange={(ev) => updateRow(setAwards, a.id, "contest", ev.target.value)} className={inputCls} />
                <input value={a.detail} onChange={(ev) => updateRow(setAwards, a.id, "detail", ev.target.value)} className={inputCls} />
                <button onClick={() => removeRow(setAwards, a.id)} className={removeBtnCls}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* 심사 경력 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">심사 경력</h3>
            <button onClick={() => addRow(setJudgings, { year: "", org: "", role: "" })} className={addBtnCls}>
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          <div className="grid grid-cols-[80px_2fr_3fr_auto] gap-2 mb-1">
            <span className="text-xs text-neutral-400">년도</span>
            <span className="text-xs text-neutral-400">기관</span>
            <span className="text-xs text-neutral-400">역할</span>
            <span className="w-6" />
          </div>
          <div className="space-y-1.5">
            {judgings.map((j) => (
              <div key={j.id} className="grid grid-cols-[80px_2fr_3fr_auto] gap-2 items-center">
                <input value={j.year} onChange={(ev) => updateRow(setJudgings, j.id, "year", ev.target.value)} className={inputCls} />
                <input value={j.org} onChange={(ev) => updateRow(setJudgings, j.id, "org", ev.target.value)} className={inputCls} />
                <input value={j.role} onChange={(ev) => updateRow(setJudgings, j.id, "role", ev.target.value)} className={inputCls} />
                <button onClick={() => removeRow(setJudgings, j.id)} className={removeBtnCls}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* 강의 경력 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">강의 경력</h3>
            <button onClick={() => addRow(setLectures, { year: "", org: "", course: "" })} className={addBtnCls}>
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          <div className="grid grid-cols-[80px_2fr_3fr_auto] gap-2 mb-1">
            <span className="text-xs text-neutral-400">년도</span>
            <span className="text-xs text-neutral-400">기관</span>
            <span className="text-xs text-neutral-400">과정명</span>
            <span className="w-6" />
          </div>
          <div className="space-y-1.5">
            {lectures.map((l) => (
              <div key={l.id} className="grid grid-cols-[80px_2fr_3fr_auto] gap-2 items-center">
                <input value={l.year} onChange={(ev) => updateRow(setLectures, l.id, "year", ev.target.value)} className={inputCls} />
                <input value={l.org} onChange={(ev) => updateRow(setLectures, l.id, "org", ev.target.value)} className={inputCls} />
                <input value={l.course} onChange={(ev) => updateRow(setLectures, l.id, "course", ev.target.value)} className={inputCls} />
                <button onClick={() => removeRow(setLectures, l.id)} className={removeBtnCls}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* 외부 활동 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">외부 활동</h3>
            <button onClick={() => addRow(setActivities, { year: "", activity: "", role: "" })} className={addBtnCls}>
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          <div className="grid grid-cols-[80px_2fr_3fr_auto] gap-2 mb-1">
            <span className="text-xs text-neutral-400">년도</span>
            <span className="text-xs text-neutral-400">활동명</span>
            <span className="text-xs text-neutral-400">역할</span>
            <span className="w-6" />
          </div>
          <div className="space-y-1.5">
            {activities.map((a) => (
              <div key={a.id} className="grid grid-cols-[80px_2fr_3fr_auto] gap-2 items-center">
                <input value={a.year} onChange={(ev) => updateRow(setActivities, a.id, "year", ev.target.value)} className={inputCls} />
                <input value={a.activity} onChange={(ev) => updateRow(setActivities, a.id, "activity", ev.target.value)} className={inputCls} />
                <input value={a.role} onChange={(ev) => updateRow(setActivities, a.id, "role", ev.target.value)} className={inputCls} />
                <button onClick={() => removeRow(setActivities, a.id)} className={removeBtnCls}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         Section 5: 업무 강점
         ═══════════════════════════════════════════════════════════ */}
      <Section
        num={5}
        title="업무 강점"
        tip="자신이 담당했던 업무를 중심으로, 구인 회사의 포지션에 맞게 편집하자. 서술식보다 기술식으로 작성하자."
      >
        {/* 핵심 역량 서술 */}
        <div className="mb-5">
          <label className={labelCls}>업무 강점 서술</label>
          <textarea
            value={strengthText}
            onChange={(e) => setStrengthText(e.target.value)}
            rows={4}
            className={textareaCls}
            placeholder="자신의 핵심 역량을 서술하세요"
          />
          <p className="text-xs text-neutral-300 mt-0.5 text-right">
            {strengthText.length}자
          </p>
        </div>

        {/* 카테고리별 업무 경험 */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-neutral-600 mb-3">
            광고/마케팅 관련 업무 경험
          </h3>
          <div className="space-y-3">
            {[
              { label: "ATL", sub: "TV, 신문, 잡지, 라디오 등", value: atlText, setter: setAtlText },
              { label: "BTL", sub: "프로모션, 전시, 박람회 등", value: btlText, setter: setBtlText },
              { label: "디지털", sub: "사이트, 모바일, 온라인, 성과형 광고", value: digitalText, setter: setDigitalText },
              { label: "컨설팅", sub: "소비자 조사, 컨셉 개발", value: consultingText, setter: setConsultingText },
              { label: "CRM/기타", sub: "전시, Shopper 마케팅, BI/CI 등", value: crmText, setter: setCrmText },
            ].map((cat) => (
              <div key={cat.label}>
                <label className={labelCls}>
                  <span className="font-semibold text-neutral-600">{cat.label}</span>
                  <span className="text-neutral-300 ml-1.5">{cat.sub}</span>
                </label>
                <textarea
                  value={cat.value}
                  onChange={(e) => cat.setter(e.target.value)}
                  rows={2}
                  className={textareaCls}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 브랜드 카테고리 경험 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">
              다양한 브랜드 카테고리 경험
            </h3>
            <button
              onClick={() => addRow(setBrandCategories, { category: "", brands: "" })}
              className={addBtnCls}
            >
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          <div className="grid grid-cols-[1fr_3fr_auto] gap-2 mb-1">
            <span className="text-xs text-neutral-400">카테고리</span>
            <span className="text-xs text-neutral-400">브랜드명</span>
            <span className="w-6" />
          </div>
          <div className="space-y-1.5">
            {brandCategories.map((bc) => (
              <div key={bc.id} className="grid grid-cols-[1fr_3fr_auto] gap-2 items-center">
                <input value={bc.category} onChange={(ev) => updateRow(setBrandCategories, bc.id, "category", ev.target.value)} className={inputCls} />
                <input value={bc.brands} onChange={(ev) => updateRow(setBrandCategories, bc.id, "brands", ev.target.value)} className={inputCls} />
                <button onClick={() => removeRow(setBrandCategories, bc.id)} className={removeBtnCls}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         Section 6: 주요 실적
         ═══════════════════════════════════════════════════════════ */}
      <Section
        num={6}
        title="주요 실적"
        tip="두괄식의 실체. 면접관이 가장 궁금한 당신의 역량을 증명하는 곳. 배경 -> 문제점 -> 해결방안 -> 역할 -> 성과를 기술식으로 정리하자."
      >
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={() =>
              addRow(setAchievements, {
                company: "",
                period: "",
                project: "",
                background: "",
                problem: "",
                solution: "",
                role: "",
                result: "",
              })
            }
            className={addBtnCls}
          >
            <Plus className="h-3 w-3" /> 실적 추가
          </button>
        </div>
        <div className="space-y-4">
          {achievements.map((ac, idx) => (
            <div
              key={ac.id}
              className="border border-neutral-100 p-3 relative"
            >
              <button
                onClick={() => removeRow(setAchievements, ac.id)}
                className="absolute top-2 right-2 p-1 text-neutral-300 hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="text-xs text-neutral-400 mb-2">
                실적 #{idx + 1}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className={labelCls}>재직사</label>
                  <input value={ac.company} onChange={(ev) => updateRow(setAchievements, ac.id, "company", ev.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>기간</label>
                  <input value={ac.period} onChange={(ev) => updateRow(setAchievements, ac.id, "period", ev.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="mb-2">
                <label className={labelCls}>프로젝트/캠페인명</label>
                <input value={ac.project} onChange={(ev) => updateRow(setAchievements, ac.id, "project", ev.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className={labelCls}>배경</label>
                  <textarea value={ac.background} onChange={(ev) => updateRow(setAchievements, ac.id, "background", ev.target.value)} rows={2} className={textareaCls} />
                </div>
                <div>
                  <label className={labelCls}>문제점</label>
                  <textarea value={ac.problem} onChange={(ev) => updateRow(setAchievements, ac.id, "problem", ev.target.value)} rows={2} className={textareaCls} />
                </div>
                <div>
                  <label className={labelCls}>해결방안</label>
                  <textarea value={ac.solution} onChange={(ev) => updateRow(setAchievements, ac.id, "solution", ev.target.value)} rows={2} className={textareaCls} />
                </div>
                <div>
                  <label className={labelCls}>역할</label>
                  <textarea value={ac.role} onChange={(ev) => updateRow(setAchievements, ac.id, "role", ev.target.value)} rows={2} className={textareaCls} />
                </div>
                <div>
                  <label className={labelCls}>성과 <span className="text-neutral-300">(수치적으로 표현하자)</span></label>
                  <textarea value={ac.result} onChange={(ev) => updateRow(setAchievements, ac.id, "result", ev.target.value)} rows={2} className={textareaCls} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         Section 7: 이력
         ═══════════════════════════════════════════════════════════ */}
      <Section
        num={7}
        title="이력"
        tip="이직 경험이 많다면 요약을 먼저, 상세는 하단에 배치하자. 두괄식을 추천한다."
      >
        {/* 주요 이력 (요약) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">
              주요 이력 (요약)
            </h3>
            <button
              onClick={() =>
                addRow(setCareerSummaries, { period: "", company: "", position: "", summary: "" })
              }
              className={addBtnCls}
            >
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          <div className="grid grid-cols-[1fr_2fr_1fr_3fr_auto] gap-2 mb-1">
            <span className="text-xs text-neutral-400">기간</span>
            <span className="text-xs text-neutral-400">회사명</span>
            <span className="text-xs text-neutral-400">직급</span>
            <span className="text-xs text-neutral-400">담당 업무 요약</span>
            <span className="w-6" />
          </div>
          <div className="space-y-1.5">
            {careerSummaries.map((cs) => (
              <div key={cs.id} className="grid grid-cols-[1fr_2fr_1fr_3fr_auto] gap-2 items-center">
                <input value={cs.period} onChange={(ev) => updateRow(setCareerSummaries, cs.id, "period", ev.target.value)} className={inputCls} />
                <input value={cs.company} onChange={(ev) => updateRow(setCareerSummaries, cs.id, "company", ev.target.value)} className={inputCls} />
                <input value={cs.position} onChange={(ev) => updateRow(setCareerSummaries, cs.id, "position", ev.target.value)} className={inputCls} />
                <input value={cs.summary} onChange={(ev) => updateRow(setCareerSummaries, cs.id, "summary", ev.target.value)} className={inputCls} />
                <button onClick={() => removeRow(setCareerSummaries, cs.id)} className={removeBtnCls}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 이력 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-600">
              상세 이력 (재직사별)
            </h3>
            <button
              onClick={() =>
                addRow(setCareerDetails, { company: "", projects: "" })
              }
              className={addBtnCls}
            >
              <Plus className="h-3 w-3" /> 추가
            </button>
          </div>
          <div className="space-y-2">
            {careerDetails.map((cd) => (
              <div key={cd.id} className="border border-neutral-100 p-3 relative">
                <button
                  onClick={() => removeRow(setCareerDetails, cd.id)}
                  className="absolute top-2 right-2 p-1 text-neutral-300 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="mb-2">
                  <label className={labelCls}>회사 (기간)</label>
                  <input value={cd.company} onChange={(ev) => updateRow(setCareerDetails, cd.id, "company", ev.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>담당 프로젝트 / 브랜드 상세</label>
                  <textarea
                    value={cd.projects}
                    onChange={(ev) => updateRow(setCareerDetails, cd.id, "projects", ev.target.value)}
                    rows={3}
                    className={textareaCls}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Footer spacer */}
      <div className="h-12" />
    </div>
  );
}
