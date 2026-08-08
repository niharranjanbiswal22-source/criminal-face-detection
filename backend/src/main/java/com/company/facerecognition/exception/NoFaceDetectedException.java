package com.company.facerecognition.exception;

/** Thrown when OpenCV cannot detect any face in the uploaded image. */
public class NoFaceDetectedException extends RuntimeException {
    public NoFaceDetectedException(String message) {
        super(message);
    }
}
