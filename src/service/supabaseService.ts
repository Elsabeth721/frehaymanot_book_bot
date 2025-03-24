import { SupabaseClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";

export async function fetchGrades(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from("books").select("grade");

  if (error) {
    console.error("Error fetching grades:", error);
    return [];
  }
  const uniqueGrades = [
    ...new Set(
      data.map((item: { grade: string }) => item.grade.replace(/"/g, "").trim())
    ),
  ];
  return uniqueGrades;
}
export async function fetchSubjects(
  supabase: SupabaseClient<any, "public", any>,
  grade: string
): Promise<string[]> {
  console.log("Fetching subjects for grade:", grade);

  const { data, error } = await supabase
    .from("books")
    .select("subject")
    .eq("grade", grade);

  if (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }

  console.log("Fetched subjects data:", data);
  const uniqueSubjects = [
    ...new Set(data.map((item: { subject: string }) => item.subject)),
  ];
  console.log("Unique subjects:", uniqueSubjects);

  return uniqueSubjects;
}

export async function fetchBooks(
  supabase: SupabaseClient,
  subject: string
): Promise<{ name: string; file_path: string }[]> {
  const { data, error } = await supabase
    .from("books")
    .select("name, file_path")
    .eq("subject", subject);

  if (error) {
    console.error("Error fetching books:", error);
    throw error;
  }

  console.log("Fetched books data:", data);
  return data;
}

const fileCache = new Map();

export async function downloadFile(
  supabase: SupabaseClient,
  filePath: string,
  ctx: any
) {
  try {
    await ctx.replyWithDocument(filePath);
  } catch (err) {
    console.error("Error in downloadFile:", err);
    await ctx.reply(
      "An error occurred while downloading the file. Please try again later. ❌"
    );
  }
}
