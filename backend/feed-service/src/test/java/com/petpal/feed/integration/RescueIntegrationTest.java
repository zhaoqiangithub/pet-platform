package com.petpal.feed.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petpal.feed.dto.RescuePublishRequest;
import com.petpal.feed.model.Rescue;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Tag("integration")
@AutoConfigureMockMvc

class RescueIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void publishAndGetRescue_Success() throws Exception {
        // Publish a rescue
        RescuePublishRequest request = new RescuePublishRequest();
        request.setAnimalType("cat");
        request.setHealthStatus("healthy");
        request.setLocationLat(new BigDecimal("39.9042"));
        request.setLocationLng(new BigDecimal("116.4074"));
        request.setContactPhone("13800138000");
        request.setImages(List.of("http://example.com/img1.jpg"));

        mockMvc.perform(post("/api/v1/rescue/publish")
                .header("X-User-Id", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void getRescueList_Success() throws Exception {
        mockMvc.perform(get("/api/v1/rescue/filter")
                .param("animalType", "cat")
                .param("page", "1")
                .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}
