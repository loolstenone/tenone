'use client';

import { useState, useEffect } from 'react';
import {
  Clock, LogIn, LogOut, Calendar, Sun, Moon, Coffee, Heart,
  AlertCircle, CheckCircle2, MinusCircle, Plus
} from 'lucide-react';
import { useWIO } from '../../layout';

type AttendanceStatus = 'working' | 'off' | 'late' | 'vacation' | 'half_day';
type LeaveType = 'annual' | 'half' | 'sick' | 'family';

const STATUS_MAP: Record<AttendanceStatus, { label: string; color: string }> = {
  working: { label: '근무중', color: 'text-emerald-400 bg-emerald-500/10' },
  off: { label: '퇴근', color: 'text-slate-400 bg-slate-500/10' },
  late: { label: '지각', color: 'text-red-400 bg-red-500/10' },
  vacation: { label: '휴가', color: 'text-blue-400 bg-blue-500/10' },
  half_day: { label: '반차', color: 'text-amber-400 bg-amber-500/10' },
};

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'annual', label: '연차' },
  { value: 'half', label: '반차' },
  { value: 'sick', label: '병가' },
  { value: 'family', label: '경조사' },
];

const DAYS = ['월', '화', '수', '목', '금'];

const MOCK_WEEKLY_HOURS = [8.5, 9.0, 8.0, 7.5, 0]; // Mon~Fri
const MOCK_TEAM = [
  { id: '1', name: '김민수', checkIn: '08:55', status: 'working' as AttendanceStatus },
  { id: '2', name: '이지은', checkIn: '09:05', status: 'working' as AttendanceStatus },
  { id: '3', name: '박서준', checkIn: '-', status: 'vacation' as AttendanceStatus },
  { id: '4', name: '최유나', checkIn: '09:30', status: 'late' as AttendanceStatus },
  { id: '5', name: '정해인', checkIn: '08:50', status: 'off' as AttendanceStatus },
];

export default function AttendancePage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: 'annual' as LeaveType, startDate: '', endDate: '', reason: '' });
  const [team, setTeam] = useState<typeof MOCK_TEAM>([]);
  const [weeklyHours, setWeeklyHours] = useState<number[]>([]);
  const [remainingLeave, setRemainingLeave] = useState(12);

  useEffect(() => {
    if (!tenant) return;
    if (isDemo) {
      setTeam(MOCK_TEAM);
      setWeeklyHours(MOCK_WEEKLY_HOURS);
    }
    setLoading(false);
  }, [tenant, isDemo]);

  const handleCheckIn = () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setCheckedIn(true);
    setCheckInTime(time);
    setCheckOutTime(null);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setCheckedIn(false);
    setCheckOutTime(time);
  };

  const handleLeaveSubmit = () => {
    if (!leaveForm.startDate) return;
    // TODO: Supabase insert
    setShowLeaveForm(false);
    setLeaveForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
  };

  const maxHour = Math.max(...(weeklyHours.length > 0 ? weeklyHours : [1]), 1);
  const totalWeekHours = weeklyHours.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">근태관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-ATT</p>
        </div>
        <button onClick={() => setShowLeaveForm(!showLeaveForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 휴가 신청
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Check In/Out + Leave Balance Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Today Attendance */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Clock size={15} className="text-indigo-400" /> 오늘 출퇴근
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 text-center">
                  <div className="text-[10px] text-slate-500 mb-1">출근</div>
                  <div className="text-lg font-bold">{checkInTime || '--:--'}</div>
                </div>
                <div className="h-8 w-px bg-white/5" />
                <div className="flex-1 text-center">
                  <div className="text-[10px] text-slate-500 mb-1">퇴근</div>
                  <div className="text-lg font-bold">{checkOutTime || '--:--'}</div>
                </div>
              </div>
              {!checkedIn && !checkOutTime ? (
                <button onClick={handleCheckIn}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
                  <LogIn size={16} /> 출근하기
                </button>
              ) : checkedIn ? (
                <button onClick={handleCheckOut}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-600 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-500 transition-colors">
                  <LogOut size={16} /> 퇴근하기
                </button>
              ) : (
                <div className="text-center text-sm text-emerald-400 py-3">
                  <CheckCircle2 size={16} className="inline mr-1" /> 오늘 근무 완료
                </div>
              )}
            </div>

            {/* Leave Balance */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Calendar size={15} className="text-blue-400" /> 휴가 잔여
              </h2>
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <div className="text-3xl font-bold text-blue-400">{remainingLeave}</div>
                  <div className="text-[10px] text-slate-500">잔여일</div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>사용 3일</span>
                    <span>총 15일</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(3 / 15) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400"><Sun size={12} /> 연차 사용 2일</div>
                <div className="flex items-center gap-1.5 text-slate-400"><Coffee size={12} /> 반차 사용 1일</div>
                <div className="flex items-center gap-1.5 text-slate-400"><Heart size={12} /> 병가 0일</div>
                <div className="flex items-center gap-1.5 text-slate-400"><AlertCircle size={12} /> 경조사 0일</div>
              </div>
            </div>
          </div>

          {/* Leave Form */}
          {showLeaveForm && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
              <h3 className="text-sm font-semibold">휴가 신청</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value as LeaveType })}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                  {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
                <input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <input value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                placeholder="사유 (선택)" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowLeaveForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
                <button onClick={handleLeaveSubmit} disabled={!leaveForm.startDate}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-indigo-500 transition-colors">신청</button>
              </div>
            </div>
          )}

          {/* Weekly Hours Chart */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Clock size={15} className="text-amber-400" /> 이번 주 근무시간
              </h2>
              <span className="text-xs text-slate-500">총 {totalWeekHours.toFixed(1)}시간</span>
            </div>
            <div className="flex items-end gap-2 h-32">
              {weeklyHours.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400">{h > 0 ? `${h}h` : ''}</span>
                  <div className="w-full rounded-t-md bg-indigo-500/20 relative overflow-hidden" style={{ height: `${(h / maxHour) * 100}%`, minHeight: h > 0 ? '4px' : '0' }}>
                    <div className="absolute inset-0 bg-indigo-500" style={{ opacity: h >= 8 ? 1 : 0.5 }} />
                  </div>
                  <span className="text-[10px] text-slate-500">{DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Status */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sun size={15} className="text-emerald-400" /> 팀원 근태 현황
            </h2>
            <div className="space-y-2">
              {team.map(t => {
                const st = STATUS_MAP[t.status];
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400">
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{t.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{t.checkIn !== '-' ? t.checkIn : ''}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
