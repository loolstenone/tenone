import { FormEditor } from "@/components/intra/forms/FormEditor";
import { MAD_FORM_PROGRAMS } from "../../form-programs";

export default async function MadleagueFormEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <FormEditor formId={id} listPath="/intra/ums/madleague/forms" programs={MAD_FORM_PROGRAMS} />;
}
