import "dotenv/config";

export const config = {
    supabase: {
        url: process.env.SUPABASE_URL || "",
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    },
    openclaw: {
        url: process.env.OPENCLAW_URL || "http://localhost:8080",
    },
    ollama: {
        url: process.env.OLLAMA_URL || "http://localhost:11434",
    },
    tenone: {
        apiUrl: process.env.TENONE_API_URL || "http://localhost:3000",
        adminKey: process.env.ADMIN_API_KEY || "",
    },
    healthInterval: parseInt(process.env.HEALTH_INTERVAL || "30000", 10),
};

export function validateConfig(): boolean {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
        console.error("[config] SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필수");
        return false;
    }
    return true;
}
