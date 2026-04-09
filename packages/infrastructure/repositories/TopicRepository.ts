// =============================================================================
// Topic Repository — Infrastructure Layer (Supabase Implementation)
// =============================================================================
// Fetches topic data from Supabase PostgreSQL database.
// This is the concrete implementation of the TopicRepo interface
// used by GetTopicUseCase.
//
// Note: This file is in packages/infrastructure/ and is NOT currently
// imported by the web app. The learn page uses local seed data for now.
// When we wire the monorepo build pipeline, this will replace the
// hardcoded data in apps/web/data/python-loops.ts.
//
// TODO: When wiring this up:
//   1. Add @supabase/supabase-js as a dependency to packages/infrastructure
//   2. Create a proper server-side Supabase client (not the browser client)
//   3. Import this into the web app's server components
// =============================================================================

// Placeholder import — will be replaced with a proper server-side client
// import { createServerClient } from '@supabase/ssr';

export class TopicRepository {
  // TODO: Replace with actual Supabase server client
  // private supabase = createServerClient(...)

  /**
   * Fetch a single topic by its ID
   * @param id — unique topic identifier (e.g., "loops-001")
   */
  async getById(id: string) {
    // TODO: Uncomment when Supabase is wired
    // const { data } = await this.supabase
    //   .from('topics')
    //   .select('*')
    //   .eq('id', id)
    //   .single();
    // return data;
    throw new Error(`TopicRepository.getById(${id}) — not yet connected to Supabase`);
  }

  /**
   * Fetch all MCQs for a specific topic
   * @param topicId — the topic these MCQs belong to
   */
  async getMCQs(topicId: string) {
    // TODO: Uncomment when Supabase is wired
    // const { data } = await this.supabase
    //   .from('mcqs')
    //   .select('*')
    //   .eq('topicId', topicId);
    // return data;
    throw new Error(`TopicRepository.getMCQs(${topicId}) — not yet connected to Supabase`);
  }

  /**
   * Fetch all coding problems for a specific topic
   * @param topicId — the topic these problems belong to
   */
  async getProblems(topicId: string) {
    // TODO: Uncomment when Supabase is wired
    // const { data } = await this.supabase
    //   .from('problems')
    //   .select('*')
    //   .eq('topicId', topicId);
    // return data;
    throw new Error(`TopicRepository.getProblems(${topicId}) — not yet connected to Supabase`);
  }
}