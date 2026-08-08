-- =====================================================================
-- Reference PostgreSQL schema for the Face Recognition Surveillance System
-- NOTE: Hibernate (ddl-auto: update) creates/updates this schema
-- automatically on startup. This file is kept for documentation and for
-- manual setup / review in production, where ddl-auto should typically
-- be set to "validate" or "none" instead of "update".
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'OFFICER'))
);

CREATE TABLE IF NOT EXISTS persons (
    id           BIGSERIAL PRIMARY KEY,
    person_code  VARCHAR(50)  NOT NULL UNIQUE,
    full_name    VARCHAR(150) NOT NULL,
    image_path   VARCHAR(500) NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS face_embeddings (
    id                BIGSERIAL PRIMARY KEY,
    person_id         BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    embedding_vector  TEXT   NOT NULL, -- comma-separated float32 values (512-d)
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_face_embeddings_person_id ON face_embeddings(person_id);

-- Future upgrade path: install the pgvector extension and change
-- embedding_vector to `vector(512)` with an ivfflat/hnsw index for
-- fast approximate nearest-neighbor search at scale:
--   CREATE EXTENSION IF NOT EXISTS vector;
--   ALTER TABLE face_embeddings ALTER COLUMN embedding_vector TYPE vector(512) USING ...;
--   CREATE INDEX ON face_embeddings USING ivfflat (embedding_vector vector_cosine_ops);
