package com.example.app.service;


import com.google.cloud.vision.v1.*;
import com.google.cloud.vision.v1.Image;
import com.google.protobuf.ByteString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.util.*;
import java.util.List;

/**
 * AI Image Recognition Service
 * 
 * This service provides image recognition capabilities.
 * 
 * Options:
 * 1. Google Cloud Vision API (Production - requires API key)
 * 2. AWS Rekognition (Production - requires AWS credentials)
 * 3. TensorFlow.js model (Client-side)
 * 4. Mock/Simulation (Development - current implementation)
 * 
 * For production, integrate with a real AI service.
 */
@Service
@Slf4j
public class AIImageRecognitionService {

    // Common eco-friendly objects to detect
    private static final List<String> ECO_OBJECTS = Arrays.asList(
        "water", "bottle", "reusable bottle", "water bottle",
        "trash", "garbage", "waste", "recycling",
        "bus", "public transport", "vehicle",
        "tree", "plant", "green",
        "bicycle", "bike",
        "solar panel", "renewable energy"
    );

    /**
     * Detect objects in image using AI
     * 
     * @param imageBase64 Base64 encoded image data
     * @return Detected object name (e.g., "water", "trash", "bus")
     */
    public String detectObject(String imageBase64) {
        // Use Google Vision if credentials available
        if (System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null) {
            return detectWithGoogleVision(imageBase64);
        }

        // Fallback to mock
        return mockDetection(imageBase64);
    }

    /**
     * Mock detection for development
     * In production, replace with real AI service
     */
    private String mockDetection(String imageBase64) {
        log.info("Mock AI detection - image size: {} bytes", imageBase64.length());
        
        // Simulate AI processing delay
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Simple heuristic: check image size and return random eco object
        Random random = new Random();
        String[] commonObjects = {"water", "trash", "bus"};
        String detected = commonObjects[random.nextInt(commonObjects.length)];
        
        log.info("Mock detection result: {}", detected);
        return detected;
    }

    /**
     * Detect using Google Cloud Vision API
     * Uncomment and configure when ready to use
     */

    private String detectWithGoogleVision(String imageBase64) {
        try {
            // Remove data URL prefix
            String base64Data = imageBase64.contains(",")
                    ? imageBase64.split(",")[1]
                    : imageBase64;

            byte[] imageBytes = Base64.getDecoder().decode(base64Data);

            // Initialize Vision client
            try (ImageAnnotatorClient vision = ImageAnnotatorClient.create()) {
                // Build the image
                ByteString imgBytes = ByteString.copyFrom(imageBytes);
                Image img = Image.newBuilder().setContent(imgBytes).build();

                // Detect labels
                Feature feat = Feature.newBuilder().setType(Feature.Type.LABEL_DETECTION).build();
                AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                        .addFeatures(feat)
                        .setImage(img)
                        .build();

                BatchAnnotateImagesResponse response = vision.batchAnnotateImages(
                        Collections.singletonList(request));

                List<EntityAnnotation> labels = response.getResponses(0).getLabelAnnotationsList();

                // Find eco-friendly objects
                for (EntityAnnotation label : labels) {
                    String description = label.getDescription().toLowerCase();
                    if (description.contains("water") || description.contains("bottle")) {
                        return "water";
                    } else if (description.contains("trash") || description.contains("garbage")) {
                        return "trash";
                    } else if (description.contains("bus") || description.contains("vehicle")) {
                        return "bus";
                    }
                }

                // Return first label if no match
                return labels.isEmpty() ? null : labels.get(0).getDescription();
            }
        } catch (Exception e) {
            log.error("Error with Google Vision API", e);
            return null;
        }
    }


    /**
     * Map detected object to our standard format
     */
    public String normalizeDetectedObject(String detected) {
        if (detected == null) return null;
        
        String lower = detected.toLowerCase();
        
        // Map various detections to standard format
        if (lower.contains("water") || lower.contains("bottle")) {
            return "water";
        } else if (lower.contains("trash") || lower.contains("garbage") || lower.contains("waste")) {
            return "trash";
        } else if (lower.contains("bus") || lower.contains("vehicle") || lower.contains("transport")) {
            return "bus";
        } else if (lower.contains("tree") || lower.contains("plant")) {
            return "plant";
        } else if (lower.contains("bike") || lower.contains("bicycle")) {
            return "bike";
        }
        
        return detected;
    }
}
