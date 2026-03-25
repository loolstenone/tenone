"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  MapPin,
  Crown,
  ArrowRightLeft,
} from "lucide-react";
import { madleagueClubs } from "@/lib/people-data";
import type { MadLeagueClub } from "@/types/people";

// ── Mock member per club/generation ──
type ClubRole = "회장" | "부회장" | "팀장" | "멤버";
type MemberStatus = "현멤버" | "OB";

interface ClubMember {
  id: string;
  name: string;
  email: string;
  role: ClubRole;
  status: MemberStatus;
}

interface GenerationData {
  generation: number;
  members: ClubMember[];
}

const mockGenerations: Record<string, GenerationData[]> = {
  madleap: [
    {
      generation: 5,
      members: [
        { id: "ml5-1", name: "강리더", email: "kang@madleap.co.kr", role: "회장", status: "현멤버" },
        { id: "ml5-2", name: "김매드", email: "kim.mad@univ.ac.kr", role: "부회장", status: "현멤버" },
        { id: "ml5-3", name: "이매드", email: "lee.mad@univ.ac.kr", role: "팀장", status: "현멤버" },
        { id: "ml5-4", name: "송마케", email: "song@univ.ac.kr", role: "팀장", status: "현멤버" },
        { id: "ml5-5", name: "윤광고", email: "yoon@univ.ac.kr", role: "멤버", status: "현멤버" },
        { id: "ml5-6", name: "조기획", email: "jo@univ.ac.kr", role: "멤버", status: "현멤버" },
        { id: "ml5-7", name: "한디자", email: "han@univ.ac.kr", role: "멤버", status: "현멤버" },
        { id: "ml5-8", name: "나콘텐", email: "na@univ.ac.kr", role: "멤버", status: "현멤버" },
      ],
    },
    {
      generation: 4,
      members: [
        { id: "ml4-1", name: "박매드", email: "park.mad@univ.ac.kr", role: "회장", status: "OB" },
        { id: "ml4-2", name: "전기획", email: "jeon@univ.ac.kr", role: "부회장", status: "OB" },
        { id: "ml4-3", name: "고마케", email: "go@univ.ac.kr", role: "팀장", status: "OB" },
        { id: "ml4-4", name: "문광고", email: "moon@univ.ac.kr", role: "멤버", status: "OB" },
        { id: "ml4-5", name: "배콘텐", email: "bae@univ.ac.kr", role: "멤버", status: "OB" },
        { id: "ml4-6", name: "서디자", email: "seo.d@univ.ac.kr", role: "멤버", status: "OB" },
      ],
    },
  ],
  abc: [
    {
      generation: 2,
      members: [
        { id: "abc2-1", name: "박리더", email: "park@abc.kr", role: "부회장", status: "현멤버" },
        { id: "abc2-2", name: "한매드", email: "han.mad@univ.ac.kr", role: "멤버", status: "현멤버" },
        { id: "abc2-3", name: "류기획", email: "ryu@univ.ac.kr", role: "멤버", status: "현멤버" },
      ],
    },
  ],
  adlle: [
    {
      generation: 2,
      members: [
        { id: "adl2-1", name: "이리더", email: "lee@adlle.kr", role: "회장", status: "현멤버" },
        { id: "adl2-2", name: "정매드", email: "jung.mad@univ.ac.kr", role: "멤버", status: "현멤버" },
      ],
    },
  ],
  adzone: [
    {
      generation: 1,
      members: [
        { id: "adz1-1", name: "신리더", email: "shin@adzone.kr", role: "회장", status: "현멤버" },
        { id: "adz1-2", name: "유매드", email: "yu@univ.ac.kr", role: "멤버", status: "현멤버" },
        { id: "adz1-3", name: "임콘텐", email: "im@univ.ac.kr", role: "멤버", status: "현멤버" },
      ],
    },
  ],
  pad: [
    {
      generation: 1,
      members: [
        { id: "pad1-1", name: "홍리더", email: "hong@pad.kr", role: "회장", status: "현멤버" },
        { id: "pad1-2", name: "양매드", email: "yang@univ.ac.kr", role: "멤버", status: "현멤버" },
      ],
    },
  ],
  pam: [
    {
      generation: 2,
      members: [
        { id: "pam2-1", name: "민대표", email: "min@pam.kr", role: "회장", status: "현멤버" },
        { id: "pam2-2", name: "최매드", email: "choi.mad@univ.ac.kr", role: "멤버", status: "현멤버" },
        { id: "pam2-3", name: "권마케", email: "kwon@univ.ac.kr", role: "멤버", status: "현멤버" },
      ],
    },
  ],
  suzak: [
    {
      generation: 2,
      members: [
        { id: "szk2-1", name: "최리더", email: "choi@suzak.kr", role: "회장", status: "현멤버" },
        { id: "szk2-2", name: "오매드", email: "oh.mad@univ.ac.kr", role: "멤버", status: "현멤버" },
      ],
    },
  ],
};

// ── helpers ──
function getClubStats(clubId: string) {
  const gens = mockGenerations[clubId] || [];
  let active = 0;
  let ob = 0;
  gens.forEach((g) =>
    g.members.forEach((m) => (m.status === "현멤버" ? active++ : ob++))
  );
  return { active, ob };
}

function getClubPresident(clubId: string): string {
  const gens = mockGenerations[clubId] || [];
  if (gens.length === 0) return "-";
  const latest = gens[0];
  const president = latest.members.find((m) => m.role === "회장" || m.role === "부회장");
  return president?.name ?? "-";
}

function getCurrentGen(clubId: string): number {
  const gens = mockGenerations[clubId] || [];
  return gens.length > 0 ? gens[0].generation : 0;
}

const roleOrder: Record<ClubRole, number> = { 회장: 0, 부회장: 1, 팀장: 2, 멤버: 3 };

// ── Component ──
export default function ClubsPage() {
  const [clubs, setClubs] = useState<MadLeagueClub[]>(
    [...madleagueClubs].sort((a, b) => a.order - b.order)
  );
  const [expandedClub, setExpandedClub] = useState<string | null>(null);
  const [activeGenTab, setActiveGenTab] = useState<Record<string, number>>({});
  const [memberData, setMemberData] = useState(mockGenerations);

  // add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newGen, setNewGen] = useState("");

  // edit modal
  const [editClub, setEditClub] = useState<MadLeagueClub | null>(null);
  const [editName, setEditName] = useState("");
  const [editRegion, setEditRegion] = useState("");

  // ── handlers ──
  function handleAddClub() {
    if (!newName.trim() || !newRegion.trim()) return;
    const id = newName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const club: MadLeagueClub = { id, name: newName.trim(), region: newRegion.trim(), order: 0 };
    const gen = parseInt(newGen) || 1;
    const updated = [...clubs, club].sort((a, b) => a.name.localeCompare(b.name));
    updated.forEach((c, i) => (c.order = i + 1));
    setClubs(updated);
    setMemberData((prev) => ({
      ...prev,
      [id]: [{ generation: gen, members: [] }],
    }));
    setNewName("");
    setNewRegion("");
    setNewGen("");
    setShowAddModal(false);
  }

  function handleDeleteClub(id: string) {
    setClubs((prev) => prev.filter((c) => c.id !== id));
    if (expandedClub === id) setExpandedClub(null);
  }

  function handleEditClub() {
    if (!editClub || !editName.trim() || !editRegion.trim()) return;
    const updated = clubs
      .map((c) => (c.id === editClub.id ? { ...c, name: editName.trim(), region: editRegion.trim() } : c))
      .sort((a, b) => a.name.localeCompare(b.name));
    updated.forEach((c, i) => (c.order = i + 1));
    setClubs(updated);
    setEditClub(null);
  }

  function toggleMemberStatus(clubId: string, gen: number, memberId: string) {
    setMemberData((prev) => {
      const clubGens = prev[clubId]?.map((g) => {
        if (g.generation !== gen) return g;
        return {
          ...g,
          members: g.members.map((m) =>
            m.id === memberId ? { ...m, status: (m.status === "현멤버" ? "OB" : "현멤버") as MemberStatus } : m
          ),
        };
      });
      return { ...prev, [clubId]: clubGens || [] };
    });
  }

  function toggleExpand(clubId: string) {
    if (expandedClub === clubId) {
      setExpandedClub(null);
    } else {
      setExpandedClub(clubId);
      const gens = memberData[clubId] || [];
      if (gens.length > 0 && !activeGenTab[clubId]) {
        setActiveGenTab((prev) => ({ ...prev, [clubId]: gens[0].generation }));
      }
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Users size={18} className="text-neutral-600" />
            MADLeague 동아리 관리
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            전국 대학생 마케팅·광고 동아리 연합
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus size={14} />
          동아리 추가
        </button>
      </div>

      {/* Club List */}
      <div className="space-y-2">
        {clubs.map((club) => {
          const stats = getClubStats(club.id);
          const president = getClubPresident(club.id);
          const currentGen = getCurrentGen(club.id);
          const isExpanded = expandedClub === club.id;
          const gens = memberData[club.id] || [];
          const selectedGen = activeGenTab[club.id] || (gens[0]?.generation ?? 0);
          const selectedGenData = gens.find((g) => g.generation === selectedGen);

          return (
            <div key={club.id} className="border border-neutral-200 bg-white">
              {/* Card header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => toggleExpand(club.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">{club.name}</span>
                      <span className="flex items-center gap-0.5 text-xs text-neutral-500">
                        <MapPin size={11} />
                        {club.region}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
                      <span>
                        현멤버 <strong className="text-neutral-700">{stats.active}명</strong>, OB{" "}
                        <strong className="text-neutral-700">{stats.ob}명</strong>
                      </span>
                      {currentGen > 0 && (
                        <span>
                          현재 <strong className="text-neutral-700">{currentGen}기</strong>
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Crown size={10} className="text-amber-500" />
                        {president}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditClub(club);
                      setEditName(club.name);
                      setEditRegion(club.region);
                    }}
                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                    title="수정"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteClub(club.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-neutral-100 px-4 py-3">
                  {gens.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-2">등록된 기수가 없습니다.</p>
                  ) : (
                    <>
                      {/* Generation tabs */}
                      <div className="flex items-center gap-1 mb-3">
                        {gens.map((g) => (
                          <button
                            key={g.generation}
                            onClick={() =>
                              setActiveGenTab((prev) => ({ ...prev, [club.id]: g.generation }))
                            }
                            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                              selectedGen === g.generation
                                ? "bg-neutral-900 text-white"
                                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            }`}
                          >
                            {g.generation}기
                            <span className="ml-1 text-xs opacity-70">{g.members.length}명</span>
                          </button>
                        ))}
                      </div>

                      {/* Member table */}
                      {selectedGenData && selectedGenData.members.length > 0 ? (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-neutral-100 text-neutral-400 text-left">
                              <th className="pb-1.5 font-medium w-24">이름</th>
                              <th className="pb-1.5 font-medium">이메일</th>
                              <th className="pb-1.5 font-medium w-16 text-center">역할</th>
                              <th className="pb-1.5 font-medium w-20 text-center">상태</th>
                              <th className="pb-1.5 font-medium w-12 text-center">전환</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...selectedGenData.members]
                              .sort((a, b) => roleOrder[a.role] - roleOrder[b.role])
                              .map((m) => (
                                <tr
                                  key={m.id}
                                  className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
                                >
                                  <td className="py-1.5 font-medium text-neutral-800">{m.name}</td>
                                  <td className="py-1.5 text-neutral-500">{m.email}</td>
                                  <td className="py-1.5 text-center">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                        m.role === "회장"
                                          ? "bg-amber-50 text-amber-700"
                                          : m.role === "부회장"
                                          ? "bg-blue-50 text-blue-600"
                                          : m.role === "팀장"
                                          ? "bg-violet-50 text-violet-600"
                                          : "bg-neutral-100 text-neutral-500"
                                      }`}
                                    >
                                      {m.role}
                                    </span>
                                  </td>
                                  <td className="py-1.5 text-center">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                        m.status === "현멤버"
                                          ? "bg-green-50 text-green-600"
                                          : "bg-neutral-100 text-neutral-400"
                                      }`}
                                    >
                                      {m.status}
                                    </span>
                                  </td>
                                  <td className="py-1.5 text-center">
                                    <button
                                      onClick={() =>
                                        toggleMemberStatus(club.id, selectedGen, m.id)
                                      }
                                      className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                                      title="현멤버/OB 전환"
                                    >
                                      <ArrowRightLeft size={12} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-xs text-neutral-400 py-2">이 기수에 등록된 멤버가 없습니다.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 text-xs text-neutral-400 text-right">
        총 {clubs.length}개 동아리
      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-neutral-900">동아리 추가</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-neutral-100 text-neutral-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">동아리명</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: SPARK"
                  className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">지역</label>
                <input
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="예: 서울·경기"
                  className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">현재 기수</label>
                <input
                  value={newGen}
                  onChange={(e) => setNewGen(e.target.value)}
                  placeholder="예: 1"
                  type="number"
                  min={1}
                  className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-500 rounded hover:bg-neutral-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddClub}
                disabled={!newName.trim() || !newRegion.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-neutral-900">동아리 수정</h2>
              <button
                onClick={() => setEditClub(null)}
                className="p-1 rounded hover:bg-neutral-100 text-neutral-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">동아리명</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">지역</label>
                <input
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditClub(null)}
                className="px-3 py-1.5 text-xs text-neutral-500 rounded hover:bg-neutral-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleEditClub}
                disabled={!editName.trim() || !editRegion.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
