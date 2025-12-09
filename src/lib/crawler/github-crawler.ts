
import { Project } from "@/data/mock";

export interface FileNode {
    path: string;
    mode: string;
    type: "blob" | "tree";
    sha: string;
    size?: number;
    url: string;
}

export interface ProcessedFile {
    path: string;
    content: string;
    size: number;
    language?: string;
}

const IGNORED_PATHS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.DS_Store',
    '.env',
    '.env.local',
    '.vercel',
    'public/assets', // Often binary
];

const IGNORED_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', // Images
    '.pdf', '.doc', '.docx', // Documents
    '.zip', '.tar', '.gz', // Archives
    '.exe', '.dll', '.so', '.dylib', // Binaries
    '.mp4', '.mp3', '.mov' // Media
];

export async function fetchRepoFileTree(owner: string, repo: string, token: string, branch: string = 'main'): Promise<FileNode[]> {
    // 1. Get the default branch if not specified (or if we failed on 'main')
    // Ideally we should ask the API for the default branch, but for now 'main' or 'master' is a safe guess pattern.
    // We'll trust the caller provided a valid branch or we default to 'main'.

    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        }
    });

    if (!res.ok) {
        if (res.status === 404 && branch === 'main') {
            // Try 'master' as fallback? Or simply throw.
            // Let's fallback once
            console.warn("Main branch not found, trying master...");
            return fetchRepoFileTree(owner, repo, token, 'master');
        }
        throw new Error(`Failed to fetch file tree: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return (data.tree as FileNode[]) || [];
}

export function filterFiles(tree: FileNode[]): FileNode[] {
    return tree.filter(node => {
        if (node.type !== 'blob') return false; // We only want files, not directories (tree)

        // Check ignored paths
        if (IGNORED_PATHS.some(ignored => node.path.includes(ignored) || node.path.startsWith(ignored + '/'))) {
            return false;
        }

        // Check ignored extensions
        if (IGNORED_EXTENSIONS.some(ext => node.path.endsWith(ext))) {
            return false;
        }

        return true;
    });
}

export async function fetchFileContent(url: string, token: string): Promise<string> {
    const res = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3.raw', // Request raw content
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch file content: ${res.status} ${res.statusText}`);
    }

    return await res.text();
}

/**
 * Main entry point to process a repository
 */
export async function processRepository(repoUrl: string, token: string, maxFiles: number = 50): Promise<ProcessedFile[]> {
    // 1. Parse Owner/Repo
    // Format: https://github.com/owner/repo
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
        throw new Error("Invalid GitHub URL");
    }
    const [_, owner, repo] = match;

    console.log(`Crawling ${owner}/${repo}...`);

    // 2. Fetch Tree
    const tree = await fetchRepoFileTree(owner, repo, token);
    console.log(`Found ${tree.length} total nodes.`);

    // 3. Filter
    const eligibleFiles = filterFiles(tree);
    console.log(`Filtered down to ${eligibleFiles.length} eligible source files.`);

    // 4. Chunk/Select (Limit to avoiding hitting rate limits or timeouts blindly)
    const filesToProcess = eligibleFiles.slice(0, maxFiles);

    // 5. Fetch Content (in parallel with concurrency limit ideally, but Promise.all for simple V1)
    const results = await Promise.all(filesToProcess.map(async (node) => {
        try {
            // The node.url from tree API is the API URL for the blob, e.g. https://api.github.com/repos/.../git/blobs/...
            // However, that returns base64 JSON by default unless we use proper accept header or raw param?
            // Actually 'url' in tree response points to the blob resource. 
            // Better to use the raw content URL if we can construct it, or use the API blob endpoint with raw header.
            // Using the API generic fetch with 'application/vnd.github.v3.raw' works on the blob URL.

            const content = await fetchFileContent(node.url, token);
            return {
                path: node.path,
                content,
                size: node.size || content.length,
                language: node.path.split('.').pop() // simple extension check
            };
        } catch (e) {
            console.error(`Error fetching ${node.path}`, e);
            return null;
        }
    }));

    return results.filter(Boolean) as ProcessedFile[];
}
