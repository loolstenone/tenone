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
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="mt-2 text-neutral-500">Manage your profile and system preferences.</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <div className="border border-neutral-200 bg-white p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Profile Information</h3>
                            <p className="text-sm text-neutral-500">Update your personal details.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Display Name</label>
                            <input
                                type="text"
                                defaultValue="Cheonil Jeon"
                                className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <input
                                type="email"
                                defaultValue="lools@tenone.biz"
                                className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Bio</label>
                            <textarea
                                defaultValue="Admin of Ten:One™ Universe."
                                rows={3}
                                className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="border border-neutral-200 bg-white p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Notifications</h3>
                            <p className="text-sm text-neutral-500">Configure how you receive alerts.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium">Email Notifications</h4>
                                <p className="text-xs text-neutral-400">Receive daily summaries and critical alerts via email.</p>
                            </div>
                            <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={clsx(
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    emailNotifications ? "bg-neutral-900" : "bg-neutral-300"
                                )}
                            >
                                <span className={clsx(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out",
                                    emailNotifications ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                        <div className="border-t border-neutral-200 my-2" />
                        <div className="flex items-center justify-between py-2">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium">Push Notifications</h4>
                                <p className="text-xs text-neutral-400">Receive real-time alerts on your browser.</p>
                            </div>
                            <button
                                onClick={() => setPushNotifications(!pushNotifications)}
                                className={clsx(
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    pushNotifications ? "bg-neutral-900" : "bg-neutral-300"
                                )}
                            >
                                <span className={clsx(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out",
                                    pushNotifications ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Section */}
                <div className="border border-neutral-200 bg-white p-6 opacity-60">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Admin Controls</h3>
                            <p className="text-sm text-neutral-500">System-wide configurations (Restricted).</p>
                        </div>
                    </div>
                    <p className="text-sm text-neutral-400">
                        You are logged in as <span className="font-mono">Super Admin</span>.
                        All system modules are currently active.
                    </p>
                </div>

            </div>
        </div>
    );
}
