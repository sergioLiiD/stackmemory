
import { Project } from "@/data/mock";

/**
 * Calculates the health score of a project based on its completeness.
 * Maximum score: 100
 * 
 * Criteria:
 * - Repository URL present: +25
 * - Live URL present: +25
 * - Stack defined (length > 0): +25
 * - Services defined (length > 0): +25
 */
export function calculateProjectHealth(project: Project): number {
    let score = 0;

    if (project.repoUrl && project.repoUrl.trim() !== "") {
        score += 25;
    }

    if (project.liveUrl && project.liveUrl.trim() !== "") {
        score += 25;
    }

    if (project.stack && project.stack.length > 0) {
        score += 25;
    }

    if (project.services && project.services.length > 0) {
        score += 25;
    }

    return score;
}
