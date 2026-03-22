"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function YouInOneContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.");
        setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    };

    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase mb-4">
                        Contact
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        문의하기
                    </h1>
                    <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        프로젝트 문의, 얼라이언스 참여, 협업 제안 등 무엇이든 편하게 연락 주세요.
                    </p>
                </div>
            </section>

            {/* Contact Info + Form */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-[#171717] mb-6">연락처</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-[#E53935]/10 rounded-lg text-[#E53935]">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#171717] text-sm mb-1">이메일</h3>
                                        <a href="mailto:hello@youinone.com" className="text-sm text-neutral-500 hover:text-[#E53935] transition-colors">
                                            hello@youinone.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-[#E53935]/10 rounded-lg text-[#E53935]">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#171717] text-sm mb-1">전화</h3>
                                        <p className="text-sm text-neutral-500">02-000-0000</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-[#E53935]/10 rounded-lg text-[#E53935]">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#171717] text-sm mb-1">주소</h3>
                                        <p className="text-sm text-neutral-500">서울특별시</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                                <h3 className="font-semibold text-[#171717] text-sm mb-2">운영 시간</h3>
                                <p className="text-sm text-neutral-500">월 - 금: 09:00 - 18:00</p>
                                <p className="text-sm text-neutral-500">토, 일, 공휴일: 휴무</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-3">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-[#171717] mb-1.5">이름 *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E53935] transition-colors"
                                            placeholder="홍길동"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#171717] mb-1.5">이메일 *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E53935] transition-colors"
                                            placeholder="example@company.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#171717] mb-1.5">회사/기관</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E53935] transition-colors"
                                        placeholder="회사명 (선택)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#171717] mb-1.5">문의 유형 *</label>
                                    <select
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E53935] transition-colors bg-white"
                                    >
                                        <option value="">선택해주세요</option>
                                        <option value="project">프로젝트 문의</option>
                                        <option value="alliance">얼라이언스 참여</option>
                                        <option value="collaboration">협업 제안</option>
                                        <option value="education">교육 프로그램</option>
                                        <option value="other">기타</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#171717] mb-1.5">메시지 *</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E53935] transition-colors resize-none"
                                        placeholder="문의 내용을 입력해주세요..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#171717] text-white font-semibold hover:bg-[#E53935] transition-colors rounded"
                                >
                                    <Send className="h-4 w-4" />
                                    보내기
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
