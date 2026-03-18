"use client";

import { User, Bell, Shield, Palette } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

export default function SettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="mt-2 text-zinc-400">Manage your profile and system preferences.</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">Profile Information</h3>
                            <p className="text-sm text-zinc-400">Update your personal details.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Display Name</label>
                            <input
                                type="text"
                                defaultValue="Cheonil Jeon"
                                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email Address</label>
                            <input
                                type="email"
                                defaultValue="lools@tenone.biz"
                                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-zinc-300">Bio</label>
                            <textarea
                                defaultValue="Admin of Ten:One™ Universe."
                                rows={3}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">Notifications</h3>
                            <p className="text-sm text-zinc-400">Configure how you receive alerts.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                                <p className="text-xs text-zinc-500">Receive daily summaries and critical alerts via email.</p>
                            </div>
                            <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={clsx(
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    emailNotifications ? "bg-indigo-600" : "bg-zinc-700"
                                )}
                            >
                                <span className={clsx(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    emailNotifications ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                        <div className="border-t border-zinc-800 my-2" />
                        <div className="flex items-center justify-between py-2">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-white">Push Notifications</h4>
                                <p className="text-xs text-zinc-500">Receive real-time alerts on your browser.</p>
                            </div>
                            <button
                                onClick={() => setPushNotifications(!pushNotifications)}
                                className={clsx(
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    pushNotifications ? "bg-indigo-600" : "bg-zinc-700"
                                )}
                            >
                                <span className={clsx(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    pushNotifications ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Section */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 opacity-60">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">Admin Controls</h3>
                            <p className="text-sm text-zinc-400">System-wide configurations (Restricted).</p>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-500">
                        You are logged in as <span className="text-white font-mono">Super Admin</span>.
                        All system modules are currently active.
                    </p>
                </div>

            </div>
        </div>
    );
}
