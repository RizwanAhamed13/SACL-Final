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
        try {
            RejectedRecord rejected = new RejectedRecord();
            rejected.setFormType(formType);
            rejected.setOriginalId(originalId);
            rejected.setDataJson(objectMapper.writeValueAsString(data));
            rejected.setRejectedBy(rejectedBy);
            repository.save(rejected);
        } catch (Exception e) {
            throw new com.sacl.exception.BadRequestException("Failed to archive rejected record: " + e.getMessage());
        }
    }
}
