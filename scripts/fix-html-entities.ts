/**
 * Decode leftover HTML entities in Ayila-enriched place descriptions.
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&eacute;/gi, "é")
    .replace(/&egrave;/gi, "è")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&agrave;/gi, "à")
    .replace(/&acirc;/gi, "â")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&ucirc;/gi, "û")
    .replace(/&ugrave;/gi, "ù")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&iuml;/gi, "ï")
    .replace(/&icirc;/gi, "î")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '"')
    .replace(/&mdash;/gi, "–")
    .replace(/&ndash;/gi, "–")
    .replace(/&hellip;/gi, "…")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\s*Découvrez d['']autres coins[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const { data, error } = await supabase
    .from("places")
    .select("id,description_fr,description_en,cultural_info_fr,cultural_info_en")
    .or(
      "description_fr.ilike.%&%;description_en.ilike.%&%;cultural_info_fr.ilike.%&%",
    );
  if (error) throw error;
  let n = 0;
  for (const p of data || []) {
    const patch = {
      description_fr: decodeEntities(p.description_fr || ""),
      description_en: decodeEntities(p.description_en || ""),
      cultural_info_fr: decodeEntities(p.cultural_info_fr || ""),
      cultural_info_en: decodeEntities(p.cultural_info_en || ""),
    };
    if (
      patch.description_fr === p.description_fr &&
      patch.description_en === p.description_en &&
      patch.cultural_info_fr === p.cultural_info_fr
    ) {
      continue;
    }
    const { error: uerr } = await supabase.from("places").update(patch).eq("id", p.id);
    if (uerr) console.error(uerr.message);
    else n++;
  }
  console.log("decoded", n, "of", data?.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
