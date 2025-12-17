# Hướng dẫn tích hợp AI nhận diện ảnh

## Hiện trạng

Hiện tại đang dùng **mock AI detection** (simulation) cho development. Để dùng AI thật, bạn có thể tích hợp:

1. **Google Cloud Vision API** (Khuyến nghị)
2. **AWS Rekognition**
3. **Azure Computer Vision**
4. **TensorFlow.js** (Client-side)

## Tích hợp Google Cloud Vision API

### Bước 1: Setup Google Cloud

1. Tạo project trên [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Cloud Vision API**
3. Tạo Service Account và download JSON key
4. Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`

### Bước 2: Add Dependency

Thêm vào `pom.xml`:
```xml
<dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-vision</artifactId>
    <version>3.0.0</version>
</dependency>
```

### Bước 3: Update AIImageRecognitionService

Uncomment và implement method `detectWithGoogleVision()` trong `AIImageRecognitionService.java`:

```java
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
```

### Bước 4: Update detectObject method

```java
public String detectObject(String imageBase64) {
    // Use Google Vision if credentials available
    if (System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null) {
        return detectWithGoogleVision(imageBase64);
    }
    
    // Fallback to mock
    return mockDetection(imageBase64);
}
```

## Tích hợp AWS Rekognition

### Bước 1: Setup AWS

1. Tạo AWS account
2. Tạo IAM user với quyền `rekognition:DetectLabels`
3. Set credentials: `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`

### Bước 2: Add Dependency

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>rekognition</artifactId>
    <version>2.20.0</version>
</dependency>
```

### Bước 3: Implement

```java
private String detectWithAWSRekognition(String imageBase64) {
    try {
        RekognitionClient rekClient = RekognitionClient.builder()
            .region(Region.US_EAST_1)
            .build();
        
        String base64Data = imageBase64.contains(",") 
            ? imageBase64.split(",")[1] 
            : imageBase64;
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);
        
        DetectLabelsRequest request = DetectLabelsRequest.builder()
            .image(Image.builder().bytes(SdkBytes.fromByteArray(imageBytes)).build())
            .maxLabels(10)
            .minConfidence(75F)
            .build();
        
        DetectLabelsResponse response = rekClient.detectLabels(request);
        
        for (Label label : response.labels()) {
            String name = label.name().toLowerCase();
            if (name.contains("water") || name.contains("bottle")) {
                return "water";
            } else if (name.contains("trash") || name.contains("garbage")) {
                return "trash";
            } else if (name.contains("bus") || name.contains("vehicle")) {
                return "bus";
            }
        }
        
        return response.labels().isEmpty() ? null : response.labels().get(0).name();
    } catch (Exception e) {
        log.error("Error with AWS Rekognition", e);
        return null;
    }
}
```

## Chi phí ước tính

### Google Cloud Vision API
- **Free tier**: 1,000 requests/tháng
- **Sau đó**: $1.50 per 1,000 requests
- **Rất chính xác**, dễ tích hợp

### AWS Rekognition
- **Free tier**: 5,000 images/tháng (12 tháng đầu)
- **Sau đó**: $1.00 per 1,000 images
- **Tốt cho AWS ecosystem**

## Test

Sau khi tích hợp, test với:

```bash
curl -X POST http://localhost:8080/api/ai/detect \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

## Lưu ý

1. **Base64 data URLs rất dài** - Cân nhắc upload ảnh lên storage (S3, Cloud Storage) và chỉ gửi URL
2. **Rate limiting** - Implement rate limiting để tránh vượt quota
3. **Error handling** - Luôn có fallback về manual selection
4. **Cost optimization** - Cache results nếu có thể

## Next Steps

1. Chọn AI service phù hợp
2. Setup credentials
3. Uncomment và implement method tương ứng
4. Test với ảnh thật
5. Monitor costs và accuracy
