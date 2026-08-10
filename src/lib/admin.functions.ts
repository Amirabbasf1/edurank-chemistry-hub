import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const adminGetUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, user_roles(role)");
    if (error) throw error;
    return data;
  });

export const adminGetCourses = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const adminCreateCourse = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: course, error } = await supabase
      .from("courses")
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return course;
  });

export const adminUpdateCourse = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; updates: any }) => data)
  .handler(async ({ data }) => {
    const { data: course, error } = await supabase
      .from("courses")
      .update(data.updates)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return course;
  });

export const adminGetMedia = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const adminGetAuditLogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  });

export const adminGetHomepageSections = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data;
  });

export const adminUpdateHomepageSection = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; updates: any }) => data)
  .handler(async ({ data }) => {
    const { data: section, error } = await supabase
      .from("homepage_sections")
      .update(data.updates)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return section;
  });
