"use client";

import { WorkflowProvider } from "@/lib/workflow-context";

export default function WorkflowLayout({ children }: { children: React.ReactNode }) {
    return <WorkflowProvider>{children}</WorkflowProvider>;
}
