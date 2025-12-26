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

        // 2. Fetch Massive Context
        // A. File Tree (All paths)
        const { data: allFiles } = await supabase
            .from('embeddings')
            .select('file_path')
            .eq('project_id', projectId);

        const fileTree = allFiles?.map(f => f.file_path).sort().join('\n') || "No files found";

        // B. Fetch Critical Files & Documentation
        // We want: all .md files, package.json, config files, and maybe schema files.
        const criticalPatterns = ['%.md', '%package.json%', '%config%', '%schema%', '%layout.tsx%', '%page.tsx%'];
        let contextContent = "";

        // Depending on DB size, we might need multiple queries or a smarter filter.
        // For now, let's grab top 50 files that match key patterns.
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

        // 3. Prompt Gemini 2.0 Flash (The "Architect")
        const systemPrompt = `You are a Senior Principal Software Architect and UI Designer.
Your goal is to write a "Project Insight Report" (The Bible) for a new CTO or Investor.

OUTPUT FORMAT:
- **HTML ONLY**. Do not use Markdown.
- **Tailwind CSS**: Use extensive Tailwind classes for styling.
- **Design System**:
  - Use a dark/tech theme (bg-transparent, text-white, border-white/10).
  - Use **Grid Layouts** (grid-cols-2) for metrics or comparisons.
  - Use **Glassmorphism** cards (bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6).
  - Use **Gradients** for headers (bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent).
  - Use **Badges** for tech stack items.

STRUCTURE:
1. **Executive Container** (One main div wrapping everything).
2. **Hero Section**: Title, Project Name, and a 1-sentence impact summary.
3. **Key Features Grid**: A 2-column or 3-column grid of feature cards.
4. **Tech Stack Pills**: A flex-wrap section of badges.
5. **Architectural Map**: A descriptive section using borders/arrows if possible, or just clear steps.
6. **Critical Files**: A list of file cards.
7. **Improvement Opportunities**: Alert boxes (yellow/red borders).

Make it look like a high-end SaaS dashboard, not a document.
`;

        const userMessage = `
PROJECT FILE TREE:
${fileTree}

CRITICAL FILE CONTENTS (Documentation & Configs):
${contextContent}

Please generate the Project Insight Report.
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent([
            "OUTPUT RULES: Return RAW HTML only. DO NOT wrap in ```html code blocks. DO NOT use Markdown.",
            userMessage
        ]);

        let report = result.response.text();

        // CLEANUP: Remove markdown code blocks if Gemini ignores instructions
        report = report.replace(/```html/g, '').replace(/```/g, '');

        // 4. Save to Database
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                insight_report: report,
                insight_generated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (updateError) {
            console.error("Failed to save report:", updateError);
            // We still return the report even if save failed
        }

        return NextResponse.json({ report });

    } catch (e: any) {
        console.error("Project Insight Error:", e);
        return NextResponse.json({ error: e.message || 'Failed to generate insight' }, { status: 500 });
    }
}
