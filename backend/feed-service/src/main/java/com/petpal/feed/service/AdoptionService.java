package com.petpal.feed.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petpal.feed.constant.StatusConstants;
import com.petpal.feed.dto.AdoptionDetailResponse;
import com.petpal.feed.dto.AdoptionPublishRequest;
import com.petpal.feed.dto.StatusUpdateRequest;
import com.petpal.feed.exception.BusinessException;
import com.petpal.feed.feign.NotificationServiceFeignClient;
import com.petpal.feed.feign.UserServiceFeignClient;
import com.petpal.feed.model.Adoption;
import com.petpal.feed.model.StatusHistory;
import com.petpal.feed.repository.AdoptionMapper;
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
public class AdoptionService {

    private final AdoptionMapper adoptionMapper;
    private final StatusHistoryMapper statusHistoryMapper;
    private final UserServiceFeignClient userServiceFeignClient;
    private final NotificationServiceFeignClient notificationServiceFeignClient;
    private final ObjectMapper objectMapper;

    /**
     * 发布领养信息
     */
    @Transactional
    public Adoption publish(Long userId, AdoptionPublishRequest request) {
        // TODO: 检查用户实名认证状态

        // 创建领养信息
        Adoption adoption = new Adoption();
        adoption.setUserId(userId);
        adoption.setName(request.getName());
        adoption.setAnimalType(request.getAnimalType());
        adoption.setBreed(request.getBreed());
        adoption.setAge(request.getAge());
        adoption.setGender(request.getGender());
        adoption.setSize(request.getSize());
        adoption.setPersonality(request.getPersonality());
        adoption.setRequirements(request.getRequirements());
        adoption.setStory(request.getStory());
        adoption.setContactPhone(request.getContactPhone());
        adoption.setContactWechat(request.getContactWechat());
        adoption.setAdoptionStatus(StatusConstants.ADOPTION_STATUS_AVAILABLE);
        adoption.setReviewStatus(StatusConstants.REVIEW_STATUS_PENDING);

        // 序列化健康状况
        if (request.getHealthStatus() != null) {
            try {
                adoption.setHealthStatus(objectMapper.writeValueAsString(request.getHealthStatus()));
            } catch (JsonProcessingException e) {
                throw new BusinessException(16021, "健康状况数据处理失败");
            }
        }

        // 序列化图片列表
        try {
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                adoption.setImages(objectMapper.writeValueAsString(request.getImages()));
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException(16022, "图片数据处理失败");
        }

        adoption.setCreateTime(Instant.now());
        adoption.setUpdateTime(Instant.now());

        adoptionMapper.insert(adoption);

        log.info("用户 {} 发布领养信息成功, id={}", userId, adoption.getId());

        // TODO: 发送审核通知

        return adoption;
    }

    /**
     * 获取领养详情
     */
    public AdoptionDetailResponse getDetail(Long id) {
        Adoption adoption = adoptionMapper.selectById(id);
        if (adoption == null || adoption.getDeleted() == 1) {
            throw new BusinessException(16023, "领养信息不存在");
        }

        return convertToDetailResponse(adoption);
    }

    /**
     * 更新领养状态
     */
    @Transactional
    public Adoption updateStatus(Long id, Long userId, StatusUpdateRequest request) {
        Adoption adoption = adoptionMapper.selectById(id);
        if (adoption == null || adoption.getDeleted() == 1) {
            throw new BusinessException(16023, "领养信息不存在");
        }

        // 验证是否是发布者
        if (!adoption.getUserId().equals(userId)) {
            throw new BusinessException(16024, "无权限修改他人发布的信息");
        }

        String oldStatus = adoption.getAdoptionStatus();

        // 更新状态
        adoption.setAdoptionStatus(request.getStatus());
        adoption.setUpdateTime(Instant.now());
        adoptionMapper.updateById(adoption);

        // 记录状态历史
        StatusHistory history = new StatusHistory();
        history.setTargetType("adoption");
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

        log.info("用户 {} 更新领养信息 {} 状态: {} -> {}", userId, id, oldStatus, request.getStatus());

        // TODO: 通知关注者

        return adoption;
    }

    /**
     * 分页查询领养信息
     */
    public Page<Adoption> findByFilter(String animalType, String breed, String age,
                                       String gender, String size, Boolean vaccinated,
                                       Integer distance, String timeRange,
                                       Integer page, Integer pageSize) {
        LambdaQueryWrapper<Adoption> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Adoption::getReviewStatus, StatusConstants.REVIEW_STATUS_APPROVED);
        wrapper.eq(Adoption::getDeleted, 0);
        wrapper.ne(Adoption::getAdoptionStatus, StatusConstants.ADOPTION_STATUS_CLOSED);

        if (animalType != null) {
            wrapper.eq(Adoption::getAnimalType, animalType);
        }
        if (breed != null) {
            wrapper.like(Adoption::getBreed, breed);
        }
        if (age != null) {
            wrapper.eq(Adoption::getAge, age);
        }
        if (gender != null) {
            wrapper.eq(Adoption::getGender, gender);
        }
        if (size != null) {
            wrapper.eq(Adoption::getSize, size);
        }

        wrapper.orderByDesc(Adoption::getCreateTime);

        return adoptionMapper.selectPage(new Page<>(page, pageSize), wrapper);
    }

    /**
     * 转换为详情响应
     */
    private AdoptionDetailResponse convertToDetailResponse(Adoption adoption) {
        AdoptionDetailResponse response = new AdoptionDetailResponse();
        response.setId(adoption.getId());
        response.setUserId(adoption.getUserId());
        response.setName(adoption.getName());
        response.setAnimalType(adoption.getAnimalType());
        response.setBreed(adoption.getBreed());
        response.setAge(adoption.getAge());
        response.setGender(adoption.getGender());
        response.setSize(adoption.getSize());
        response.setPersonality(adoption.getPersonality());
        response.setRequirements(adoption.getRequirements());
        response.setStory(adoption.getStory());
        response.setContactPhone(adoption.getContactPhone());
        response.setContactWechat(adoption.getContactWechat());
        response.setAdoptionStatus(adoption.getAdoptionStatus());
        response.setReviewStatus(adoption.getReviewStatus());
        response.setReviewComment(adoption.getReviewComment());
        response.setCreateTime(adoption.getCreateTime());
        response.setUpdateTime(adoption.getUpdateTime());

        // 反序列化健康状况
        if (adoption.getHealthStatus() != null) {
            try {
                response.setHealthStatus(objectMapper.readValue(adoption.getHealthStatus(),
                        AdoptionDetailResponse.HealthStatus.class));
            } catch (JsonProcessingException e) {
                log.error("反序列化健康状况失败", e);
            }
        }

        // 反序列化图片
        if (adoption.getImages() != null) {
            try {
                response.setImages(objectMapper.readValue(adoption.getImages(), new TypeReference<>() {}));
            } catch (JsonProcessingException e) {
                log.error("反序列化图片失败", e);
            }
        }

        // TODO: 获取发布者信息

        return response;
    }

    /**
     * 获取领养信息列表（用于地图）
     */
    public List<Adoption> findByLocationRange(java.math.BigDecimal lat, java.math.BigDecimal lng, Integer radius) {
        return adoptionMapper.findByLocationRange(lat, lng, radius != null ? radius : 5);
    }

    /**
     * 获取所有已审核通过的领养信息
     */
    public List<Adoption> findAllApproved() {
        return adoptionMapper.findAllApproved();
    }
}
