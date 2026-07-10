package com.sacl.service;

import com.sacl.model.QcRegister;
import com.sacl.model.RecordStatus;
import com.sacl.repository.QcRegisterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
public class QcRegisterIntegrationTest {

    @Container
    public static PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("sacl_quality_test")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private QcRegisterService qcRegisterService;

    @Autowired
    private QcRegisterRepository qcRegisterRepository;

    @BeforeEach
    void setUp() {
        qcRegisterRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "EMP01", roles = {"USER"})
    void testCreateQcRegisterAndApprove() {
        QcRegister qc = new QcRegister();
        qc.setPartName("TestPart");
        qc.setHeatCode("H123");
        
        QcRegister saved = qcRegisterService.save(qc);
        assertNotNull(saved.getId());
        assertEquals(RecordStatus.QC_ENTRY, saved.getStatus());

        // HOF Approval
        saved.setStatus(RecordStatus.HOF_APPROVED);
        saved.setHofApprovedBy("HOF01");
        QcRegister hofApproved = qcRegisterService.save(saved);
        assertEquals(RecordStatus.HOF_APPROVED, hofApproved.getStatus());

        // HOD Approval
        hofApproved.setStatus(RecordStatus.HOD_APPROVED);
        hofApproved.setHodApprovedBy("HOD01");
        QcRegister hodApproved = qcRegisterService.save(hofApproved);
        assertEquals(RecordStatus.HOD_APPROVED, hodApproved.getStatus());
    }
}
