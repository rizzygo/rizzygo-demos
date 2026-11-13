-- Só o texto, a categoria e o dia. Nada de IP, e-mail, navegador ou hora exata:
-- com a hora exata, dá para descobrir quem mandou cruzando com quem estava online.
CREATE TABLE IF NOT EXISTS sugestoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria TEXT NOT NULL,
  texto TEXT NOT NULL,
  dia TEXT NOT NULL DEFAULT (date('now'))
);
