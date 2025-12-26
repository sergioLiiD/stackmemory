import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Verify Authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. Check Permissions (Tier Check)
        // Reusing limits check but enforcing strict PRO/FOUNDER rule handled partly by the caller,
        // but let's double check here or use checkAndIncrementLimit.
        // Since we decided to reuse the 'insight' bucket/logic or stricter:
        const { allowed, error: limitError } = await import('@/lib/limits').then(m => m.checkAndIncrementLimit(user.id, 'insight'));

        // If checkAndIncrementLimit returns false (e.g. Free user trying to generate insight), we return 403.
        // Note: The limit function now explicitly blocks 'insight' action for Free users.
        if (!allowed) {
            return NextResponse.json({ error: limitError || "Upgrade to Pro to generate Onboarding Guides." }, { status: 403 });
        }

        // 3. Fetch Context (File Tree + Critical Configs)
        const { data: allFiles } = await supabase
            .from('embeddings')
            .select('file_path')
            .eq('project_id', projectId);

        const fileTree = allFiles?.map(f => f.file_path).sort().join('\n') || "No files found";

        const criticalPatterns = [
            'package.json',
            'README%',
            '.env%',
            'docker%',
            'Makefile',
            'tsconfig.json',
            'next.config.js',
            'vite.config.ts'
        ];

        let contextContent = "";
        const { data: contentFiles } = await supabase
            .from('embeddings')
            .select('file_path, content')
            .eq('project_id', projectId)
            .or(criticalPatterns.map(p => `file_path.ilike.${p}`).join(','));

        if (contentFiles) {
            contextContent = contentFiles.map(f => `
--- FILE: ${f.file_path} ---
${f.content}
---------------------------
`).join('\n');
        }

        // 4. Prompt Gemini 2.0 Flash (The "DevRel")
        const systemPrompt = `You are a Senior Developer Relations Engineer and Onboarding Specialist.
Your goal is to write a "GETTING_STARTED.md" guide for a new developer joining this specific team.

INPUT:
- Project File Tree
- Content of config files (package.json, etc.)

OUTPUT RULES:
- **Markdown ONLY**. No code blocks wrapping the entire response.
- **Tone**: Welcoming, practical, and clear.
- **Structure**:
  1. **🏆 Welcome to [Project Name]** (Brief what is this?)
  2. **🛠️ Prerequisites** (Node version, Docker, API keys needed - derived from .env.example or code)
  3. **🚀 Quick Start** (Commands to install and run)
  4. **📂 Project Structure** (Explain key directories based on the file tree)
  5. **🔑 Critical Concepts** (What's the architecture? Next.js? Vite? Supabase?)
  6. **🧪 Testing** (How to run tests if detected)

Make sure to infer the "Run" commands from package.json scripts (e.g., 'npm run dev' or 'npm start').
`;

        const userMessage = `
PROJECT FILE TREE:
${fileTree}

CRITICAL CONFIGS:
${contextContent}

Generate the Onboarding Guide.
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent([
            "OUTPUT RULES: Return RAW Markdown. DO NOT wrap in ```markdown code blocks.",
            userMessage
        ]);

        let report = result.response.text();
        report = report.replace(/```markdown/g, '').replace(/```/g, '');

        // LOG USAGE (Categorize as 'insight' for now to keep limits simple)
        const inputTokens = Math.ceil((userMessage.length + systemPrompt.length) / 4);
        const outputTokens = Math.ceil(report.length / 4);
        const { logUsage } = await import('@/lib/usage-logger');
        await logUsage(projectId, 'insight', 'gemini-2.0-flash', inputTokens, outputTokens);

        // 5. Save to Database
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                onboarding_guide: report,
                onboarding_generated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) {
            console.error("Failed to save onboarding guide:", updateError);
        }

        return NextResponse.json({ report });

    } catch (e: any) {
        console.error("Onboarding Guide Error:", e);
        return NextResponse.json({ error: e.message || 'Failed to generate guide' }, { status: 500 });
    }
}
