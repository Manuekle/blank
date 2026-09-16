type Token = { text: string; cls?: string };

/**
 * Tiny syntax highlighter for the template code views. Line-based
 * tokenizers tuned to look like Monaco's dark theme — good enough
 * for snippets, zero dependencies.
 */

function pushToken(tokens: Token[], text: string, cls?: string) {
  if (!text) return;
  tokens.push({ text, cls });
}

function tokenizeValue(value: string, tokens: Token[]) {
  const re = /("[^"]*"|'[^']*')|(#[0-9a-fA-F]{3,8}\b)|(\b\d+(?:\.\d+)?(?:px|rem|em|%|ms|s|deg|vh|vw|fr)?\b)|(\b(?:var|calc|inherit|initial|unset|none|auto|transparent|currentColor|solid|dashed|flex|grid|block|inline|hidden|visible|pointer|center|left|right|top|bottom|bold|normal|italic)\b)|([,;]+)|(\s+)|([^])/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value))) {
    const [, str, hex, num, kw, punc, space, rest] = match;
    if (str) pushToken(tokens, str, "m-str");
    else if (hex || num) pushToken(tokens, hex ?? num!, "m-num");
    else if (kw) pushToken(tokens, kw, "m-key");
    else if (punc) pushToken(tokens, punc, "m-punc");
    else if (space) pushToken(tokens, space);
    else pushToken(tokens, rest);
  }
}

function tokenizeCss(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split("\n");
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("/*")) {
      pushToken(tokens, line, "m-com");
    } else if (trimmed.startsWith("@")) {
      const match = /^(\s*)(@[a-z-]+)(.*)$/.exec(line);
      if (match) {
        pushToken(tokens, match[1]);
        pushToken(tokens, match[2], "m-at");
        pushToken(tokens, match[3]);
      } else pushToken(tokens, line);
    } else {
      const propMatch = /^(\s*)([a-z-]+)(\s*:)(.*)$/.exec(line);
      const propEnd = propMatch ? propMatch[3].length + propMatch[1].length + propMatch[2].length : -1;
      const braceAt = trimmed.endsWith("{") || /^[.&#\[]/.test(trimmed) || /,\s*$/.test(line.trimEnd());
      if (propMatch && !braceAt) {
        pushToken(tokens, propMatch[1]);
        pushToken(tokens, propMatch[2], "m-prop");
        pushToken(tokens, propMatch[3], "m-punc");
        tokenizeValue(propMatch[4], tokens);
      } else if (line.includes("{") && !line.includes(":")) {
        const at = line.indexOf("{");
        pushToken(tokens, line.slice(0, at), "m-sel");
        pushToken(tokens, line.slice(at));
      } else {
        tokenizeValue(line, tokens);
      }
    }
    if (index < lines.length - 1) pushToken(tokens, "\n");
  });
  return tokens;
}

function tokenizeTag(tag: string, tokens: Token[]) {
  const nameMatch = /^(<\/?)([a-zA-Z][\w-]*)/.exec(tag);
  let rest = tag;
  if (nameMatch) {
    pushToken(tokens, nameMatch[1], "m-punc");
    pushToken(tokens, nameMatch[2], "m-tag");
    rest = tag.slice(nameMatch[0].length);
  }
  const attrRe = /([\w-]+)(=)("[^"]*"|'[^']*'|[^\s>]+)?|\s+|(>|\/?>)/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(rest))) {
    const [, attr, eq, value, space, close] = match;
    if (attr) {
      pushToken(tokens, attr, "m-attr");
      if (eq) {
        pushToken(tokens, eq, "m-punc");
        if (value) pushToken(tokens, value, "m-str");
      }
    } else if (space) pushToken(tokens, space);
    else if (close) pushToken(tokens, close, "m-punc");
  }
}

function tokenizeMarkup(code: string): Token[] {
  const tokens: Token[] = [];
  const re = /(<\/?[a-zA-Z][^>]*>)|(<!--[\s\S]*?-->)|(\{[^{}]*\})|([^<{]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code))) {
    const [, tag, comment, expr, text] = match;
    if (comment) pushToken(tokens, comment, "m-com");
    else if (tag) tokenizeTag(tag, tokens);
    else if (expr) tokenizeExpr(expr, tokens);
    else pushToken(tokens, text);
  }
  return tokens;
}

function tokenizeExpr(expr: string, tokens: Token[]) {
  pushToken(tokens, "{", "m-punc");
  const re = /("[^"]*"|'[^']*')|(\b(?:return|export|function|const|import|from|className|type|as)\b)|(\b\d+(?:\.\d+)?\b)|([\s\S])/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(expr.slice(1, -1)))) {
    const [, str, kw, num, rest] = match;
    if (str) pushToken(tokens, str, "m-str");
    else if (kw) pushToken(tokens, kw, "m-key");
    else if (num) pushToken(tokens, num, "m-num");
    else pushToken(tokens, rest);
  }
  pushToken(tokens, "}", "m-punc");
}

export type HighlightLang = "html" | "css" | "react";

export function highlight(lang: HighlightLang, code: string): Token[] {
  if (lang === "css") return tokenizeCss(code);
  return tokenizeMarkup(code);
}

export function CodeHighlight({ lang, code }: { lang: HighlightLang; code: string }) {
  const tokens = highlight(lang, code);
  return (
    <>
      {tokens.map((token, index) => (
        <span key={index} className={token.cls}>
          {token.text}
        </span>
      ))}
    </>
  );
}
