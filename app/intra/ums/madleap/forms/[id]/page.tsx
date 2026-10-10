import { FormEditor } from "@/components/intra/forms/FormEditor";

export default async function MadleapFormEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <FormEditor formId={id} listPath="/intra/ums/madleap/forms" />;
}
