
import { NextResponse } from "next/server";

interface PackageCheck {
    name: string;
    version: string;
}

// Simple semver comparison: returns true if v2 > v1
function isNewer(v1: string, v2: string): boolean {
    // Clean versions (remove ^, ~, etc)
    const cleanV1 = v1.replace(/[^0-9.]/g, '');
    const cleanV2 = v2.replace(/[^0-9.]/g, '');

    const p1 = cleanV1.split('.').map(Number);
    const p2 = cleanV2.split('.').map(Number);

    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n2 > n1) return true;
        if (n1 > n2) return false;
    }
    return false;
}

export async function POST(req: Request) {
    try {
        const { packages } = await req.json();

        if (!packages || !Array.isArray(packages)) {
            return NextResponse.json({ error: "Invalid packages array" }, { status: 400 });
        }

        const updates = [];

        for (const pkg of packages) {
            try {
                // Only check for standard npm packages (skip internal or strangely named ones if needed)
                if (!pkg.name || !pkg.version) continue;

                // Simple check: fetch latest version from npm registry
                const res = await fetch(`https://registry.npmjs.org/${pkg.name}/latest`, {
                    headers: { 'Accept': 'application/json' },
                    next: { revalidate: 3600 } // Cache for 1 hour
                });

                if (res.ok) {
                    const data = await res.json();
                    const latestVersion = data.version;

                    if (latestVersion && isNewer(pkg.version, latestVersion)) {
                        updates.push({
                            name: pkg.name,
                            current: pkg.version,
                            latest: latestVersion
                        });
                    }
                }
            } catch (err) {
                console.error(`Failed to check update for ${pkg.name}:`, err);
                // Continue to next package
            }
        }

        return NextResponse.json({ updates });

    } catch (error) {
        console.error("Error checking updates:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
