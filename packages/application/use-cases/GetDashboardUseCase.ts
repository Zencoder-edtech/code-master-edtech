// =============================================================================
// GetDashboardUseCase — Application Layer Use Case
// =============================================================================
// Computes the dashboard view model for a given user. Aggregates:
//   • Global streak (max streak across all topics)
//   • Per-topic progress (solved / total problems)
//   • Badges (earned when all problems in a topic are passed)
//
// Badge naming convention:
//   "<Topic Title> Master" — e.g., "Loops Master", "Functions Master"
//
// Dependencies (injected via constructor):
//   progressRepo — reads Progress records for the user
//   topicRepo    — reads Topic metadata (title, problem count)
//
// Usage (future):
//   const useCase = new GetDashboardUseCase(progressRepo, topicRepo);
//   const dashboard = await useCase.execute('user-123');
// =============================================================================

import type { Progress } from '@repo/domain';

/** Minimal topic info needed for dashboard display */
interface TopicInfo {
  id: string;
  title: string;
  totalProblems: number;
}

/** Repository interfaces (injected) */
interface ProgressRepo {
  getAllByUser(userId: string): Promise<Progress[]>;
}

interface TopicRepo {
  getAllTopics(): Promise<TopicInfo[]>;
}

/** Dashboard view model returned to the UI */
export interface DashboardData {
  streak: number;
  longestStreak: number;
  topics: Array<{
    topicId: string;
    topicTitle: string;
    solved: number;
    total: number;
    isComplete: boolean;
    badge: string | null;
  }>;
}

export class GetDashboardUseCase {
  constructor(
    private progressRepo: ProgressRepo,
    private topicRepo: TopicRepo
  ) {}

  /**
   * Builds the full dashboard data for a user.
   * @param userId — the authenticated user's ID
   * @returns DashboardData with streak, topic progress, and badges
   */
  async execute(userId: string): Promise<DashboardData> {
    // Fetch all data in parallel
    const [progressRecords, allTopics] = await Promise.all([
      this.progressRepo.getAllByUser(userId),
      this.topicRepo.getAllTopics(),
    ]);

    // Index progress by topicId for O(1) lookup
    const progressByTopic = new Map<string, Progress>();
    for (const p of progressRecords) {
      progressByTopic.set(p.topicId, p);
    }

    // Calculate global streak (max across all topics)
    let globalStreak = 0;
    let globalLongest = 0;
    for (const p of progressRecords) {
      if (p.streak > globalStreak) globalStreak = p.streak;
      if (p.longestStreak > globalLongest) globalLongest = p.longestStreak;
    }

    // Build per-topic progress + badge info
    const topics = allTopics.map((topic) => {
      const progress = progressByTopic.get(topic.id);
      const solved = progress?.problemsSolved.length ?? 0;
      const total = topic.totalProblems;
      const isComplete = progress?.isTopicComplete ?? false;

      return {
        topicId: topic.id,
        topicTitle: topic.title,
        solved,
        total,
        isComplete,
        badge: isComplete ? `${topic.title} Master` : null,
      };
    });

    return {
      streak: globalStreak,
      longestStreak: globalLongest,
      topics,
    };
  }
}
