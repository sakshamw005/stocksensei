"""
FinBERT (ProsusAI/finbert) — pretrained, financial-domain sentiment model.
No training involved: this loads pretrained weights and runs inference only.
"""

from transformers import pipeline

_finbert = None


def _get_pipeline():
    global _finbert
    if _finbert is None:
        _finbert = pipeline("sentiment-analysis", model="ProsusAI/finbert")
    return _finbert


def score_headlines(headlines: list[dict]) -> dict:
    """Scores each headline, then aggregates by distribution rather than a
    blind average — five positive and five negative headlines should read
    as 'mixed', not cancel out into a falsely calm 'neutral'."""
    titles = [h["title"] for h in headlines if h.get("title")]
    if not titles:
        return {"sentiment_label": None, "article_count": 0, "top_headlines": None}

    pipe = _get_pipeline()
    results = pipe(titles, truncation=True)

    counts = {"positive": 0, "negative": 0, "neutral": 0}
    for r in results:
        counts[r["label"]] += 1

    total = len(results)
    pos_share = counts["positive"] / total
    neg_share = counts["negative"] / total

    if pos_share >= 0.6:
        label = "positive"
    elif neg_share >= 0.6:
        label = "negative"
    elif pos_share > 0.25 and neg_share > 0.25:
        label = "mixed"
    else:
        label = "neutral"

    top_headlines = " | ".join(titles[:3])

    return {
        "sentiment_label": label,
        "article_count": total,
        "top_headlines": top_headlines,
    }
