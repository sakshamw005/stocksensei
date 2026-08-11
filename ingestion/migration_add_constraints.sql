-- Run this once in the Supabase SQL editor against your existing project.
-- Needed so the ingestion job's upsert(on_conflict="ticker,as_of") works correctly.

alter table fundamentals
  add constraint fundamentals_ticker_as_of_unique unique (ticker, as_of);

alter table news_sentiment
  add constraint news_sentiment_ticker_as_of_unique unique (ticker, as_of);
