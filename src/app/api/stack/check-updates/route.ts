
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
                // 1. Check for Version Updates (NPM Registry)
                const npmRes = await fetch(`https://registry.npmjs.org/${pkg.name}/latest`, {
                    headers: { 'Accept': 'application/json' },
                    next: { revalidate: 3600 }
                });

                let updateInfo = null;
                if (npmRes.ok) {
                    const data = await npmRes.json();
                    const latestVersion = data.version;
                    if (latestVersion && isNewer(pkg.version, latestVersion)) {
                        updateInfo = { latest: latestVersion };
                    }
                }

                // 2. Check for Security Vulnerabilities (OSV API)
                const osvRes = await fetch('https://api.osv.dev/v1/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        version: pkg.version,
                        package: {
                            name: pkg.name,
                            ecosystem: 'npm'
                        }
                    }),
                    next: { revalidate: 3600 }
                });

                let vulns = [];
                if (osvRes.ok) {
                    const osvData = await osvRes.json();
                    if (osvData.vulns) {
                        vulns = osvData.vulns.map((v: any) => ({
                            id: v.id,
                            summary: v.summary || v.details || 'Unknown Vulnerability',
                            severity: v.database_specific?.severity || 'HIGH' // Fallback
                        }));
                    }
                }

                if (updateInfo || vulns.length > 0) {
                    updates.push({
                        name: pkg.name,
                        current: pkg.version,
                        latest: updateInfo?.latest,
                        vulnerabilities: vulns
                    });
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
