import { NextRequest } from "next/server";
import { GET as llmsGet } from "../llms.txt/route";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
    // llms.txt에 ?full=1 파라미터를 추가하여 전문 포함 버전으로 전달
    const url = new URL(request.url);
    url.searchParams.set("full", "1");
    const modifiedRequest = new NextRequest(url, request);
    return llmsGet(modifiedRequest);
}
