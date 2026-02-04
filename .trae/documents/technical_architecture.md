# Technical Architecture Document

## 1. Tech Stack

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios / Fetch

### Backend (BFF)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Purpose**: Handle AI API requests, complex aggregations, and serve the frontend.

### Infrastructure & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)
- **AI Service**: Integration via Express backend (OpenAI/Gemini/Mock).

## 2. Database Schema (Supabase)
Existing Tables:
- `users`: User profiles.
- `babies`: Baby profiles linked to users.
- `ingredients`: Pantry management.
- `recipes`: Recipe content.
- `user_favorites`: User-Recipe relations.
- `preferences`: Dietary preferences.
- `allergies`: Allergy records.

## 3. API Structure
- `/api/auth/*`: Handled by Supabase Client.
- `/api/ai/*`: Express endpoints for AI features.
  - POST `/api/ai/analyze-cry`
  - POST `/api/ai/analyze-poop`
  - POST `/api/ai/generate-recipe`
- `/api/db/*`: Direct Supabase queries via Client (with RLS).

## 4. Security
- **RLS**: Row Level Security enabled on Supabase tables.
- **Environment Variables**: API keys stored in `.env`.
