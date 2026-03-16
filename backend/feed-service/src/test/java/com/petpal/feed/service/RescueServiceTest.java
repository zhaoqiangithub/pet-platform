package com.petpal.feed.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petpal.feed.dto.RescuePublishRequest;
import com.petpal.feed.exception.BusinessException;
import com.petpal.feed.model.Rescue;
import com.petpal.feed.repository.RescueMapper;
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

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RescueServiceTest {

    @Mock
    private RescueMapper rescueMapper;

    @Mock
    private StatusHistoryMapper statusHistoryMapper;

    @Mock
    private UserServiceFeignClient userServiceFeignClient;

    @Mock
    private NotificationServiceFeignClient notificationServiceFeignClient;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private RescueService rescueService;

    private RescuePublishRequest validRequest;
    private Rescue existingRescue;

    @BeforeEach
    void setUp() {
        validRequest = new RescuePublishRequest();
        validRequest.setAnimalType("cat");
        validRequest.setHealthStatus("injured");
        validRequest.setLocationLat(new BigDecimal("39.9042"));
        validRequest.setLocationLng(new BigDecimal("116.4074"));
        validRequest.setAddress("北京市东城区");
        validRequest.setContactPhone("13800138000");
        validRequest.setImages(Arrays.asList("http://example.com/img1.jpg"));

        existingRescue = new Rescue();
        existingRescue.setId(1L);
        existingRescue.setUserId(100L);
        existingRescue.setAnimalType("cat");
        existingRescue.setHealthStatus("injured");
        existingRescue.setRescueStatus("pending");
        existingRescue.setDeleted(0);
    }

    @Test
    void publish_Success() {
        // Given
        Long userId = 100L;
        when(rescueMapper.insert(any(Rescue.class))).thenReturn(1);

        // When
        Rescue result = rescueService.publish(userId, validRequest);

        // Then
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals("cat", result.getAnimalType());
        assertEquals("injured", result.getHealthStatus());
        assertEquals("pending", result.getRescueStatus());
        assertEquals("pending", result.getReviewStatus());
        verify(rescueMapper, times(1)).insert(any(Rescue.class));
    }

    @Test
    void publish_WithAllFields_Success() {
        // Given
        validRequest.setDescription("一只受伤的流浪猫");
        validRequest.setBreed("中华田园猫");
        validRequest.setAge("成年");
        validRequest.setContactWechat("wechat123");
        validRequest.setImages(Arrays.asList("img1.jpg", "img2.jpg"));

        Long userId = 100L;
        when(rescueMapper.insert(any(Rescue.class))).thenReturn(1);

        // When
        Rescue result = rescueService.publish(userId, validRequest);

        // Then
        assertNotNull(result);
        assertEquals("一只受伤的流浪猫", result.getDescription());
        assertEquals("中华田园猫", result.getBreed());
    }

    @Test
    void getDetail_ExistingRescue_ReturnsDetail() {
        // Given
        when(rescueMapper.selectById(1L)).thenReturn(existingRescue);

        // When
        var result = rescueService.getDetail(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("cat", result.getAnimalType());
    }

    @Test
    void getDetail_NonExisting_ThrowsException() {
        // Given
        when(rescueMapper.selectById(999L)).thenReturn(null);

        // When & Then
        assertThrows(BusinessException.class, () -> rescueService.getDetail(999L));
    }

    @Test
    void updateStatus_AsOwner_Success() {
        // Given
        Long userId = 100L;
        com.petpal.feed.dto.StatusUpdateRequest statusRequest = new com.petpal.feed.dto.StatusUpdateRequest();
        statusRequest.setStatus("rescuing");
        statusRequest.setProgress("正在送往医院");

        when(rescueMapper.selectById(1L)).thenReturn(existingRescue);
        when(rescueMapper.updateById(any(Rescue.class))).thenReturn(1);
        when(statusHistoryMapper.insert(any())).thenReturn(1);

        // When
        Rescue result = rescueService.updateStatus(1L, userId, statusRequest);

        // Then
        assertNotNull(result);
        assertEquals("rescuing", result.getRescueStatus());
        verify(statusHistoryMapper, times(1)).insert(any());
    }

    @Test
    void updateStatus_NotOwner_ThrowsException() {
        // Given
        Long userId = 999L;
        com.petpal.feed.dto.StatusUpdateRequest statusRequest = new com.petpal.feed.dto.StatusUpdateRequest();
        statusRequest.setStatus("rescuing");

        when(rescueMapper.selectById(1L)).thenReturn(existingRescue);

        // When & Then
        assertThrows(BusinessException.class,
            () -> rescueService.updateStatus(1L, userId, statusRequest));
    }
}
