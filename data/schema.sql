DROP TABLE IF EXISTS joke_tb;
CREATE TABLE joke_tb(
id SERIAL PRIMARY KEY,
type VARCHAR(255),
setup VARCHAR(255),
punchline VARCHAR(255)
);