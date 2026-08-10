# EduRank Chemistry Hub

EduRank — Complete Professional EdTech Platform

Master Product, UX, UI, Database & Development Specification

Build EduRank, a professional, production-oriented, scalable Persian EdTech platform focused on Chemistry education for Iranian students.

IMPORTANT: EduRank is NOT a simple landing page, static website, or visual prototype.

Build it as a real, database-driven educational technology platform with a complete LMS architecture.

The platform must support:

Students

Instructors

Administrators

Super Administrators

Courses

Chapters

Topics

Lessons

Video learning

Educational resources

Exercises

Exams

Question banks

Assignments

Progress tracking

Learning analytics

Gamification

Achievements

Certificates

Notifications

Search

Articles / Blog

SEO

Payments

Orders

Coupons

Subscriptions

AI educational assistant

Personalized learning

Study planner

Support tickets

CMS

Analytics

Security

Role-based access control

The architecture must be clean, modular, secure, maintainable, scalable, and ready for future development by professional developers.

1. PRODUCT VISION

EduRank is a premium Persian Chemistry learning platform designed for Iranian students.

Main educational categories:

Chemistry Grade 10

Chemistry Grade 11

Chemistry Grade 12

Konkur Chemistry

Final Exam Preparation

Chemistry Practice

Problem Solving

Conceptual Chemistry

Advanced Chemistry

Exam Preparation

EduRank should combine:

Modern LMS + Video Learning + Exam Platform + Student Dashboard + Learning Analytics + Gamification + AI Tutor

The product must feel like a serious commercial EdTech startup.

Do not make it look like a generic WordPress template.

Do not create a generic SaaS dashboard and simply change the text to Chemistry.

Create a unique Chemistry-focused educational experience.

2. LANGUAGE & RTL

The primary language is:

Persian / Farsi

The entire application must support:

RTL layout

Persian typography

Persian UI

Persian validation messages

Persian error messages

Persian dates

Persian-friendly number formatting

Persian SEO content

Use a high-quality Persian font such as:

Vazirmatn

All user-facing interfaces must be properly RTL.

Technical identifiers such as:

database fields

API names

variable names

component names

can remain in English.

The architecture should be prepared for future English localization.

3. BRAND IDENTITY

Brand:

EduRank

Persian brand:

ادیورَنک

Suggested slogan:

شیمی را مفهومی یاد بگیر، حرفه‌ای پیش برو

Brand personality:

Professional

Scientific

Modern

Intelligent

Trustworthy

Motivational

Technology-driven

Academic

Avoid childish educational design.

4. VISUAL DESIGN SYSTEM

Create a complete reusable design system before building the individual pages.

Visual direction:

Premium

Minimal

Modern

Scientific

Elegant

Technology-oriented

Suggested color direction:

Primary:

Deep blue / Indigo

Secondary:

Cyan / Light blue

Surfaces:

White

Very light gray

Text:

Dark neutral

Semantic colors:

Green = success

Orange = warning

Red = error

Do not overuse colors.

Use:

modern cards

subtle shadows

clean borders

12–20px border radius

consistent spacing

elegant typography

professional charts

subtle animations

smooth transitions

Animations must be subtle and performance-friendly.

5. RESPONSIVE DESIGN

The entire application must be mobile-first.

Support:

360px

375px

390px

412px

Tablet

Laptop

Desktop

Large desktop

Requirements:

No horizontal scrolling

Responsive tables

Responsive dashboards

Mobile-friendly video player

Touch-friendly controls

Responsive navigation

Responsive exam interface

The platform must feel like a real mobile application when used on a phone.

6. HOMEPAGE

Create a premium homepage.

The homepage must NOT be a simple template.

It should communicate:

Education + Chemistry + Technology + Trust

7. 3D HERO SECTION

The first section of the homepage must contain a professional 3D Chemistry-themed interactive animation.

The 3D experience should include concepts such as:

Molecules

Atoms

Chemical bonds

Molecular structures

Periodic-table-inspired elements

Floating particles

Scientific geometric elements

The scene should look premium and cinematic, not childish.

Possible technology:

Three.js

WebGL

React Three Fiber

or another optimized 3D web solution

Use the best option supported by the project architecture.

Desktop interaction

Allow subtle interaction such as:

Mouse movement

Parallax

Smooth rotation

Floating objects

Depth effects

Very subtle camera movement

Do NOT make the animation distracting.

Mobile behavior

On mobile:

Reduce 3D complexity

Reduce polygon count

Reduce number of objects

Reduce animation intensity

Reduce FPS if appropriate

For low-end devices:

provide a lightweight fallback

If WebGL is unavailable:

3D WebGL → Lightweight 2D animation → Static fallback

The website must remain fully functional without WebGL.

Hero content

Headline:

شیمی را مفهومی یاد بگیر، حرفه‌ای پیش برو

Description:

یک مسیر آموزشی کامل برای یادگیری شیمی، حل تمرین، شرکت در آزمون و رسیدن به تسلط واقعی.

Primary CTA:

شروع یادگیری

Secondary CTA:

مشاهده دوره‌ها

The main text must remain readable and accessible even when the 3D animation is running.

8. 3D PERFORMANCE

The 3D hero must not destroy page performance.

Implement:

Lazy loading

Dynamic loading

Optimized models

Low-poly assets

Texture optimization

Reduced rendering on mobile

Reduced animation on low-end devices

prefers-reduced-motion

WebGL fallback

Progressive enhancement

Do not block the main page content while the 3D scene loads.

Prioritize:

Content visibility + Core Web Vitals + usability

over visual complexity.

9. HOMEPAGE SECTIONS

Homepage should include:

Hero

3D Chemistry animation + CTA.

Platform Statistics

Dynamic statistics:

Students

Courses

Lessons

Exams

Questions

Education Levels

Cards:

پایه دهم

پایه یازدهم

پایه دوازدهم

کنکور

Featured Courses

Dynamic featured courses.

Popular Courses

Based on enrollment/popularity.

Latest Courses

Recently published courses.

Why EduRank?

Highlight:

Conceptual learning

Structured learning paths

Professional exams

Progress analytics

Video learning

AI Tutor

Learning Path

Visual path:

Grade 10 → Grade 11 → Grade 12 → Konkur

Featured Instructors

Show instructor cards.

Student Testimonials

Dynamic testimonials.

Latest Articles

Display recent SEO articles.

FAQ

Expandable FAQ section.

Final CTA

Strong call-to-action:

یادگیری شیمی را از همین امروز شروع کن.

10. GLOBAL HEADER

Desktop navigation:

Home

Courses

Grade 10

Grade 11

Grade 12

Konkur

Exams

Articles

About

Contact

Search

Login

Register

Authenticated users:

Dashboard

Notifications

Profile

Logout

Header should become a mobile menu on small screens.

11. GLOBAL FOOTER

Footer sections:

EduRank

Short brand description.

Education

Grade 10

Grade 11

Grade 12

Konkur

Exams

Platform

Courses

Articles

Instructors

FAQ

Certificates

Company

About

Contact

Support

Legal

Privacy Policy

Terms of Service

Refund Policy

Cookie Policy

Include social links and copyright.

12. COURSE SYSTEM

Build a complete LMS course architecture.

Hierarchy:

Course

→ Chapter

→ Topic

→ Lesson

Course fields:

Title

Slug

Description

Short description

Thumbnail

Banner

Instructor

Grade

Category

Difficulty

Duration

Lesson count

Price

Discount price

Subscription access

Status

Tags

SEO metadata

Requirements

Learning objectives

Target audience

13. COURSE PAGE

Each course must have a professional course landing page.

Include:

Hero

Course thumbnail

Instructor

Rating

Student count

Duration

Number of lessons

Difficulty

Price

Discount

Enrollment CTA

Sections:

About

Learning Objectives

Requirements

Curriculum

Instructor

Reviews

FAQ

Related Courses

Student Results

14. COURSE CURRICULUM

Course structure:

Course

→ Chapter

→ Topic

→ Lesson

Each lesson supports:

Video

Text

PDF

Images

Audio

Exercises

Quiz

Assignment

Downloadable files

Lessons can be:

Free preview

Paid

Subscription-only

Admin/instructors should be able to reorder chapters, topics and lessons using drag-and-drop.

15. LESSON LEARNING EXPERIENCE

Create an immersive learning interface.

Desktop:

Curriculum sidebar

Main content

Optional secondary information panel

Include:

Breadcrumb

Lesson title

Video player

Lesson content

Attachments

Notes

Questions

Related resources

Previous lesson

Next lesson

Button:

علامت‌گذاری به عنوان تکمیل‌شده

Automatically track progress.

16. VIDEO LEARNING

Create a professional video-learning architecture.

Track:

Watch progress

Completion percentage

Watch duration

Last playback position

Completion status

Support:

Resume playback

Playback speed

Fullscreen

Captions

Responsive player

Do not hard-code video URLs.

Video metadata must come from the database.

Design the architecture so it can later integrate with:

CDN

Cloud storage

External video hosting

Secure video delivery

17. NOTES & BOOKMARKS

Students can:

Bookmark lessons

Save lessons

Create personal notes

Mark important content

Dashboard section:

درس‌های ذخیره‌شده

18. EXERCISE SYSTEM

Lessons can contain exercises.

Question types:

Multiple choice

True/False

Fill in the blank

Numeric answer

Short answer

Support explanations after submission.

Track performance.

19. EXAM ENGINE

Build a complete exam engine.

Support:

Timed exams

Practice mode

Exam mode

Randomized questions

Question pools

Difficulty levels

Chapter exams

Course exams

Comprehensive exams

Konkur-style exams

Question types:

Multiple choice

True/False

Short answer

Numeric answer

20. EXAM INTERFACE

Create a professional exam interface.

Include:

Countdown timer

Question number

Question navigation

Answer selection

Mark for review

Previous / Next

Auto-save

Submit exam

Confirmation dialog

Warn the user before time expires.

Automatically submit when time reaches zero.

21. EXAM RESULTS

After an exam display:

Score

Percentage

Correct answers

Incorrect answers

Unanswered questions

Time spent

Accuracy

Chapter performance

Topic performance

Difficulty analysis

Charts should visualize the results.

Show:

نقاط قوت

نقاط ضعف

پیشنهاد مطالعه بعدی

22. QUESTION BANK

Create a professional question bank.

Question fields:

Question text

Images

Explanation

Difficulty

Grade

Chapter

Topic

Tags

Source

Correct answer

Options

Points

Admin can filter by:

Grade

Chapter

Topic

Difficulty

Type

Tags

Allow building exams from question pools.

23. ASSIGNMENTS

Instructors can create assignments.

Students can:

View assignment

Upload files

Submit

View deadline

View grade

Receive instructor feedback

Statuses:

Draft

Open

Submitted

Graded

Late

24. STUDENT DASHBOARD

Create a premium student dashboard.

Overview

Show:

Welcome message

Current learning streak

Total learning time

Course progress

Average exam score

Completed lessons

Achievements

Continue Learning

Automatically identify the latest active lesson.

My Courses

Display:

Course

Progress

Last activity

Continue button

Upcoming

Show:

Upcoming exams

Assignment deadlines

Recent Activity

Show:

Completed lessons

Exams

Achievements

Notifications

25. LEARNING ANALYTICS

Track:

Total study time

Daily activity

Weekly activity

Monthly activity

Course progress

Lesson completion

Exam scores

Accuracy

Weak topics

Strong topics

Average session duration

Charts:

Weekly study

Course progress

Exam performance

Topic performance

26. LEARNING STREAK

Create a learning streak system.

Example:

🔥 7 روز یادگیری متوالی

Track:

Current streak

Longest streak

Active learning days

27. GAMIFICATION

Create professional gamification.

Achievements:

First lesson

First exam

10 lessons completed

100 questions answered

7-day streak

Course completed

Perfect score

Use:

XP

Points

Levels

Badges

Example levels:

شروع‌کننده

یادگیرنده

شیمی‌دان جوان

متخصص شیمی

Do not make the system childish.

28. CERTIFICATES

After completing eligible courses, students can receive certificates.

Certificate contains:

Student name

Course

Completion date

Certificate ID

Instructor

EduRank branding

Create:

/certificates/verify/[id]

for certificate verification.

29. USER PROFILE

Student profile:

Name

Avatar

Grade

Bio

Learning statistics

Courses

Achievements

Certificates

Privacy settings must determine which information is publicly visible.

30. AUTHENTICATION

Implement secure authentication:

Register

Login

Logout

Password reset

Email verification

Profile update

Password change

Session management

Prepare architecture for:

Google Login

Phone OTP

31. ROLE-BASED ACCESS CONTROL

Roles:

Student

Can:

Enroll

Learn

Take exams

View own results

Manage own profile

Instructor

Can:

Create courses

Manage assigned content

Create exams

View student analytics

Admin

Full platform administration.

Super Admin

Complete system control.

Authorization must NOT rely only on frontend checks.

Enforce permissions server-side and database-side.

32. ADMIN DASHBOARD

Create a complete admin panel.

Dashboard metrics:

Users

Students

Instructors

Courses

Enrollments

Revenue

Exams

Questions

Activity

System statistics

Use professional charts.

33. USER MANAGEMENT

Admin can:

Search

Filter

Sort

Paginate

Create

Edit

Suspend

Deactivate

Change role

Reset password

View activity

34. COURSE MANAGEMENT

Admin/instructors can:

Create

Edit

Delete

Duplicate

Publish

Unpublish

Archive

Feature

Course editor must support drag-and-drop organization.

35. CMS

Create a CMS for:

Pages

FAQs

Articles

Categories

Tags

Announcements

Testimonials

Banners

36. ARTICLES / BLOG

Create a full professional Articles / Blog system.

This is an important part of EduRank.

The goal is to attract organic Google traffic and convert visitors into students.

Main URL:

/articles

or:

/blog

Use whichever is better for the final architecture.

37. ARTICLE HOMEPAGE

Include:

Featured Article

Large featured article.

Latest Articles

Newest content.

Popular Articles

Based on views and engagement.

Categories

Examples:

شیمی دهم

شیمی یازدهم

شیمی دوازدهم

شیمی کنکور

آموزش شیمی

نکات تستی

حل مسئله

امتحانات نهایی

کنکور

آموزش مفهومی

آزمایشگاه شیمی

38. ARTICLE PAGE

Every article must have its own SEO-friendly URL.

Example:

/articles/chemistry-grade-10

or an equivalent clean slug structure.

Article page includes:

Title

Featured image

Author

Publication date

Updated date

Estimated reading time

Category

Tags

Article content

Table of contents

Images

Formulas

Internal links

Related articles

Related courses

CTA

39. ARTICLE TABLE OF CONTENTS

Long articles should automatically generate a Table of Contents.

Example:

Introduction

Basic concepts

Examples

Common mistakes

Practice

FAQ

Desktop:

Sticky Table of Contents.

Mobile:

Accordion or expandable Table of Contents.

40. ARTICLE SEO

Every article must support:

SEO title

Meta description

Slug

Canonical URL

Open Graph title

Open Graph description

Open Graph image

Twitter/X metadata

Author

Publish date

Updated date

Tags

Structured data where appropriate:

Article Schema

Breadcrumb Schema

FAQ Schema

41. AUTHOR SYSTEM

Each article must have an author.

Author profile includes:

Name

Avatar

Bio

Articles

Prepare architecture for author profile pages.

42. INTERNAL LINKING

The article system must support strong internal linking.

Example:

An article about:

Stoichiometry

can link to:

Chemistry course

Stoichiometry lesson

Related articles

Related exams

Related questions

At the end of the article show:

مبحث مرتبط را کامل یاد بگیر

with a CTA to the relevant EduRank course.

43. INTERACTIVE ARTICLES

Articles should support rich educational content:

Formulas

Tables

Charts

Images

Videos

Quizzes

Multiple-choice questions

Solved examples

Tip boxes

Warning boxes

Important boxes

The article editor should support structured rich content.

44. ARTICLE FAQ

Each article can contain FAQs.

Example:

استوکیومتری چیست؟

چگونه مسائل استوکیومتری را حل کنیم؟

استوکیومتری در کدام پایه تدریس می‌شود؟

Generate FAQ structured data when appropriate.

45. ARTICLE SEARCH

Users can search articles by:

Title

Content

Category

Tag

Support:

Fast search

Filters

Sorting

Empty states

46. RELATED ARTICLES

At the end of every article display:

مقالات مرتبط

Recommendations should use:

Category

Tags

Grade

Topic

Content relationships

47. ARTICLE ANALYTICS

Track:

Views

Unique views

Reading time

Scroll depth

Related article clicks

Course CTA clicks

Admin can see the most popular articles.

48. SEO CONTENT STRATEGY

The architecture should support hundreds or thousands of educational articles.

Potential topics:

شیمی دهم چیست؟

آموزش شیمی دهم

فصل اول شیمی دهم

آموزش استوکیومتری

روش حل مسائل استوکیومتری

آموزش جدول تناوبی

واکنش‌های شیمیایی چیست؟

اسید و باز چیست؟

آموزش موازنه واکنش‌ها

نکات شیمی کنکور

بهترین روش مطالعه شیمی

چگونه در شیمی کنکور درصد بالا بزنیم؟

سوالات پرتکرار شیمی

نمونه سوال شیمی دهم

نمونه سوال شیمی یازدهم

نمونه سوال شیمی دوازدهم

امتحان نهایی شیمی

تست شیمی کنکور

The goal is for the EduRank article section to become a strong Chemistry knowledge hub.

49. ARTICLES + LMS INTEGRATION

Articles must not be isolated from the LMS.

Create connections:

Article → Lesson → Course → Exercise → Exam

For example:

An article about Stoichiometry should be able to recommend:

Related lesson

Related course

Related practice

Related exam

Use contextual CTAs.

50. GLOBAL SEARCH

Create a global search system.

Search across:

Courses

Lessons

Topics

Articles

Questions

Features:

Search suggestions

Filters

Sorting

Highlighted results

Empty states

Architecture should allow integration with a dedicated search engine in the future.

51. NOTIFICATIONS

Create notification types:

New course

Exam reminder

Assignment deadline

Course update

Achievement

System notification

Notification center:

Read/unread

Mark all as read

Delete

Prepare architecture for:

Email

Push

SMS

52. MESSAGING ARCHITECTURE

Prepare architecture for future messaging.

Potential:

Student → Instructor

Support

Course discussions

Do not create unnecessary complex real-time chat for the MVP, but keep the architecture extensible.

53. REVIEWS & RATINGS

Students can review enrolled courses.

Rating:

1–5 stars

Review includes:

Rating

Text

User

Date

Admin moderation required.

54. PAYMENT SYSTEM

Prepare a professional commerce architecture.

Support:

Free courses

Paid courses

Discount codes

Coupons

Orders

Transactions

Refund status

Payment status

Prepare architecture for Iranian payment gateways.

Do not hard-code one specific payment provider.

Store:

Order ID

User

Amount

Discount

Final amount

Transaction ID

Payment status

Created date

Paid date

Never trust payment status from the client.

Verify payments securely server-side.

55. SUBSCRIPTIONS

Prepare subscription architecture.

Plans:

Free

Student

Premium

Pro

Store:

Plan

Start date

Expiration date

Status

Renewal state

If an external payment service is unavailable, keep subscription integration isolated and ready for future implementation.

56. COUPONS

Admin can create:

Percentage discounts

Fixed discounts

Expiration date

Usage limits

User-specific coupons

Course-specific coupons

Coupon validation must happen server-side.

57. AI CHEMISTRY TUTOR

Create a secure architecture for an AI educational assistant.

The AI Tutor should eventually be able to:

Explain Chemistry concepts

Explain questions

Give hints

Generate practice questions

Summarize lessons

Create study plans

Identify weak topics

Recommend lessons

Explain mistakes

The AI should behave like a tutor.

It should encourage learning rather than simply giving answers.

Never expose AI API keys in frontend code.

AI requests must go through a secure server-side layer.

58. PERSONALIZED LEARNING

Prepare an adaptive learning system.

Analyze:

Exam performance

Lesson completion

Weak topics

Strong topics

Study behavior

Generate recommendations such as:

پیشنهاد مطالعه بعدی

Example:

"Review Chapter 2 before taking the next comprehensive exam."

59. STUDY PLANNER

Create a study planner.

Students can define:

Goal

Exam date

Daily study time

Topics

Target score

Generate study plans.

Dashboard:

Today's tasks

Upcoming tasks

Completion percentage

60. CALENDAR

Student calendar includes:

Exams

Assignments

Study sessions

Deadlines

61. SUPPORT SYSTEM

Create support tickets.

Features:

Contact form

FAQ

Support tickets

Ticket fields:

Subject

Category

Message

Priority

Status

User

Created date

Statuses:

Open

In Progress

Waiting

Resolved

Closed

62. LEGAL PAGES

Create:

Privacy Policy

Terms of Service

Refund Policy

Cookie Policy

Use placeholder legal content where professional legal review is required.

63. SEO ARCHITECTURE

Every important page must support:

SEO title

Meta description

Canonical URL

Open Graph

Twitter/X metadata

Structured data

Clean slug

Breadcrumbs

Where appropriate use:

Course Schema

Article Schema

FAQ Schema

Organization Schema

Breadcrumb Schema

Generate:

sitemap.xml

robots.txt

The architecture must be optimized for Persian SEO.

64. URL STRUCTURE

Use clean URLs.

Examples:

/

/courses

/courses/chemistry-grade-10

/courses/chemistry-grade-10/lessons/...

/articles

/articles/stoichiometry

/exams

/certificates/verify/...

Avoid meaningless URLs such as:

/page?id=123

Use readable slugs.

65. PERFORMANCE

Prioritize:

Fast loading

Lazy loading

Code splitting

Image optimization

Responsive images

Efficient database queries

Pagination

Caching architecture

Skeleton loading

Optimistic UI where appropriate

Avoid unnecessary API requests.

66. CORE WEB VITALS

The 3D hero makes performance especially important.

Optimize:

LCP

CLS

INP

The 3D animation must not delay the primary content.

Load the important Hero text first and progressively load the 3D experience.

67. ERROR STATES

Create polished:

Loading state

Empty state

Error state

Unauthorized

Forbidden

Not Found

Offline

Create a custom 404 page.

68. SECURITY

Security is a first-class requirement.

Implement:

Secure authentication

Authorization

RBAC

Server-side validation

Input sanitization

Protected API routes

Database security

Row Level Security where supported

Rate limiting architecture

Secure file access

Secure payment verification

Audit logging

Never expose:

API keys

Service-role keys

Passwords

Secrets

Private credentials

in frontend code.

69. AUDIT LOGS

Track sensitive actions:

Login

User changes

Course changes

Content deletion

Role changes

Payment changes

Exam changes

Admin settings changes

Store:

Actor

Action

Target

Timestamp

Metadata

70. FILE MANAGEMENT

Support secure storage for:

Images

PDFs

Course files

Assignment files

Avatars

Metadata:

Filename

Type

Size

Owner

Path

Created date

Private files must not be publicly accessible without authorization.

71. DATABASE

Use:

Supabase + PostgreSQL

if supported by the project environment.

Create a normalized relational schema.

Core entities:

users

profiles

roles

courses

course_categories

chapters

topics

lessons

lesson_resources

videos

enrollments

lesson_progress

bookmarks

notes

exercises

exams

questions

question_options

exam_attempts

exam_answers

assignments

assignment_submissions

certificates

certificate_verifications

reviews

ratings

orders

order_items

payments

coupons

subscriptions

subscription_plans

notifications

achievements

user_achievements

points

study_sessions

study_plans

support_tickets

messages

articles

article_categories

article_tags

authors

tags

audit_logs

site_settings

Use:

UUID primary keys

Foreign keys

Indexes

Unique constraints

Timestamps

Soft deletion where appropriate

72. DATABASE RELATIONSHIPS

Important relationships:

User → Enrollments

User → Progress

User → Exam Attempts

User → Orders

User → Achievements

Course → Chapters

Chapter → Topics

Topic → Lessons

Lesson → Resources

Exam → Questions

Question → Options

Exam Attempt → Answers

Course → Reviews

Course → Instructor

User → Subscription

Order → Payment

Article → Author

Article → Category

Article → Tags

Article → Related Courses

Article → Related Lessons

Implement these relationships correctly.

73. ADMIN ANALYTICS

Admin analytics should include:

Total users

New users

Active users

Enrollments

Course completion

Average exam scores

Revenue

Popular courses

Popular lessons

Most difficult questions

Popular articles

Article views

Retention

Daily activity

Include filtering by:

Date

Course

Grade

Instructor

74. ADMIN SETTINGS

Settings:

Site name

Logo

Favicon

Contact information

Social links

SEO defaults

Email configuration

Payment configuration

Course settings

Notification settings

Sensitive values must never be exposed to the client.

75. CONTENT MODERATION

Admin can moderate:

Reviews

Comments

Questions

User-generated content

Articles

Actions:

Approve

Reject

Hide

Delete

76. ACCESSIBILITY

Follow modern accessibility principles.

Support:

Keyboard navigation

Screen readers

Accessible labels

Focus states

Semantic HTML

Good color contrast

Alt text

Accessible forms

Accessible dialogs

77. PWA READINESS

Prepare architecture for Progressive Web App support.

Future features:

Installable app

Push notifications

Offline metadata

App-like navigation

Do not implement complex offline video downloads unless explicitly required.

78. FUTURE MOBILE APPLICATION

The backend/API architecture must allow future:

Android app

iOS app

Do not put business logic exclusively inside the web frontend.

79. API ARCHITECTURE

Separate service boundaries for:

Authentication

Users

Courses

Lessons

Progress

Exams

Payments

Notifications

Analytics

AI

Articles

Admin

Use consistent API response and error structures.

80. REUSABLE COMPONENTS

Create reusable components:

Navbar

Footer

Button

Input

Select

Modal

Dialog

Toast

Tabs

Accordion

Dropdown

Card

CourseCard

LessonCard

ExamCard

ArticleCard

ProgressBar

ProgressRing

DashboardCard

DataTable

Pagination

SearchBox

Breadcrumb

VideoPlayer

FileUploader

RichTextEditor

Chart

EmptyState

LoadingState

ErrorState

Avoid duplicated UI logic.

81. DEVELOPER EXPERIENCE

Keep the project easy to maintain.

Use:

Clean folder structure

Consistent naming

Reusable services

Type-safe models

Environment variables

Clear configuration

Minimal necessary comments

Do not over-engineer unnecessarily.

82. GITHUB READINESS

Prepare:

Clean repository structure

README

.env.example

Setup instructions

Database instructions

Deployment instructions

Development instructions

Never commit secrets.

83. ENVIRONMENT VARIABLES

Use environment variables for:

Database

Authentication

AI

Storage

Payments

Email

External APIs

Create:

.env.example

Never hard-code credentials.

84. SEED / DEMO DATA

Create realistic development data.

Courses:

شیمی دهم

شیمی یازدهم

شیمی دوازدهم

شیمی کنکور

Include sample:

Chapters

Topics

Lessons

Exams

Questions

Instructor

Students

Articles

Categories

Use original placeholder educational content.

Do not copy copyrighted educational material.

85. DEMO ACCOUNTS

For development only, if appropriate:

Demo Student

Demo Instructor

Demo Admin

Do not expose production credentials.

86. EMPTY STATES

Every major section must have a useful empty state.

Example:

هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.

CTA:

مشاهده دوره‌ها

87. MOBILE UX

On mobile:

Optional bottom navigation for student dashboard

Curriculum becomes a drawer

Exam navigation is touch-friendly

Dashboard cards stack

Tables become cards

Buttons have comfortable touch targets

Video player is optimized

88. UX PRINCIPLES

The user should always know:

Where they are

What they are learning

What to do next

How much they have progressed

What they should study next

Minimize unnecessary friction.

89. COURSE DISCOVERY

Filters:

Grade

Difficulty

Price

Category

Instructor

Rating

Sorting:

Popular

Newest

Highest rated

Lowest price

Highest price

90. RECOMMENDATION ENGINE

Prepare recommendation architecture.

Recommend:

Courses

Lessons

Exams

Exercises

Articles

Based on:

Grade

Enrollment

Progress

Exam performance

Weak topics

Learning history

91. SMART NOTIFICATIONS

Create useful reminders.

Examples:

"آزمون شما فردا برگزار می‌شود."

"درس بعدی شما آماده است."

"سه روز است مطالعه نکرده‌اید."

"به ۸۰٪ تکمیل دوره رسیدید."

Allow users to control notification preferences.

92. INTERNATIONALIZATION

Persian is the primary language.

However, prepare an i18n architecture for future English support.

Do not deeply hard-code all UI strings into components.

93. FINAL PRODUCT REQUIREMENTS

EduRank must be:

Functional

Responsive

Secure

SEO-friendly

Accessible

Scalable

Maintainable

Database-driven

Role-aware

API-ready

GitHub-ready

Production-oriented

Do not create fake functionality.

Avoid:

Fake dashboards

Fake charts

Fake authentication

Fake progress

Fake database interactions

Non-functional buttons

Static course systems pretending to be real

If a feature depends on an unavailable external service, build the correct architecture and isolate the integration point for future implementation.

94. DEVELOPMENT PHASES

Build the project logically.

Phase 1 — Foundation

Implement:

Design System

Routing

Database

Authentication

Roles

Global Layout

Homepage

3D Hero

Phase 2 — LMS

Implement:

Courses

Categories

Chapters

Topics

Lessons

Resources

Video system

Progress tracking

Bookmarks

Notes

Phase 3 — Exams

Implement:

Question Bank

Questions

Exams

Exam Engine

Results

Analytics

Phase 4 — Dashboards

Implement:

Student Dashboard

Instructor Dashboard

Admin Dashboard

Phase 5 — Articles & SEO

Implement:

Articles

Categories

Tags

Authors

Search

Related content

SEO metadata

Structured data

Sitemap

Internal linking

Phase 6 — Commerce

Implement:

Products/Courses

Orders

Payments

Coupons

Subscriptions

Phase 7 — Advanced Features

Implement:

Gamification

Achievements

Certificates

Notifications

Study Planner

AI Tutor

Recommendations

Phase 8 — Production

Finalize:

Security

Performance

Accessibility

SEO

Error handling

Analytics

Deployment readiness

Do not sacrifice architecture quality for speed.

95. STUDENT EXPERIENCE

A student should be able to:

Visit EduRank

See the 3D Chemistry hero

Explore courses

Select their grade

Register

Enroll in a course

Open the curriculum

Watch a lesson

Resume the lesson later

Complete the lesson

Take exercises

Take exams

Receive results

See strengths and weaknesses

Receive personalized recommendations

Continue learning

Earn achievements

Complete courses

Receive certificates

Track their complete learning journey

96. INSTRUCTOR EXPERIENCE

An instructor should be able to:

Create courses

Create chapters

Create topics

Create lessons

Upload resources

Add videos

Create questions

Create exams

Create assignments

Review student performance

Provide feedback

97. ADMIN EXPERIENCE

An administrator should be able to:

Manage users

Manage instructors

Manage courses

Manage lessons

Manage exams

Manage questions

Manage articles

Manage categories

Manage reviews

Manage payments

Manage subscriptions

Manage coupons

Manage notifications

View analytics

Manage platform settings

View audit logs

98. MOST IMPORTANT INSTRUCTION

Treat EduRank as a real product, not a demo.

Do not simply create beautiful screens.

The system must connect:

UI → Application Logic → API/Services → Database

where appropriate.

Every important user action should have a real data model and proper state management.

The architecture must be ready for thousands of users and large amounts of educational content.

99. DESIGN QUALITY

The final UI should feel comparable to a modern premium EdTech startup.

Use:

Premium typography

Clean spacing

Strong visual hierarchy

Modern cards

Elegant animations

Professional dashboards

High-quality empty states

Excellent mobile UX

Consistent components

Avoid:

Generic templates

Excessive gradients

Excessive glassmorphism

Childish illustrations

Overloaded screens

Unnecessary animations

Inconsistent spacing

Random colors

The Chemistry identity should be visible throughout the platform in a subtle and professional way.

100. FINAL INSTRUCTION TO LOVABLE

Start by creating the complete architecture and design system.

Then build the platform progressively.

Prioritize:

Correctness → Security → Architecture → Scalability → Performance → UX → Visual quality

Do not optimize only for generating a large amount of code.

EduRank must be a serious, scalable Chemistry EdTech platform that can evolve into a major educational product.

Do not build EduRank as a landing page.

Build EduRank as a complete educational technology platform.

The homepage must include a premium, optimized 3D Chemistry experience, while the Articles system must be treated as a major SEO and organic-growth engine.

The final product should be ready for continued development, real users, real educational content, real authentication, real database interactions, and future payment/AI integrations.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b7335988-9f6a-46ac-afe1-56bed041d182).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
