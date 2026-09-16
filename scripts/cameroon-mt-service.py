"""
Local serving for flagship-ai/cameroon-int8 (CTranslate2 int8) — Hugging Face only.

Official bundle: French-pivot MarianMT (~60 Cameroonian languages, 119 pair folders).
https://huggingface.co/flagship-ai/cameroon-int8

Install:
  pip install -r scripts/requirements-cameroon-mt.txt

Run:
  python scripts/cameroon-mt-service.py

Env:
  CAMEROON_MT_REPO=flagship-ai/cameroon-int8
  CAMEROON_MT_HOST=127.0.0.1
  CAMEROON_MT_PORT=8091
  CAMEROON_MT_DEVICE=cpu          # or cuda
  HUGGINGFACE_API_KEY / HF_TOKEN  # Hub download auth

Then in .env.local:
  CAMEROON_MT_URL=http://127.0.0.1:8091
"""

from __future__ import annotations

import os
import re
from functools import lru_cache
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

REPO = os.environ.get("CAMEROON_MT_REPO", "flagship-ai/cameroon-int8")
HOST = os.environ.get("CAMEROON_MT_HOST", "127.0.0.1")
PORT = int(os.environ.get("CAMEROON_MT_PORT", "8091"))
DEVICE = os.environ.get("CAMEROON_MT_DEVICE", "cpu").strip() or "cpu"
CACHE_SIZE = int(os.environ.get("CAMEROON_MT_CACHE", "12"))
WARM_PAIRS = [
    p.strip()
    for p in os.environ.get(
        "CAMEROON_MT_WARM",
        "francais-yemba,yemba-francais,francais-ewondo,francais-ghomala,francais-fufulde",
    ).split(",")
    if p.strip()
]
RESULT_CACHE: dict[tuple[str, str], str] = {}
LOADED_PAIRS: set[str] = set()

_hf = (
    os.environ.get("HF_TOKEN")
    or os.environ.get("HUGGINGFACE_HUB_TOKEN")
    or os.environ.get("HUGGINGFACE_API_KEY")
    or ""
).strip()
if _hf and not os.environ.get("HF_TOKEN"):
    os.environ["HF_TOKEN"] = _hf

PAIR_RE = re.compile(r"^[a-z0-9]+-[a-z0-9]+$")

app = FastAPI(
    title="Visit Cameroon MT",
    version="1.2",
    description="Hugging Face flagship-ai/cameroon-int8 (CTranslate2 int8, French-pivot).",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranslateIn(BaseModel):
    text: str
    pair: Optional[str] = Field(
        default=None,
        description="e.g. francais-ewondo or ewondo-francais",
    )
    source: Optional[str] = Field(default=None)
    target: Optional[str] = Field(default=None)


class TranslateOut(BaseModel):
    translation: str
    pair: str
    model: str
    via: Optional[str] = "cameroon-int8"


KNOWN_LANGS = (
    "aghem", "awing", "babanki", "bafia", "bakoko", "bakweri", "bidwee", "bulu",
    "bum", "cuvok", "denya", "dii", "doyayo", "ejagham", "english", "esimbi",
    "ewondo", "fufulde", "gbaya", "ghomala", "guidar", "guiziga", "isu",
    "kapsiki", "kenyang", "koonzime", "lamnso", "limbum", "mankon", "massana",
    "mbembe", "medumba", "meta", "mmen", "mofa", "mofu", "moghamo", "mpumpong",
    "mundani", "ngi", "ngienboum", "ngomba", "ngombale", "ngwo", "nomaande",
    "nugunu", "oku", "pana", "peere", "pinyin", "punu", "samba", "tunen",
    "tupuri", "vute", "weh", "yambeta", "yemba",
)


def known_pairs() -> list[str]:
    pairs: list[str] = []
    for lang in KNOWN_LANGS:
        pairs.append(f"francais-{lang}")
        pairs.append(f"{lang}-francais")
    return pairs


@lru_cache(maxsize=1)
def list_pairs() -> tuple[str, ...]:
    return tuple(known_pairs())


@lru_cache(maxsize=CACHE_SIZE)
def load_pair(pair: str):
    from huggingface_hub import snapshot_download
    import ctranslate2

    try:
        from transformers import MarianTokenizer
    except Exception:
        try:
            from transformers.models.marian.tokenization_marian import (  # type: ignore
                MarianTokenizer,
            )
        except Exception:
            from transformers import AutoTokenizer as MarianTokenizer  # type: ignore

    if not PAIR_RE.match(pair):
        raise ValueError(f"invalid pair name: {pair}")

    local_dir = snapshot_download(
        repo_id=REPO,
        allow_patterns=[f"{pair}/*"],
        max_workers=1,
    )
    model_path = os.path.join(local_dir, pair)
    if not os.path.isdir(model_path):
        raise FileNotFoundError(pair)

    tokenizer = MarianTokenizer.from_pretrained(model_path)
    translator = ctranslate2.Translator(model_path, device=DEVICE)
    LOADED_PAIRS.add(pair)
    return tokenizer, translator


def clean_mt_output(text: str, *, max_chars: int = 120) -> str:
    """Trim Marian/CTranslate2 loops that often appear on short tourist phrases."""
    out = (text or "").strip()
    if not out:
        return out

    for sep in (". ", "? ", "! ", "» "):
        if sep in out:
            head, tail = out.split(sep, 1)
            if len(head) >= 3 and (
                head[:12] in tail or tail.count(head[:8]) >= 2
            ):
                out = head + sep.strip()
                break

    parts = [p.strip() for p in re.split(r"[,;]", out) if p.strip()]
    if len(parts) >= 3:
        uniq: list[str] = []
        for p in parts:
            if not uniq or p != uniq[-1]:
                if uniq and (
                    p.startswith(uniq[0][:10]) or uniq[0].startswith(p[:10])
                ):
                    continue
                uniq.append(p)
            if len(uniq) >= 2:
                break
        if uniq:
            out = ", ".join(uniq)

    tokens = out.split()
    if len(tokens) >= 8:
        for n in (4, 3, 2):
            changed = True
            while changed and len(tokens) >= n * 3:
                changed = False
                gram = tokens[-n:]
                if tokens[-2 * n : -n] == gram:
                    tokens = tokens[:-n]
                    changed = True
            if len(tokens) < 8:
                break
        out = " ".join(tokens)

    # Drop a trailing truncated token (often 1–2 chars after cleanup)
    toks = out.split()
    if len(toks) >= 2 and len(toks[-1]) <= 2 and not toks[-1].endswith(("?", "!", ".")):
        toks = toks[:-1]
        out = " ".join(toks)

    if len(out) > max_chars:
        cut = out[:max_chars]
        sp = cut.rfind(" ")
        out = (cut[:sp] if sp > 24 else cut).rstrip(",; ")
    return out.strip(" ,;")


def translate_pair(text: str, pair: str) -> str:
    cache_key = (pair, text)
    hit = RESULT_CACHE.get(cache_key)
    if hit is not None:
        return hit

    tokenizer, translator = load_pair(pair)
    source = tokenizer.convert_ids_to_tokens(tokenizer.encode(text))
    # Short tourist phrases: cap length + block n-gram loops
    max_len = min(64, max(16, len(source) * 3 + 8))
    results = translator.translate_batch(
        [source],
        beam_size=2,
        repetition_penalty=1.35,
        no_repeat_ngram_size=3,
        max_decoding_length=max_len,
        length_penalty=0.8,
    )
    target = results[0].hypotheses[0]
    raw = tokenizer.decode(
        tokenizer.convert_tokens_to_ids(target),
        skip_special_tokens=True,
    ).strip()
    out = clean_mt_output(raw)
    if len(RESULT_CACHE) > 500:
        RESULT_CACHE.clear()
    RESULT_CACHE[cache_key] = out
    return out


def warm_pairs_background() -> None:
    import threading

    def _run() -> None:
        for pair in WARM_PAIRS:
            try:
                print(f"[cameroon-mt] warming {pair}…")
                load_pair(pair)
                print(f"[cameroon-mt] ready {pair}")
            except Exception as e:
                print(f"[cameroon-mt] warm failed {pair}: {e}")

    threading.Thread(target=_run, daemon=True, name="mt-warm").start()


@app.on_event("startup")
def on_startup() -> None:
    warm_pairs_background()


@app.get("/health")
def health():
    return {
        "ok": True,
        "provider": "huggingface",
        "repo": REPO,
        "device": DEVICE,
        "pairs": len(known_pairs()),
        "loaded": sorted(LOADED_PAIRS),
        "license": "CC BY-NC 4.0",
    }


@app.get("/pairs")
def pairs():
    return {"repo": REPO, "pairs": list(list_pairs())}


@app.post("/translate", response_model=TranslateOut)
def translate(body: TranslateIn):
    text = (body.text or "").strip()
    if not text:
        raise HTTPException(400, "text required")

    pair = (body.pair or "").strip()
    src = (body.source or "").strip().lower()
    tgt = (body.target or "").strip().lower()

    if src and tgt and src != "francais" and tgt != "francais" and src != tgt:
        try:
            fr = translate_pair(text, f"{src}-francais")
            out = translate_pair(fr, f"francais-{tgt}")
            return TranslateOut(
                translation=out,
                pair=f"{src}-francais-francais-{tgt}",
                model=REPO,
                via="french-pivot",
            )
        except Exception as e:
            raise HTTPException(404, f"pivot failed ({src}→fr→{tgt}): {e}") from e

    if not pair and src and tgt:
        if src == "francais":
            pair = f"francais-{tgt}"
        elif tgt == "francais":
            pair = f"{src}-francais"
        else:
            raise HTTPException(400, "use source+target for local↔local")

    if not pair:
        raise HTTPException(400, "pair or source+target required")
    if not PAIR_RE.match(pair):
        raise HTTPException(400, f"invalid pair: {pair}")

    try:
        output = translate_pair(text, pair)
    except Exception as e:
        raise HTTPException(404, f"pair not available: {pair} ({e})") from e

    return TranslateOut(
        translation=output,
        pair=pair,
        model=REPO,
        via="cameroon-int8",
    )


if __name__ == "__main__":
    import uvicorn

    print(f"[cameroon-mt] Hugging Face {REPO} device={DEVICE} http://{HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)
