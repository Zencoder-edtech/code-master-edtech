// =============================================================================
// GetTopicUseCase — Application Layer Use Case
// =============================================================================
// Fetches a topic and its associated MCQs and problems from the repository.
// This is the "business logic" for loading a learning topic page.
//
// Clean Architecture:
//   - This use case depends on abstractions (the repo interface), not concrete
//     implementations. The actual repo (Supabase, in-memory, etc.) is injected.
//   - The domain types (Topic, MCQ, Problem) come from the domain layer.
//
// Usage (future):
//   const repo = new TopicRepository();
//   const useCase = new GetTopicUseCase(repo);
//   const { topic, mcqs, problems } = await useCase.execute('loops-001');
//
// Note: Currently not imported by the web app. The learn page uses local
// seed data directly until the monorepo build pipeline is wired.
// =============================================================================

import type { Topic, MCQ, Problem } from '../domain/entities';

/** Repository interface — any class that provides these methods can be injected */
interface TopicRepo {
  getById(id: string): Promise<Topic>;
  getMCQs(topicId: string): Promise<MCQ[]>;
  getProblems(topicId: string): Promise<Problem[]>;
}

export class GetTopicUseCase {
  constructor(private topicRepo: TopicRepo) {}

  /**
   * Fetches a complete topic with its MCQs and problems.
   * @param topicId — the unique ID of the topic to fetch
   * @returns An object containing the topic, its MCQs, and its problems
   */
  async execute(topicId: string): Promise<{
    topic: Topic;
    mcqs: MCQ[];
    problems: Problem[];
  }> {
    // Fetch all three in parallel for performance
    const [topic, mcqs, problems] = await Promise.all([
      this.topicRepo.getById(topicId),
      this.topicRepo.getMCQs(topicId),
      this.topicRepo.getProblems(topicId),
    ]);

    return { topic, mcqs, problems };
  }
}