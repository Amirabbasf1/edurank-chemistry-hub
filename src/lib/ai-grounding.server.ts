import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function getCurriculumContext(query: string, grade?: string) {
  // Search articles, lessons, and topics for relevant content
  const [{ data: articles }, { data: lessons }, { data: topics }] = await Promise.all([
    supabaseAdmin.from("articles").select("title, content").textSearch("title", query).limit(2),
    supabaseAdmin.from("lessons").select("title, content").textSearch("title", query).limit(2),
    supabaseAdmin.from("topics").select("title, description").textSearch("title", query).limit(2)
  ]);

  let context = "Relevant EduRank Curriculum Content:\n";
  
  if (articles?.length) {
    context += "\nArticles:\n" + articles.map(a => `- ${a.title}: ${a.content?.substring(0, 300)}...`).join("\n");
  }
  
  if (lessons?.length) {
    context += "\nLessons:\n" + lessons.map(l => `- ${l.title}: ${l.content?.substring(0, 300)}...`).join("\n");
  }

  return context;
}
