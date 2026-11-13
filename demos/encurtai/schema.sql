-- Tabelas do Encurtaí no D1. O KV guarda só slug -> URL (para o redirect ser rápido).
-- O D1 guarda a lista do painel e os cliques, porque o KV aceita só mil gravações por dia no plano Free.
CREATE TABLE IF NOT EXISTS links (
  slug TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS cliques (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS cliques_por_slug ON cliques (slug);
