package com.example.demo.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.base-url}")
    private String baseUrl;

    /**
     * 파일 업로드
     */
    public String uploadFile(MultipartFile file, String folderPath) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어있습니다.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = generateUniqueFilename(fileExtension);
            String fullPath = folderPath + "/" + uniqueFilename;

            log.info("S3 파일 업로드 시작 - 버킷: {}, 경로: {}", bucketName, fullPath);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fullPath)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            String fileUrl = baseUrl + "/" + fullPath;
            log.info("S3 파일 업로드 성공 - URL: {}", fileUrl);

            return fileUrl;

        } catch (IOException e) {
            log.error("파일 업로드 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        } catch (Exception e) {
            log.error("S3 업로드 중 예상치 못한 오류: {}", e.getMessage(), e);
            throw new RuntimeException("S3 업로드에 실패했습니다.", e);
        }
    }

    /**
     * 파일 다운로드
     */
    public byte[] downloadFile(String fileKey) {
        try {
            log.info("S3 파일 다운로드 시작 - 버킷: {}, 키: {}", bucketName, fileKey);

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            ResponseBytes<GetObjectResponse> responseBytes = s3Client.getObjectAsBytes(getObjectRequest);
            
            log.info("S3 파일 다운로드 성공 - 크기: {} bytes", responseBytes.asByteArray().length);
            return responseBytes.asByteArray();

        } catch (NoSuchKeyException e) {
            log.error("파일을 찾을 수 없습니다: {}", fileKey);
            throw new RuntimeException("파일을 찾을 수 없습니다: " + fileKey, e);
        } catch (Exception e) {
            log.error("파일 다운로드 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 다운로드에 실패했습니다.", e);
        }
    }

    /**
     * 파일 삭제
     */
    public void deleteFile(String fileKey) {
        try {
            log.info("S3 파일 삭제 시작 - 버킷: {}, 키: {}", bucketName, fileKey);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("S3 파일 삭제 성공: {}", fileKey);

        } catch (Exception e) {
            log.error("파일 삭제 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 삭제에 실패했습니다.", e);
        }
    }

    /**
     * 여러 파일 삭제
     */
    public void deleteFiles(List<String> fileKeys) {
        if (fileKeys.isEmpty()) {
            return;
        }

        try {
            log.info("S3 다중 파일 삭제 시작 - 개수: {}", fileKeys.size());

            List<ObjectIdentifier> objectsToDelete = fileKeys.stream()
                    .map(key -> ObjectIdentifier.builder().key(key).build())
                    .toList();

            Delete delete = Delete.builder()
                    .objects(objectsToDelete)
                    .build();

            DeleteObjectsRequest deleteObjectsRequest = DeleteObjectsRequest.builder()
                    .bucket(bucketName)
                    .delete(delete)
                    .build();

            DeleteObjectsResponse response = s3Client.deleteObjects(deleteObjectsRequest);
            log.info("S3 다중 파일 삭제 성공 - 삭제된 파일 수: {}", response.deleted().size());

        } catch (Exception e) {
            log.error("다중 파일 삭제 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("다중 파일 삭제에 실패했습니다.", e);
        }
    }

    /**
     * 파일 존재 여부 확인
     */
    public boolean doesFileExist(String fileKey) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            log.error("파일 존재 여부 확인 중 오류: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 폴더 내 파일 목록 조회
     */
    public List<String> listFiles(String folderPath) {
        try {
            log.info("S3 폴더 내 파일 목록 조회 - 경로: {}", folderPath);

            ListObjectsV2Request listObjectsRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(folderPath)
                    .build();

            ListObjectsV2Response listObjectsResponse = s3Client.listObjectsV2(listObjectsRequest);

            List<String> fileKeys = listObjectsResponse.contents().stream()
                    .map(S3Object::key)
                    .filter(key -> !key.equals(folderPath)) // 폴더 자체 제외
                    .toList();

            log.info("파일 목록 조회 완료 - 파일 수: {}", fileKeys.size());
            return fileKeys;

        } catch (Exception e) {
            log.error("파일 목록 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 목록 조회에 실패했습니다.", e);
        }
    }

    /**
     * Presigned URL 생성 (파일 직접 다운로드용)
     */
    public String generatePresignedUrl(String fileKey, int expirationMinutes) {
        try {
            // 간단한 구현 - 실제로는 Presigned URL을 생성해야 함
            return baseUrl + "/" + URLEncoder.encode(fileKey, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Presigned URL 생성 중 오류: {}", e.getMessage(), e);
            throw new RuntimeException("URL 생성에 실패했습니다.", e);
        }
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        
        return filename.substring(lastDotIndex);
    }

    /**
     * 고유한 파일명 생성
     */
    private String generateUniqueFilename(String fileExtension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + uuid + fileExtension;
    }

    /**
     * URL에서 파일 키 추출
     */
    public String extractFileKeyFromUrl(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith(baseUrl)) {
            throw new IllegalArgumentException("잘못된 파일 URL입니다: " + fileUrl);
        }
        
        return fileUrl.substring(baseUrl.length() + 1);
    }
}