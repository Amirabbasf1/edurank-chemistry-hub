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
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
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
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
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
          seo_description?: string | null
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
          category_id: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          discount_price: number | null
          duration_minutes: number
          grade: string | null
          id: string
          instructor_id: string | null
          instructor_name: string | null
          is_featured: boolean
          lesson_count: number
          objectives: string[]
          price: number
          rating: number
          requirements: string[]
          seo_description: string | null
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
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          discount_price?: number | null
          duration_minutes?: number
          grade?: string | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_featured?: boolean
          lesson_count?: number
          objectives?: string[]
          price?: number
          rating?: number
          requirements?: string[]
          seo_description?: string | null
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
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          discount_price?: number | null
          duration_minutes?: number
          grade?: string | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_featured?: boolean
          lesson_count?: number
          objectives?: string[]
          price?: number
          rating?: number
          requirements?: string[]
          seo_description?: string | null
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
          user_id: string
        }
        Insert: {
          answer_text?: string | null
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_option_id?: string | null
          user_id: string
        }
        Update: {
          answer_text?: string | null
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_option_id?: string | null
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
          id: string
          max_score: number
          score: number
          started_at: string
          submitted_at: string | null
          time_spent_seconds: number
          unanswered_count: number
          user_id: string
          wrong_count: number
        }
        Insert: {
          correct_count?: number
          exam_id: string
          id?: string
          max_score?: number
          score?: number
          started_at?: string
          submitted_at?: string | null
          time_spent_seconds?: number
          unanswered_count?: number
          user_id: string
          wrong_count?: number
        }
        Update: {
          correct_count?: number
          exam_id?: string
          id?: string
          max_score?: number
          score?: number
          started_at?: string
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
          chapter_id: string | null
          course_id: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          duration_minutes: number
          grade: string | null
          id: string
          is_published: boolean
          question_count: number
          slug: string
          title: string
        }
        Insert: {
          chapter_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          duration_minutes?: number
          grade?: string | null
          id?: string
          is_published?: boolean
          question_count?: number
          slug: string
          title: string
        }
        Update: {
          chapter_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          duration_minutes?: number
          grade?: string | null
          id?: string
          is_published?: boolean
          question_count?: number
          slug?: string
          title?: string
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
          chapter_id: string | null
          content: string | null
          course_id: string
          created_at: string
          duration_seconds: number
          id: string
          is_free_preview: boolean
          slug: string
          sort_order: number
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
          chapter_id?: string | null
          content?: string | null
          course_id: string
          created_at?: string
          duration_seconds?: number
          id?: string
          is_free_preview?: boolean
          slug: string
          sort_order?: number
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
          chapter_id?: string | null
          content?: string | null
          course_id?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          is_free_preview?: boolean
          slug?: string
          sort_order?: number
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
            foreignKeyName: "lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
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
          body: string
          chapter_id: string | null
          correct_text: string | null
          course_id: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          explanation: string | null
          grade: string | null
          id: string
          image_url: string | null
          lesson_id: string | null
          points: number
          source: string | null
          tags: string[]
          topic_id: string | null
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          body: string
          chapter_id?: string | null
          correct_text?: string | null
          course_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          grade?: string | null
          id?: string
          image_url?: string | null
          lesson_id?: string | null
          points?: number
          source?: string | null
          tags?: string[]
          topic_id?: string | null
          type?: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          body?: string
          chapter_id?: string | null
          correct_text?: string | null
          course_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          grade?: string | null
          id?: string
          image_url?: string | null
          lesson_id?: string | null
          points?: number
          source?: string | null
          tags?: string[]
          topic_id?: string | null
          type?: Database["public"]["Enums"]["question_type"]
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      app_role: "student" | "instructor" | "admin" | "super_admin"
      course_status: "draft" | "published" | "archived"
      difficulty: "beginner" | "intermediate" | "advanced"
      lesson_type: "video" | "text" | "pdf" | "quiz"
      question_type:
        | "multiple_choice"
        | "true_false"
        | "short_answer"
        | "numeric"
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
      app_role: ["student", "instructor", "admin", "super_admin"],
      course_status: ["draft", "published", "archived"],
      difficulty: ["beginner", "intermediate", "advanced"],
      lesson_type: ["video", "text", "pdf", "quiz"],
      question_type: [
        "multiple_choice",
        "true_false",
        "short_answer",
        "numeric",
      ],
    },
  },
} as const
