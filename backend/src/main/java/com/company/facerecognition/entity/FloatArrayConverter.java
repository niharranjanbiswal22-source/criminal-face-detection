package com.company.facerecognition.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Stores a float[] embedding vector as a comma-separated string in a single
 * TEXT column. Kept simple for the MVP; can be swapped for the pgvector
 * extension + native vector type later for indexed similarity search.
 */
@Converter
public class FloatArrayConverter implements AttributeConverter<float[], String> {

    @Override
    public String convertToDatabaseColumn(float[] attribute) {
        if (attribute == null) return null;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < attribute.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(attribute[i]);
        }
        return sb.toString();
    }

    @Override
    public float[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return new float[0];
        String[] parts = dbData.split(",");
        float[] result = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Float.parseFloat(parts[i]);
        }
        return result;
    }
}
