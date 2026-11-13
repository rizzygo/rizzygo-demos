-- Cada teste vira uma linha. A cada 5 minutos são 288 linhas por site por dia,
-- bem longe das 100 mil gravações por dia do D1 no plano Free.
CREATE TABLE IF NOT EXISTS testes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  em TEXT NOT NULL DEFAULT (datetime('now')),
  status INTEGER,          -- código HTTP, ou NULL se nem respondeu
  ms INTEGER,              -- tempo de resposta
  no_ar INTEGER NOT NULL   -- 1 = respondeu com 2xx ou 3xx
);
CREATE INDEX IF NOT EXISTS testes_site_em ON testes (site, em);
-- Índice por data: a página e a limpeza filtram só por "em". Sem ele, o D1 leria a tabela inteira (e contaria cada linha lida).
CREATE INDEX IF NOT EXISTS testes_em ON testes (em);
