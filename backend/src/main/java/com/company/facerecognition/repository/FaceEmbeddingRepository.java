package com.company.facerecognition.repository;

import com.company.facerecognition.entity.FaceEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaceEmbeddingRepository extends JpaRepository<FaceEmbedding, Long> {

    /**
     * MVP approach: fetch all embeddings into memory and compare with cosine
     * similarity in the service layer. Fine for a few thousand persons.
     * For larger datasets, migrate to the pgvector extension and push the
     * similarity search down into SQL with an ANN index (ivfflat/hnsw).
     */
    List<FaceEmbedding> findAll();
}
