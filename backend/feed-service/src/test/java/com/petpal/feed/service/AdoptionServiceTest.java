package com.petpal.feed.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petpal.feed.dto.AdoptionPublishRequest;
import com.petpal.feed.exception.BusinessException;
import com.petpal.feed.model.Adoption;
import com.petpal.feed.repository.AdoptionMapper;
import com.petpal.feed.repository.StatusHistoryMapper;
import com.petpal.feed.feign.NotificationServiceFeignClient;
import com.petpal.feed.feign.UserServiceFeignClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdoptionServiceTest {

    @Mock
    private AdoptionMapper adoptionMapper;

    @Mock
    private StatusHistoryMapper statusHistoryMapper;

    @Mock
    private UserServiceFeignClient userServiceFeignClient;

    @Mock
    private NotificationServiceFeignClient notificationServiceFeignClient;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AdoptionService adoptionService;

    private AdoptionPublishRequest validRequest;
    private Adoption existingAdoption;

    @BeforeEach
    void setUp() {
        validRequest = new AdoptionPublishRequest();
        validRequest.setBreed("柯基");
        validRequest.setAge("adult");
        validRequest.setGender("male");
        validRequest.setPersonality("活泼可爱");
        validRequest.setRequirements("科学喂养");
        validRequest.setImages(Arrays.asList("http://example.com/img1.jpg"));

        AdoptionPublishRequest.HealthStatus healthStatus = new AdoptionPublishRequest.HealthStatus();
        healthStatus.setVaccinated(true);
        healthStatus.setDewormed(true);
        validRequest.setHealthStatus(healthStatus);

        existingAdoption = new Adoption();
        existingAdoption.setId(1L);
        existingAdoption.setUserId(100L);
        existingAdoption.setBreed("柯基");
        existingAdoption.setAge("adult");
        existingAdoption.setGender("male");
        existingAdoption.setAdoptionStatus("available");
        existingAdoption.setDeleted(0);
    }

    @Test
    void publish_Success() {
        // Given
        Long userId = 100L;
        when(adoptionMapper.insert(any(Adoption.class))).thenReturn(1);

        // When
        Adoption result = adoptionService.publish(userId, validRequest);

        // Then
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals("柯基", result.getBreed());
        assertEquals("available", result.getAdoptionStatus());
        assertEquals("pending", result.getReviewStatus());
        verify(adoptionMapper, times(1)).insert(any(Adoption.class));
    }

    @Test
    void publish_WithAllFields_Success() {
        // Given
        validRequest.setName("旺财");
        validRequest.setAnimalType("dog");
        validRequest.setSize("medium");
        validRequest.setStory("从救助站领养");
        validRequest.setContactPhone("13800138000");

        Long userId = 100L;
        when(adoptionMapper.insert(any(Adoption.class))).thenReturn(1);

        // When
        Adoption result = adoptionService.publish(userId, validRequest);

        // Then
        assertNotNull(result);
        assertEquals("旺财", result.getName());
        assertEquals("dog", result.getAnimalType());
    }

    @Test
    void getDetail_ExistingAdoption_ReturnsDetail() {
        // Given
        when(adoptionMapper.selectById(1L)).thenReturn(existingAdoption);

        // When
        var result = adoptionService.getDetail(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("柯基", result.getBreed());
    }

    @Test
    void getDetail_NonExisting_ThrowsException() {
        // Given
        when(adoptionMapper.selectById(999L)).thenReturn(null);

        // When & Then
        assertThrows(BusinessException.class, () -> adoptionService.getDetail(999L));
    }

    @Test
    void updateStatus_AsOwner_Success() {
        // Given
        Long userId = 100L;
        com.petpal.feed.dto.StatusUpdateRequest statusRequest = new com.petpal.feed.dto.StatusUpdateRequest();
        statusRequest.setStatus("adopted");

        when(adoptionMapper.selectById(1L)).thenReturn(existingAdoption);
        when(adoptionMapper.updateById(any(Adoption.class))).thenReturn(1);
        when(statusHistoryMapper.insert(any())).thenReturn(1);

        // When
        Adoption result = adoptionService.updateStatus(1L, userId, statusRequest);

        // Then
        assertNotNull(result);
        assertEquals("adopted", result.getAdoptionStatus());
        verify(statusHistoryMapper, times(1)).insert(any());
    }

    @Test
    void updateStatus_NotOwner_ThrowsException() {
        // Given
        Long userId = 999L;
        com.petpal.feed.dto.StatusUpdateRequest statusRequest = new com.petpal.feed.dto.StatusUpdateRequest();
        statusRequest.setStatus("adopted");

        when(adoptionMapper.selectById(1L)).thenReturn(existingAdoption);

        // When & Then
        assertThrows(BusinessException.class,
            () -> adoptionService.updateStatus(1L, userId, statusRequest));
    }
}
