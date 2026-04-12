// Quick test - what's in process.env?
export async function GET() {
    return Response.json({
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        all_keys: Object.keys(process.env).filter(k => k.includes('ANTH') || k.includes('SUPA')),
    });
}
