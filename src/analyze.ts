export interface MarkerParseOptions {
  prefix: string;
  suffix?: string;
  maxTokens: number;
  stripMarkers: boolean;
}

export interface MarkerParseResult {
  words: string[];
  cleanedSentence: string;
}

function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function trimEdgePunctuation(value: string): string {
  // Remove leading/trailing common punctuation while keeping inner hyphen/apostrophe
  return value.replace(/^[\s.,;:!?"'()\[\]{}<>]+|[\s.,;:!?"'()\[\]{}<>]+$/g, "");
}

function countTokens(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function parseMarkedInput(
  text: string,
  options: MarkerParseOptions
): MarkerParseResult {
  const { prefix, suffix = "", maxTokens, stripMarkers } = options;

  const escapedPrefix = escapeRegexLiteral(prefix);
  const escapedSuffix = escapeRegexLiteral(suffix);

  const words: string[] = [];
  const seen = new Set<string>();

  if (suffix) {
    // Phrase mode: >> ... <<
    const phrasePattern = new RegExp(
      `${escapedPrefix}\\s*([\\s\\S]+?)\\s*${escapedSuffix}`,
      "g"
    );
    let match: RegExpExecArray | null;
    while ((match = phrasePattern.exec(text)) !== null) {
      const raw = match[1];
      const cleaned = trimEdgePunctuation(raw);
      if (!cleaned) continue;
      if (countTokens(cleaned) > maxTokens) continue;
      const key = cleaned.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        words.push(cleaned);
      }
    }
  } else {
    // Word mode: >>word
    const wordPattern = new RegExp(`${escapedPrefix}\\s*(\\S+)`, "g");
    let match: RegExpExecArray | null;
    while ((match = wordPattern.exec(text)) !== null) {
      const raw = match[1];
      const cleaned = trimEdgePunctuation(raw);
      if (!cleaned) continue;
      if (countTokens(cleaned) > maxTokens) continue;
      const key = cleaned.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        words.push(cleaned);
      }
    }
  }

  let cleanedSentence = text;
  if (stripMarkers) {
    if (suffix) {
      const replacePattern = new RegExp(
        `${escapedPrefix}\\s*([\\s\\S]+?)\\s*${escapedSuffix}`,
        "g"
      );
      cleanedSentence = cleanedSentence.replace(replacePattern, (_m, p1) => p1);
    } else {
      const removePrefixPattern = new RegExp(`${escapedPrefix}\\s*`, "g");
      cleanedSentence = cleanedSentence.replace(removePrefixPattern, "");
    }
  }

  cleanedSentence = normalizeWhitespace(cleanedSentence);

  return { words, cleanedSentence };
}
