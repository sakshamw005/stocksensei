const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { runSql, restUpsert } from '../../shared/supabase.ts';
import { LESSONS } from '../../shared/lessons.ts';

const DDL = `
CREATE TABLE IF NOT EXISTS companies (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticker text UNIQUE,
  name text,
  exchange text,
  tier int,
  sector text,
  sector_trend text,
  current_price numeric,
  as_of timestamptz,
  created_date timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS fundamentals (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticker text,
  price numeric,
  market_cap numeric,
  face_value numeric,
  book_value numeric,
  eps numeric,
  pe_ratio numeric,
  industry_pe numeric,
  pb_ratio numeric,
  ebitda numeric,
  profit_growth_yoy numeric,
  revenue_growth_qoq numeric,
  debt_to_equity numeric,
  roe numeric,
  dividend_yield numeric,
  free_cash_flow numeric,
  as_of timestamptz
);
CREATE TABLE IF NOT EXISTS news_sentiment (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticker text,
  category text,
  score numeric,
  label text,
  summary text,
  top_headlines text,
  article_count int,
  as_of timestamptz
);
CREATE TABLE IF NOT EXISTS etfs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticker text UNIQUE,
  name text,
  category text,
  tracked_index text,
  expense_ratio numeric,
  tracking_error numeric,
  aum numeric,
  return_1y numeric,
  index_return_1y numeric,
  as_of timestamptz
);
CREATE TABLE IF NOT EXISTS ipos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_name text,
  ticker text,
  price_band_low numeric,
  price_band_high numeric,
  subscription_multiple numeric,
  revenue_y0 numeric,
  revenue_y1 numeric,
  revenue_y2 numeric,
  margin_y0 numeric,
  margin_y1 numeric,
  margin_y2 numeric,
  gmp_current numeric,
  open_date date,
  as_of timestamptz
);
CREATE TABLE IF NOT EXISTS gmp_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ipo_id bigint,
  date date,
  premium numeric
);
CREATE TABLE IF NOT EXISTS lessons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text UNIQUE,
  title text,
  explanation text,
  challenge_type text,
  question text,
  options jsonb,
  answer text,
  context text
);
CREATE TABLE IF NOT EXISTS user_progress (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid,
  lesson_id text,
  correct boolean,
  answered_at timestamptz DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY,
  xp int DEFAULT 0,
  streak int DEFAULT 0,
  last_active_date date
);
`;

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    await runSql(db, DDL, true);

    const seed = LESSONS.map((l) => ({
      slug: l.slug,
      title: l.title,
      explanation: l.explanation,
      challenge_type: l.challenge_type,
      question: l.question,
      options: l.options,
      answer: l.answer,
      context: l.context
    }));
    await restUpsert(db, 'lessons', seed);

    return Response.json({ ok: true, tables: 9, lessons_seeded: seed.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
