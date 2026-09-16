"""
Précharge les paires Hugging Face Yemba (flagship-ai/cameroon-int8).

  python scripts/preload-yemba.py
"""

from __future__ import annotations

import os
import sys

from huggingface_hub import snapshot_download

REPO = os.environ.get("CAMEROON_MT_REPO", "flagship-ai/cameroon-int8")
PAIRS = ("francais-yemba", "yemba-francais")


def main() -> None:
    token = (
        os.environ.get("HF_TOKEN")
        or os.environ.get("HUGGINGFACE_API_KEY")
        or ""
    ).strip()
    if token and not os.environ.get("HF_TOKEN"):
        os.environ["HF_TOKEN"] = token

    for pair in PAIRS:
        print(f"[yemba] download {REPO}/{pair} …")
        path = snapshot_download(
            repo_id=REPO,
            allow_patterns=[f"{pair}/*"],
            max_workers=2,
        )
        full = os.path.join(path, pair)
        ok = os.path.isdir(full)
        print(f"[yemba] {'OK' if ok else 'FAIL'} → {full}")
        if not ok:
            sys.exit(1)

    # Smoke load into CTranslate2
    import ctranslate2
    from transformers import MarianTokenizer

    for pair in PAIRS:
        local = snapshot_download(repo_id=REPO, allow_patterns=[f"{pair}/*"])
        model_path = os.path.join(local, pair)
        tok = MarianTokenizer.from_pretrained(model_path)
        tr = ctranslate2.Translator(model_path, device="cpu")
        src = tok.convert_ids_to_tokens(tok.encode("Bonjour"))
        hyp = tr.translate_batch(
            [src],
            beam_size=2,
            repetition_penalty=1.35,
            no_repeat_ngram_size=3,
            max_decoding_length=32,
        )[0].hypotheses[0]
        out = tok.decode(tok.convert_tokens_to_ids(hyp), skip_special_tokens=True)
        print(f"[yemba] smoke {pair}: Bonjour → {out.strip()[:80]}")

    print("[yemba] ready — lancez: npm run mt:cameroon")


if __name__ == "__main__":
    main()
