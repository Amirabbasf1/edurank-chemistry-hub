export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          description: string | null
          icon: string | null
          id: string
          title: string
          xp_reward: number
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          title: string
          xp_reward?: number
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      ai_tutor_conversations: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_conversations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_tutor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      article_categories: {
        Row: {
          description: string | null
          id: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          archived_at: string | null
          author_id: string | null
          author_name: string | null
          category_id: string | null
          content: string
          cover_url: string | null
          excerpt: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          published_at: string
          reading_minutes: number
          related_course_id: string | null
          scheduled_at: string | null
          seo_description: string | null
          seo_metadata: Json | null
          seo_title: string | null
          slug: string
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          archived_at?: string | null
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          content?: string
          cover_url?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string
          reading_minutes?: number
          related_course_id?: string | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_metadata?: Json | null
          seo_title?: string | null
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          archived_at?: string | null
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          content?: string
          cover_url?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string
          reading_minutes?: number
          related_course_id?: string | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_metadata?: Json | null
          seo_title?: string | null
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "article_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_related_course_id_fkey"
            columns: ["related_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          previous_values: Json | null
          target_id: string
          target_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          target_id: string
          target_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          target_id?: string
          target_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          access: Database["public"]["Enums"]["access_type"]
          archived_at: string | null
          category_id: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          discount_price: number | null
          duration_minutes: number
          grade: string | null
          grade_type: Database["public"]["Enums"]["chemistry_grade"] | null
          id: string
          instructor_id: string | null
          instructor_name: string | null
          is_featured: boolean
          lesson_count: number
          objectives: string[]
          price: number
          rating: number
          requirements: string[]
          scheduled_at: string | null
          seo_description: string | null
          seo_metadata: Json | null
          seo_title: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["course_status"]
          students_count: number
          tags: string[]
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access?: Database["public"]["Enums"]["access_type"]
          archived_at?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          discount_price?: number | null
          duration_minutes?: number
          grade?: string | null
          grade_type?: Database["public"]["Enums"]["chemistry_grade"] | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_featured?: boolean
          lesson_count?: number
          objectives?: string[]
          price?: number
          rating?: number
          requirements?: string[]
          scheduled_at?: string | null
          seo_description?: string | null
          seo_metadata?: Json | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["course_status"]
          students_count?: number
          tags?: string[]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access?: Database["public"]["Enums"]["access_type"]
          archived_at?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          discount_price?: number | null
          duration_minutes?: number
          grade?: string | null
          grade_type?: Database["public"]["Enums"]["chemistry_grade"] | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_featured?: boolean
          lesson_count?: number
          objectives?: string[]
          price?: number
          rating?: number
          requirements?: string[]
          scheduled_at?: string | null
          seo_description?: string | null
          seo_metadata?: Json | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["course_status"]
          students_count?: number
          tags?: string[]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          last_lesson_id: string | null
          progress_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          last_lesson_id?: string | null
          progress_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          last_lesson_id?: string | null
          progress_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_last_lesson_id_fkey"
            columns: ["last_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_answers: {
        Row: {
          answer_text: string | null
          attempt_id: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_option_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer_text?: string | null
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_option_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer_text?: string | null
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_option_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          correct_count: number
          exam_id: string
          expected_end_at: string | null
          flagged_questions: string[] | null
          id: string
          max_score: number
          question_order: string[] | null
          score: number
          started_at: string
          status: string | null
          submitted_at: string | null
          time_spent_seconds: number
          unanswered_count: number
          user_id: string
          wrong_count: number
        }
        Insert: {
          correct_count?: number
          exam_id: string
          expected_end_at?: string | null
          flagged_questions?: string[] | null
          id?: string
          max_score?: number
          question_order?: string[] | null
          score?: number
          started_at?: string
          status?: string | null
          submitted_at?: string | null
          time_spent_seconds?: number
          unanswered_count?: number
          user_id: string
          wrong_count?: number
        }
        Update: {
          correct_count?: number
          exam_id?: string
          expected_end_at?: string | null
          flagged_questions?: string[] | null
          id?: string
          max_score?: number
          question_order?: string[] | null
          score?: number
          started_at?: string
          status?: string | null
          submitted_at?: string | null
          time_spent_seconds?: number
          unanswered_count?: number
          user_id?: string
          wrong_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          exam_id: string
          id: string
          question_id: string
          sort_order: number
        }
        Insert: {
          exam_id: string
          id?: string
          question_id: string
          sort_order?: number
        }
        Update: {
          exam_id?: string
          id?: string
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          archived_at: string | null
          chapter_id: string | null
          course_id: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          duration_minutes: number
          ends_at: string | null
          grade: string | null
          id: string
          instructions: string | null
          is_published: boolean
          negative_marking: boolean | null
          passing_score: number | null
          question_count: number
          randomize_options: boolean | null
          randomize_questions: boolean | null
          scheduled_at: string | null
          slug: string
          starts_at: string | null
          status: Database["public"]["Enums"]["course_status"] | null
          subtopic_id: string | null
          title: string
          topic_id: string | null
          type: Database["public"]["Enums"]["exam_type"] | null
        }
        Insert: {
          archived_at?: string | null
          chapter_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          duration_minutes?: number
          ends_at?: string | null
          grade?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean
          negative_marking?: boolean | null
          passing_score?: number | null
          question_count?: number
          randomize_options?: boolean | null
          randomize_questions?: boolean | null
          scheduled_at?: string | null
          slug: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          subtopic_id?: string | null
          title: string
          topic_id?: string | null
          type?: Database["public"]["Enums"]["exam_type"] | null
        }
        Update: {
          archived_at?: string | null
          chapter_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          duration_minutes?: number
          ends_at?: string | null
          grade?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean
          negative_marking?: boolean | null
          passing_score?: number | null
          question_count?: number
          randomize_options?: boolean | null
          randomize_questions?: boolean | null
          scheduled_at?: string | null
          slug?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          subtopic_id?: string | null
          title?: string
          topic_id?: string | null
          type?: Database["public"]["Enums"]["exam_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          id: string
          is_published: boolean
          question: string
          scope: string
          sort_order: number
        }
        Insert: {
          answer: string
          id?: string
          is_published?: boolean
          question: string
          scope?: string
          sort_order?: number
        }
        Update: {
          answer?: string
          id?: string
          is_published?: boolean
          question?: string
          scope?: string
          sort_order?: number
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          content: Json | null
          id: string
          is_active: boolean | null
          section_slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          id?: string
          is_active?: boolean | null
          section_slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          id?: string
          is_active?: boolean | null
          section_slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          is_completed: boolean
          last_position_seconds: number
          lesson_id: string
          updated_at: string
          user_id: string
          watched_seconds: number
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          is_completed?: boolean
          last_position_seconds?: number
          lesson_id: string
          updated_at?: string
          user_id: string
          watched_seconds?: number
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          last_position_seconds?: number
          lesson_id?: string
          updated_at?: string
          user_id?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_resources: {
        Row: {
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          size_bytes: number | null
          title: string
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          size_bytes?: number | null
          title: string
        }
        Update: {
          created_at?: string
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          size_bytes?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          access: Database["public"]["Enums"]["access_type"]
          archived_at: string | null
          chapter_id: string | null
          chemistry_formula: string | null
          content: string | null
          course_id: string
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty"] | null
          duration_seconds: number
          estimated_time_minutes: number | null
          id: string
          is_free_preview: boolean
          lesson_type: string | null
          practice_questions: Json | null
          prerequisites: string[] | null
          related_lessons: string[] | null
          rich_content: Json | null
          scheduled_at: string | null
          seo_metadata: Json | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["course_status"] | null
          subtopic_id: string | null
          summary: string | null
          title: string
          topic_id: string | null
          type: Database["public"]["Enums"]["lesson_type"]
          updated_at: string
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          access?: Database["public"]["Enums"]["access_type"]
          archived_at?: string | null
          chapter_id?: string | null
          chemistry_formula?: string | null
          content?: string | null
          course_id: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"] | null
          duration_seconds?: number
          estimated_time_minutes?: number | null
          id?: string
          is_free_preview?: boolean
          lesson_type?: string | null
          practice_questions?: Json | null
          prerequisites?: string[] | null
          related_lessons?: string[] | null
          rich_content?: Json | null
          scheduled_at?: string | null
          seo_metadata?: Json | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["course_status"] | null
          subtopic_id?: string | null
          summary?: string | null
          title: string
          topic_id?: string | null
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          access?: Database["public"]["Enums"]["access_type"]
          archived_at?: string | null
          chapter_id?: string | null
          chemistry_formula?: string | null
          content?: string | null
          course_id?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"] | null
          duration_seconds?: number
          estimated_time_minutes?: number | null
          id?: string
          is_free_preview?: boolean
          lesson_type?: string | null
          practice_questions?: Json | null
          prerequisites?: string[] | null
          related_lessons?: string[] | null
          rich_content?: Json | null
          scheduled_at?: string | null
          seo_metadata?: Json | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["course_status"] | null
          subtopic_id?: string | null
          summary?: string | null
          title?: string
          topic_id?: string | null
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      media_library: {
        Row: {
          created_at: string
          created_by: string | null
          file_size: number | null
          file_type: string
          file_url: string
          filename: string
          id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          filename: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      mistake_notebook: {
        Row: {
          attempts_count: number
          created_at: string
          error_pattern: string | null
          id: string
          is_resolved: boolean
          last_attempt_at: string
          question_id: string
          user_id: string
        }
        Insert: {
          attempts_count?: number
          created_at?: string
          error_pattern?: string | null
          id?: string
          is_resolved?: boolean
          last_attempt_at?: string
          question_id: string
          user_id: string
        }
        Update: {
          attempts_count?: number
          created_at?: string
          error_pattern?: string | null
          id?: string
          is_resolved?: boolean
          last_attempt_at?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mistake_notebook_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          id: string
          items: Json
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          id?: string
          items?: Json
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          id?: string
          items?: Json
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          featured_image: string | null
          id: string
          seo_metadata: Json | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          seo_metadata?: Json | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          seo_metadata?: Json | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      periodic_table: {
        Row: {
          atomic_mass: number | null
          atomic_number: number
          description_fa: string | null
          electron_configuration: string | null
          electronegativity: number | null
          group_num: number | null
          name_en: string
          name_fa: string
          period: number | null
          physical_state: string | null
          symbol: string
          uses_fa: string[] | null
        }
        Insert: {
          atomic_mass?: number | null
          atomic_number: number
          description_fa?: string | null
          electron_configuration?: string | null
          electronegativity?: number | null
          group_num?: number | null
          name_en: string
          name_fa: string
          period?: number | null
          physical_state?: string | null
          symbol: string
          uses_fa?: string[] | null
        }
        Update: {
          atomic_mass?: number | null
          atomic_number?: number
          description_fa?: string | null
          electron_configuration?: string | null
          electronegativity?: number | null
          group_num?: number | null
          name_en?: string
          name_fa?: string
          period?: number | null
          physical_state?: string | null
          symbol?: string
          uses_fa?: string[] | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          action: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          action?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_streak: number
          full_name: string
          grade: string | null
          id: string
          is_public: boolean
          last_active_date: string | null
          longest_streak: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number
          full_name?: string
          grade?: string | null
          id: string
          is_public?: boolean
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number
          full_name?: string
          grade?: string | null
          id?: string
          is_public?: boolean
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      question_options: {
        Row: {
          body: string
          id: string
          is_correct: boolean
          question_id: string
          sort_order: number
        }
        Insert: {
          body: string
          id?: string
          is_correct?: boolean
          question_id: string
          sort_order?: number
        }
        Update: {
          body?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          alternative_solutions: string | null
          archived_at: string | null
          body: string
          chapter_id: string | null
          chemistry_formula: string | null
          concept_type:
            | Database["public"]["Enums"]["concept_classification"]
            | null
          correct_text: string | null
          course_id: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          educational_tips: string | null
          estimated_solving_time: number | null
          estimated_time_seconds: number | null
          exam_session: string | null
          explanation: string | null
          explanation_tips: string | null
          grade: string | null
          id: string
          image_url: string | null
          konkur_year: number | null
          lesson_id: string | null
          points: number
          question_type: Database["public"]["Enums"]["lesson_type"] | null
          scheduled_at: string | null
          source: string | null
          status: Database["public"]["Enums"]["course_status"] | null
          subtopic: string | null
          subtopic_id: string | null
          tags: string[]
          topic_id: string | null
          type: Database["public"]["Enums"]["question_type"]
          usage_count: number | null
        }
        Insert: {
          alternative_solutions?: string | null
          archived_at?: string | null
          body: string
          chapter_id?: string | null
          chemistry_formula?: string | null
          concept_type?:
            | Database["public"]["Enums"]["concept_classification"]
            | null
          correct_text?: string | null
          course_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          educational_tips?: string | null
          estimated_solving_time?: number | null
          estimated_time_seconds?: number | null
          exam_session?: string | null
          explanation?: string | null
          explanation_tips?: string | null
          grade?: string | null
          id?: string
          image_url?: string | null
          konkur_year?: number | null
          lesson_id?: string | null
          points?: number
          question_type?: Database["public"]["Enums"]["lesson_type"] | null
          scheduled_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          subtopic?: string | null
          subtopic_id?: string | null
          tags?: string[]
          topic_id?: string | null
          type?: Database["public"]["Enums"]["question_type"]
          usage_count?: number | null
        }
        Update: {
          alternative_solutions?: string | null
          archived_at?: string | null
          body?: string
          chapter_id?: string | null
          chemistry_formula?: string | null
          concept_type?:
            | Database["public"]["Enums"]["concept_classification"]
            | null
          correct_text?: string | null
          course_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          educational_tips?: string | null
          estimated_solving_time?: number | null
          estimated_time_seconds?: number | null
          exam_session?: string | null
          explanation?: string | null
          explanation_tips?: string | null
          grade?: string | null
          id?: string
          image_url?: string | null
          konkur_year?: number | null
          lesson_id?: string | null
          points?: number
          question_type?: Database["public"]["Enums"]["lesson_type"] | null
          scheduled_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          subtopic?: string | null
          subtopic_id?: string | null
          tags?: string[]
          topic_id?: string | null
          type?: Database["public"]["Enums"]["question_type"]
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          course_id: string
          created_at: string
          id: string
          is_approved: boolean
          rating: number
          user_id: string
        }
        Insert: {
          body?: string | null
          course_id: string
          created_at?: string
          id?: string
          is_approved?: boolean
          rating: number
          user_id: string
        }
        Update: {
          body?: string | null
          course_id?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      spaced_reviews: {
        Row: {
          created_at: string
          ease_factor: number
          id: string
          item_id: string
          item_type: string
          last_interval_days: number
          next_review_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          id?: string
          item_id: string
          item_type: string
          last_interval_days?: number
          next_review_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          id?: string
          item_id?: string
          item_type?: string
          last_interval_days?: number
          next_review_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subtopics: {
        Row: {
          created_at: string
          id: string
          slug: string
          sort_order: number | null
          title: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          sort_order?: number | null
          title: string
          topic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number | null
          title?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtopics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          body: string
          id: string
          is_published: boolean
          name: string
          rating: number
          role: string | null
          sort_order: number
        }
        Insert: {
          avatar_url?: string | null
          body: string
          id?: string
          is_published?: boolean
          name: string
          rating?: number
          role?: string | null
          sort_order?: number
        }
        Update: {
          avatar_url?: string | null
          body?: string
          id?: string
          is_published?: boolean
          name?: string
          rating?: number
          role?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      tool_usage: {
        Row: {
          created_at: string
          id: string
          tool_slug: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          tool_slug: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          tool_slug?: string
          user_id?: string | null
        }
        Relationships: []
      }
      topic_mastery: {
        Row: {
          id: string
          last_updated: string
          mastery_score: number
          topic_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          mastery_score?: number
          topic_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          mastery_score?: number
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_mastery_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_file_usage: {
        Args: { file_url: string }
        Returns: {
          target_id: string
          target_type: string
          title: string
        }[]
      }
      check_permission: {
        Args: { _action: string; _resource: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      access_type: "free" | "paid" | "subscription"
      app_role:
        | "student"
        | "instructor"
        | "admin"
        | "super_admin"
        | "content_manager"
        | "exam_manager"
        | "support_manager"
        | "financial_manager"
        | "seo_manager"
      chemistry_grade: "grade_10" | "grade_11" | "grade_12" | "konkur"
      concept_classification:
        | "conceptual"
        | "calculation"
        | "memorization"
        | "mixed"
      course_status: "draft" | "published" | "archived"
      difficulty: "beginner" | "intermediate" | "advanced"
      exam_type:
        | "practice"
        | "chapter"
        | "topic"
        | "grade"
        | "konkur"
        | "custom"
      lesson_type: "video" | "text" | "pdf" | "quiz"
      question_type:
        | "multiple_choice"
        | "true_false"
        | "short_answer"
        | "numeric"
        | "calculation"
        | "conceptual"
        | "mixed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_type: ["free", "paid", "subscription"],
      app_role: [
        "student",
        "instructor",
        "admin",
        "super_admin",
        "content_manager",
        "exam_manager",
        "support_manager",
        "financial_manager",
        "seo_manager",
      ],
      chemistry_grade: ["grade_10", "grade_11", "grade_12", "konkur"],
      concept_classification: [
        "conceptual",
        "calculation",
        "memorization",
        "mixed",
      ],
      course_status: ["draft", "published", "archived"],
      difficulty: ["beginner", "intermediate", "advanced"],
      exam_type: ["practice", "chapter", "topic", "grade", "konkur", "custom"],
      lesson_type: ["video", "text", "pdf", "quiz"],
      question_type: [
        "multiple_choice",
        "true_false",
        "short_answer",
        "numeric",
        "calculation",
        "conceptual",
        "mixed",
      ],
    },
  },
} as const
