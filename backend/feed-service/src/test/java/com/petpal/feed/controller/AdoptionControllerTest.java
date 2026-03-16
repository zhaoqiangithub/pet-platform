package com.petpal.feed.controller;

import com.petpal.feed.dto.AdoptionDetailResponse;
import com.petpal.feed.model.Adoption;
import com.petpal.feed.repository.AdoptionMapper;
import com.petpal.feed.repository.RescueMapper;
import com.petpal.feed.repository.StatusHistoryMapper;
import com.petpal.feed.service.AdoptionService;
import com.petpal.feed.feign.UserServiceFeignClient;
import com.petpal.feed.feign.NotificationServiceFeignClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdoptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdoptionService adoptionService;

    @MockBean
    private RescueMapper rescueMapper;

    @MockBean
    private AdoptionMapper adoptionMapper;

    @MockBean
    private StatusHistoryMapper statusHistoryMapper;

    @MockBean
    private UserServiceFeignClient userServiceFeignClient;

    @MockBean
    private NotificationServiceFeignClient notificationServiceFeignClient;

    @Test
    void publish_Success() throws Exception {
        // Given
        Adoption adoption = new Adoption();
        adoption.setId(1L);
        adoption.setUserId(100L);
        adoption.setAnimalType("dog");
        adoption.setGender("male");
        adoption.setAdoptionStatus("available");
        adoption.setContactPhone("13800138000");
        adoption.setCreateTime(Instant.now());
        adoption.setUpdateTime(Instant.now());

        when(adoptionService.publish(anyLong(), any())).thenReturn(adoption);

        // When & Then
        mockMvc.perform(post("/api/v1/adoption/publish")
                .header("X-User-Id", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "name": "小白",
                        "animalType": "dog",
                        "gender": "male",
                        "age": "adult",
                        "breed": "中华田园犬",
                        "size": "medium",
                        "personality": "温顺听话",
                        "healthStatus": {
                            "vaccinated": true,
                            "dewormed": true,
                            "neutered": false
                        },
                        "requirements": "有爱心，有固定收入",
                        "story": "救助的流浪狗",
                        "contactPhone": "13800138000",
                        "images": ["http://example.com/img1.jpg"]
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void getDetail_Success() throws Exception {
        // Given
        AdoptionDetailResponse response = new AdoptionDetailResponse();
        response.setId(1L);
        response.setUserId(100L);
        response.setAnimalType("dog");
        response.setGender("male");
        response.setAdoptionStatus("available");
        response.setCreateTime(Instant.now());

        when(adoptionService.getDetail(1L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/adoption/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void updateStatus_Success() throws Exception {
        // Given
        Adoption adoption = new Adoption();
        adoption.setId(1L);
        adoption.setUserId(100L);
        adoption.setAdoptionStatus("adopted");
        adoption.setUpdateTime(Instant.now());

        when(adoptionService.updateStatus(eq(1L), eq(100L), any())).thenReturn(adoption);

        // When & Then
        mockMvc.perform(put("/api/v1/adoption/1/status")
                .header("X-User-Id", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "status": "adopted",
                        "progress": "已找到新主人"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.adoptionStatus").value("adopted"));
    }
}
