package com.petpal.feed.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petpal.feed.constant.StatusConstants;
import com.petpal.feed.dto.RescueDetailResponse;
import com.petpal.feed.dto.RescuePublishRequest;
import com.petpal.feed.dto.StatusUpdateRequest;
import com.petpal.feed.exception.BusinessException;
import com.petpal.feed.feign.NotificationServiceFeignClient;
import com.petpal.feed.feign.UserServiceFeignClient;
import com.petpal.feed.model.Rescue;
import com.petpal.feed.model.StatusHistory;
import com.petpal.feed.repository.RescueMapper;
import com.petpal.feed.repository.StatusHistoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class    RescueService {

    private final RescueMapper rescueMapper;
    private final StatusHistoryMapper statusHistoryMapper;
    private final UserServiceFeignClient userServiceFeignClient;
    private final NotificationServiceFeignClient notificationServiceFeignClient;
    private final ObjectMapper objectMapper;

    /**
     * 发布救助信息
     */
    @Transactional
    public Rescue publish(Long userId, RescuePublishRequest request) {
        // TODO: 检查用户实名认证状态
        // UserServiceFeignClient.RealNameStatusResponse status = userServiceFeignClient.getRealNameStatus(userId, authorization);
        // if (status == null || !status.certified()) {
        //     throw new BusinessException(16010, "请先完成实名认证");
        // }

        // 创建救助信息
        Rescue rescue = new Rescue();
        rescue.setUserId(userId);
        rescue.setAnimalType(request.getAnimalType());
        rescue.setHealthStatus(request.getHealthStatus());
        rescue.setRescueStatus(StatusConstants.RESCUE_STATUS_PENDING);
        rescue.setLocationLat(request.getLocationLat());
        rescue.setLocationLng(request.getLocationLng());
        rescue.setAddress(request.getAddress());
        rescue.setDescription(request.getDescription());
        rescue.setBreed(request.getBreed());
        rescue.setAge(request.getAge());
        rescue.setContactPhone(request.getContactPhone());
        rescue.setContactWechat(request.getContactWechat());
        rescue.setReviewStatus(StatusConstants.REVIEW_STATUS_PENDING);

        // 序列化图片列表
        try {
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                rescue.setImages(objectMapper.writeValueAsString(request.getImages()));
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException(16011, "图片数据处理失败");
        }

        rescue.setCreateTime(Instant.now());
        rescue.setUpdateTime(Instant.now());

        rescueMapper.insert(rescue);

        log.info("用户 {} 发布救助信息成功, id={}", userId, rescue.getId());

        // TODO: 发送审核通知

        return rescue;
    }

    /**
     * 获取救助详情
     */
    public RescueDetailResponse getDetail(Long id) {
        Rescue rescue = rescueMapper.selectById(id);
        if (rescue == null || rescue.getDeleted() == 1) {
            throw new BusinessException(16012, "救助信息不存在");
        }

        return convertToDetailResponse(rescue);
    }

    /**
     * 更新救助状态
     */
    @Transactional
    public Rescue updateStatus(Long id, Long userId, StatusUpdateRequest request) {
        Rescue rescue = rescueMapper.selectById(id);
        if (rescue == null || rescue.getDeleted() == 1) {
            throw new BusinessException(16012, "救助信息不存在");
        }

        // 验证是否是发布者
        if (!rescue.getUserId().equals(userId)) {
            throw new BusinessException(16013, "无权限修改他人发布的信息");
        }

        String oldStatus = rescue.getRescueStatus();

        // 更新状态
        rescue.setRescueStatus(request.getStatus());
        rescue.setUpdateTime(Instant.now());
        rescueMapper.updateById(rescue);

        // 记录状态历史
        StatusHistory history = new StatusHistory();
        history.setTargetType("rescue");
        history.setTargetId(id);
        history.setOldStatus(oldStatus);
        history.setNewStatus(request.getStatus());
        history.setProgress(request.getProgress());
        history.setUserId(userId);

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                history.setImages(objectMapper.writeValueAsString(request.getImages()));
            } catch (JsonProcessingException e) {
                log.error("序列化状态历史图片失败", e);
            }
        }

        history.setCreateTime(Instant.now());
        statusHistoryMapper.insert(history);

        log.info("用户 {} 更新救助信息 {} 状态: {} -> {}", userId, id, oldStatus, request.getStatus());

        // TODO: 通知关注者

        return rescue;
    }

    /**
     * 分页查询救助信息
     */
    public Page<Rescue> findByFilter(String animalType, String urgency, Integer distance,
                                     String timeRange, Integer page, Integer pageSize) {
        LambdaQueryWrapper<Rescue> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Rescue::getReviewStatus, StatusConstants.REVIEW_STATUS_APPROVED);
        wrapper.eq(Rescue::getDeleted, 0);

        if (animalType != null) {
            wrapper.eq(Rescue::getAnimalType, animalType);
        }

        if (urgency != null) {
            // urgent: injured/sick, normal: healthy
            if ("urgent".equals(urgency)) {
                wrapper.in(Rescue::getHealthStatus, StatusConstants.HEALTH_STATUS_INJURED, StatusConstants.HEALTH_STATUS_SICK);
            } else {
                wrapper.eq(Rescue::getHealthStatus, StatusConstants.HEALTH_STATUS_HEALTHY);
            }
        }

        wrapper.orderByDesc(Rescue::getCreateTime);

        return rescueMapper.selectPage(new Page<>(page, pageSize), wrapper);
    }

    /**
     * 转换为详情响应
     */
    private RescueDetailResponse convertToDetailResponse(Rescue rescue) {
        RescueDetailResponse response = new RescueDetailResponse();
        response.setId(rescue.getId());
        response.setUserId(rescue.getUserId());
        response.setAnimalType(rescue.getAnimalType());
        response.setHealthStatus(rescue.getHealthStatus());
        response.setRescueStatus(rescue.getRescueStatus());
        response.setLocationLat(rescue.getLocationLat());
        response.setLocationLng(rescue.getLocationLng());
        response.setAddress(rescue.getAddress());
        response.setDescription(rescue.getDescription());
        response.setBreed(rescue.getBreed());
        response.setAge(rescue.getAge());
        response.setContactPhone(rescue.getContactPhone());
        response.setContactWechat(rescue.getContactWechat());
        response.setReviewStatus(rescue.getReviewStatus());
        response.setReviewComment(rescue.getReviewComment());
        response.setCreateTime(rescue.getCreateTime());
        response.setUpdateTime(rescue.getUpdateTime());

        // 反序列化图片
        if (rescue.getImages() != null) {
            try {
                response.setImages(objectMapper.readValue(rescue.getImages(), new TypeReference<>() {}));
            } catch (JsonProcessingException e) {
                log.error("反序列化图片失败", e);
            }
        }

        // TODO: 获取发布者信息
        // UserServiceFeignClient.UserProfileResponse profile = userServiceFeignClient.getUserProfile(rescue.getUserId(), authorization);

        return response;
    }

    /**
     * 获取救助信息列表（用于地图）
     */
    public List<Rescue> findByLocationRange(java.math.BigDecimal lat, java.math.BigDecimal lng, Integer radius) {
        return rescueMapper.findByLocationRange(lat, lng, radius != null ? radius : 5);
    }
}
