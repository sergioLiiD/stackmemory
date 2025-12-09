export interface ParsedStackItem {
    name: string;
    version: string;
}

export interface ParsedStack {
    name: string;
    description?: string;
    repo?: string;
    stack: ParsedStackItem[];
}

export function parsePackageJson(content: string): ParsedStack | null {
    try {
        const json = JSON.parse(content);
        const stack: ParsedStackItem[] = [];

        // Extract dependencies as stack items
        if (json.dependencies) {
            Object.keys(json.dependencies).forEach(dep => {
                // Filter for common frameworks/libs to avoid noise
                if (isMajorTech(dep)) {
                    stack.push({
                        name: dep,
                        version: cleanVersion(json.dependencies[dep])
                    });
                }
            });
        }

        if (json.devDependencies) {
            Object.keys(json.devDependencies).forEach(dep => {
                if (isMajorTech(dep)) {
                    stack.push({
                        name: dep,
                        version: cleanVersion(json.devDependencies[dep])
                    });
                }
            });
        }

        let repo = "";
        if (typeof json.repository === 'string') {
            repo = json.repository;
        } else if (json.repository?.url) {
            repo = json.repository.url.replace('git+', '').replace('.git', '');
        }

        return {
            name: json.name || "Untitled Project",
            description: json.description || "Imported via Magic Scan",
            repo: repo,
            stack: stack.slice(0, 10) // Limit to top 10 to avoid clutter
        };
    } catch (e) {
        return null;
    }
}

function cleanVersion(version: string) {
    return version.replace('^', '').replace('~', '');
}

// A simple filter to highlight "Major" tech
function isMajorTech(dep: string) {
    const major = [
        'next', 'react', 'vue', 'nuxt', 'svelte', 'angular',
        'tailwindcss', 'typescript', 'supabase', 'firebase', 'prisma',
        'framer-motion', 'redux', 'zustand', 'tanstack', 'radix',
        'lucide', 'axios', 'graphql', 'apollo', 'trpc', 'drizzle'
    ];
    return major.some(m => dep.includes(m));
}
