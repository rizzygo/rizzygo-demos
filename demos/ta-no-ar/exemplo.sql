-- DADOS DE EXEMPLO para ver a página cheia sem esperar 24 horas.
-- Gera 288 testes (24 h, de 5 em 5 min) para cada site da configuração padrão.
-- Os números são inventados. Apague com: DELETE FROM testes;
DELETE FROM testes;
WITH RECURSIVE n(i) AS (SELECT 0 UNION ALL SELECT i + 1 FROM n WHERE i < 287)
INSERT INTO testes (site, em, status, ms, no_ar)
SELECT s.site,
       datetime('now', printf('-%d minutes', i * 5)),
       CASE WHEN s.site = 'https://example.com' AND i BETWEEN 40 AND 45 THEN 503 ELSE 200 END,
       s.base + abs(random() % 120),
       CASE WHEN s.site = 'https://example.com' AND i BETWEEN 40 AND 45 THEN 0 ELSE 1 END
FROM n, (SELECT 'https://rizzygo.com.br' AS site, 90 AS base
         UNION ALL SELECT 'https://ako.rizzygo.com.br', 110
         UNION ALL SELECT 'https://example.com', 160) AS s;
