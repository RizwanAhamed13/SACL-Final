package com.sacl.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sacl.model.RejectedRecord;
import com.sacl.repository.RejectedRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RejectedRecordService {

    private final RejectedRecordRepository repository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void archiveAndReject(String formType, Long originalId, Object data, String rejectedBy) {
        archiveAndReject(formType, originalId, data, rejectedBy, null, null);
    }

    @Transactional
    public void archiveAndReject(String formType, Long originalId, Object data, String rejectedBy, String rejectionStage, String originalCreatedBy) {
        try {
            RejectedRecord rejected = new RejectedRecord();
            rejected.setFormType(formType);
            rejected.setOriginalId(originalId);
            rejected.setDataJson(objectMapper.writeValueAsString(data));
            rejected.setRejectedBy(rejectedBy);
            rejected.setRejectionStage(rejectionStage);
            rejected.setOriginalCreatedBy(originalCreatedBy);
            repository.save(rejected);
        } catch (Exception e) {
            throw new com.sacl.exception.BadRequestException("Failed to archive rejected record: " + e.getMessage());
        }
    }

    public java.util.List<RejectedRecord> findAll() {
        return repository.findAll();
    }
}
