export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    updated_at: string;
    language: string | null;
}

export async function getUserRepos(providerToken: string): Promise<GitHubRepo[]> {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
            Authorization: `Bearer ${providerToken}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        cache: 'no-store' // Always fetch fresh
    });

    if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    return response.json();
}
