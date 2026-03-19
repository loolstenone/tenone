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
                    <h2 className="text-2xl font-bold">Contacts (CRM)</h2>
                    <p className="mt-2 text-neutral-500">Manage relationships with partners, clients, and influencers.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-neutral-100 px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors border border-neutral-200"
                    >
                        Import Excel
                    </button>
                    <button className="flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                        <Plus className="h-4 w-4" />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-neutral-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 border border-neutral-200 bg-white text-sm focus:border-neutral-900 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-neutral-400" />
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="h-9 border border-neutral-200 bg-white text-sm px-3 focus:outline-none focus:border-neutral-900"
                    >
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Contacts List */}
            <div className="border border-neutral-200 bg-white overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                        <tr className="border-b border-neutral-200">
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name / Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role & Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact Info</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Brand Assoc.</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-transparent">
                        {filteredContacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium">{contact.name}</div>
                                            <div className="text-sm text-neutral-400">{contact.company || '-'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium mr-2">
                                        {contact.role}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">
                                        {contact.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-neutral-400" /> {contact.email}
                                    </div>
                                    {contact.phone && (
                                        <div className="text-sm text-neutral-400 flex items-center gap-2 mt-1">
                                            <Phone className="h-3 w-3" /> {contact.phone}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                        {contact.brandAssociation?.map(bId => (
                                            <span key={bId} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">
                                                {getBrandName(bId)}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-neutral-400 hover:text-neutral-900">
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
