package com.petpal.feed.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petpal.feed.dto.RescueDetailResponse;
import com.petpal.feed.model.Rescue;
import com.petpal.feed.repository.RescueMapper;
import com.petpal.feed.repository.AdoptionMapper;
import com.petpal.feed.repository.StatusHistoryMapper;
import com.petpal.feed.service.RescueService;
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
class RescueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RescueService rescueService;

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
        Rescue rescue = new Rescue();
        rescue.setId(1L);
        rescue.setUserId(100L);
        rescue.setAnimalType("cat");
        rescue.setHealthStatus("healthy");
        rescue.setRescueStatus("pending");
        rescue.setLocationLat(new BigDecimal("39.9042"));
        rescue.setLocationLng(new BigDecimal("116.4074"));
        rescue.setContactPhone("13800138000");
        rescue.setCreateTime(Instant.now());
        rescue.setUpdateTime(Instant.now());

        when(rescueService.publish(anyLong(), any())).thenReturn(rescue);

        // When & Then
        mockMvc.perform(post("/api/v1/rescue/publish")
                .header("X-User-Id", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "animalType": "cat",
                        "healthStatus": "healthy",
                        "locationLat": 39.9042,
                        "locationLng": 116.4074,
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
        RescueDetailResponse response = new RescueDetailResponse();
        response.setId(1L);
        response.setUserId(100L);
        response.setAnimalType("cat");
        response.setHealthStatus("healthy");
        response.setRescueStatus("pending");
        response.setCreateTime(Instant.now());

        when(rescueService.getDetail(1L)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/v1/rescue/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void updateStatus_Success() throws Exception {
        // Given
        Rescue rescue = new Rescue();
        rescue.setId(1L);
        rescue.setUserId(100L);
        rescue.setRescueStatus("rescuing");
        rescue.setUpdateTime(Instant.now());

        when(rescueService.updateStatus(eq(1L), eq(100L), any())).thenReturn(rescue);

        // When & Then
        mockMvc.perform(put("/api/v1/rescue/1/status")
                .header("X-User-Id", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "status": "rescuing",
                        "progress": "正在送往医院"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.rescueStatus").value("rescuing"));
    }
}
