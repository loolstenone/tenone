/**
 * HeRo 이력서 본문 — resumes.content (jsonb) 구조 (2026-10-12)
 * 이름·이메일·연락처는 저장하지 않는다 (데이터 계약 1조 — 계정 정보는 members가 원천, 화면에서 프로필을 읽어 보여 줌)
 * text = 옛 자유 양식 본문 (호환 유지)
 */
export interface ResumeExperience { company: string; role: string; start: string; end: string; current: boolean; description: string }
export interface ResumeEducation { school: string; major: string; start: string; end: string; status: string }
export interface ResumeActivity { name: string; org: string; start: string; end: string; description: string }
export interface ResumeCertification { name: string; issuer: string; date: string; score: string }
export interface ResumeLink { label: string; url: string }

export interface ResumeContent {
  version?: 2;
  headline?: string;
  desired_job?: string;
  summary?: string;
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
  activities?: ResumeActivity[];
  certifications?: ResumeCertification[];
  skills?: string[];
  links?: ResumeLink[];
  text?: string;
}
