"use client";

import { useState } from "react";
import { brands, contacts } from "@/lib/data";
import { Search, Filter, Plus, Mail, Phone, MoreHorizontal, User } from "lucide-react";
import clsx from "clsx";
// Note: We might need to update the import path if ContactImportModal is not in /components
import { ContactImportModal } from "@/components/ContactImportModal";

export default function ContactsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === "All" || contact.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;

    const roles = ["All", "Partner", "Client", "Vendor", "Team", "Influencer"];

    return (
        <div className="space-y-8">
            <ContactImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={(newContacts) => console.log('Imported:', newContacts)} // Simplified for now
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Contacts (CRM)</h2>
                    <p className="mt-2 text-zinc-400">Manage relationships with partners, clients, and influencers.</p>
                </div>
                <div className="flex gap-2">
                    {/* Re-adding Import button logic */}
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
                    >
                        Import Excel
                    </button>
                    <button className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                        <Plus className="h-4 w-4" />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-zinc-800">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-md border border-zinc-800 bg-zinc-900 text-sm text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="h-9 rounded-md border border-zinc-800 bg-zinc-900 text-sm text-zinc-300 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Contacts List */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name / Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Role & Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact Info</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Brand Assoc.</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-transparent">
                        {filteredContacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white">{contact.name}</div>
                                            <div className="text-sm text-zinc-500">{contact.company || '-'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 mr-2">
                                        {contact.role}
                                    </span>
                                    <span className={clsx(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        contact.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" :
                                            contact.status === 'Lead' ? "bg-blue-500/10 text-blue-400" : "bg-zinc-700 text-zinc-400"
                                    )}>
                                        {contact.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-zinc-300 flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-zinc-500" /> {contact.email}
                                    </div>
                                    {contact.phone && (
                                        <div className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                                            <Phone className="h-3 w-3" /> {contact.phone}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                        {contact.brandAssociation?.map(bId => (
                                            <span key={bId} className="text-xs text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                                {getBrandName(bId)}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-zinc-400 hover:text-white">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
