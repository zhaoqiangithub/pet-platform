package com.petpal.feed.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petpal.feed.constant.StatusConstants;
import com.petpal.feed.dto.HeatmapPointResponse;
import com.petpal.feed.dto.MapPointResponse;
import com.petpal.feed.model.Adoption;
import com.petpal.feed.model.Rescue;
import com.petpal.feed.repository.AdoptionMapper;
import com.petpal.feed.repository.RescueMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapService {

    private final RescueMapper rescueMapper;
    private final AdoptionMapper adoptionMapper;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * 获取地图上的信息点
     */
    public List<MapPointResponse> getMapPoints(BigDecimal lat, BigDecimal lng, Integer radius, String types) {
        List<MapPointResponse> points = new ArrayList<>();

        // 解析类型筛选
        boolean includeRescue = types == null || types.contains("rescue");
        boolean includeAdoption = types == null || types.contains("adoption");

        // 获取救助信息点
        if (includeRescue) {
            List<Rescue> rescues = rescueMapper.findByLocationRange(lat, lng, radius != null ? radius : 5);
            for (Rescue rescue : rescues) {
                points.add(convertRescueToMapPoint(rescue));
            }
        }

        // 获取领养信息点
        if (includeAdoption) {
            List<Adoption> adoptions = adoptionMapper.findByLocationRange(lat, lng, radius != null ? radius : 5);
            for (Adoption adoption : adoptions) {
                points.add(convertAdoptionToMapPoint(adoption));
            }
        }

        return points;
    }

    /**
     * 获取热力图数据
     */
    public List<HeatmapPointResponse> getHeatmapData(BigDecimal lat, BigDecimal lng, Integer radius) {
        List<HeatmapPointResponse> points = new ArrayList<>();
        int effectiveRadius = radius != null ? radius : 10;

        // 获取救助信息热力点
        List<RescueMapper.HeatmapAgg> rescueHeatmap = rescueMapper.findHeatmapData(lat, lng, effectiveRadius);
        for (RescueMapper.HeatmapAgg agg : rescueHeatmap) {
            HeatmapPointResponse point = new HeatmapPointResponse();
            point.setLat(agg.location_lat);
            point.setLng(agg.location_lng);
            point.setIntensity(calculateIntensity(agg.cnt.intValue()));
            points.add(point);
        }

        // 获取领养信息热力点
        List<RescueMapper.HeatmapAgg> adoptionHeatmap = adoptionMapper.findHeatmapData(lat, lng, effectiveRadius);
        for (RescueMapper.HeatmapAgg agg : adoptionHeatmap) {
            HeatmapPointResponse point = new HeatmapPointResponse();
            point.setLat(agg.location_lat);
            point.setLng(agg.location_lng);
            point.setIntensity(calculateIntensity(agg.cnt.intValue()));
            points.add(point);
        }

        return points;
    }

    /**
     * 计算热力点强度
     */
    private Integer calculateIntensity(int count) {
        if (count <= 1) return 1;
        if (count <= 3) return 3;
        if (count <= 5) return 5;
        if (count <= 10) return 7;
        return 10;
    }

    /**
     * 将救助信息转换为地图点
     */
    private MapPointResponse convertRescueToMapPoint(Rescue rescue) {
        MapPointResponse point = new MapPointResponse();
        point.setId(rescue.getId());
        point.setType("rescue");
        point.setLat(rescue.getLocationLat());
        point.setLng(rescue.getLocationLng());
        point.setStatus(rescue.getRescueStatus());
        point.setAnimalType(rescue.getAnimalType());

        // 根据救助状态设置标记颜色
        // 红色：紧急救助（injured/sick + pending/medical）
        // 黄色：需要救助（healthy + pending）
        // 绿色：待领养（adopted）
        // 蓝色：已完成（closed）
        point.setMarkerColor(getMarkerColorByRescueStatus(rescue.getHealthStatus(), rescue.getRescueStatus()));

        // 标题
        String animalTypeName = getAnimalTypeName(rescue.getAnimalType());
        point.setTitle(animalTypeName + " - " + getHealthStatusName(rescue.getHealthStatus()));

        // 缩略图
        if (rescue.getImages() != null) {
            try {
                List<String> images = objectMapper.readValue(rescue.getImages(), new TypeReference<>() {});
                if (!images.isEmpty()) {
                    point.setThumbnailImages(images.size() > 3 ? images.subList(0, 3) : images);
                }
            } catch (Exception e) {
                log.error("反序列化图片失败", e);
            }
        }

        // 创建时间
        if (rescue.getCreateTime() != null) {
            point.setCreateTime(rescue.getCreateTime().atZone(java.time.ZoneId.systemDefault()).format(DATE_FORMATTER));
        }

        return point;
    }

    /**
     * 将领养信息转换为地图点
     */
    private MapPointResponse convertAdoptionToMapPoint(Adoption adoption) {
        MapPointResponse point = new MapPointResponse();
        point.setId(adoption.getId());
        point.setType("adoption");
        // 领养信息暂时没有位置字段，使用默认值
        point.setLat(BigDecimal.ZERO);
        point.setLng(BigDecimal.ZERO);
        point.setStatus(adoption.getAdoptionStatus());
        point.setAnimalType(adoption.getAnimalType());

        // 领养状态对应的颜色
        // 绿色：待领养（available）
        // 黄色：待审核（pending）
        // 蓝色：已领养（adopted）
        // 灰色：已结束（closed）
        switch (adoption.getAdoptionStatus()) {
            case StatusConstants.ADOPTION_STATUS_AVAILABLE -> point.setMarkerColor(StatusConstants.MARKER_COLOR_GREEN);
            case StatusConstants.ADOPTION_STATUS_PENDING -> point.setMarkerColor(StatusConstants.MARKER_COLOR_YELLOW);
            case StatusConstants.ADOPTION_STATUS_ADOPTED -> point.setMarkerColor(StatusConstants.MARKER_COLOR_BLUE);
            default -> point.setMarkerColor("gray");
        }

        // 标题
        String title = adoption.getName() != null ? adoption.getName() : getAnimalTypeName(adoption.getAnimalType());
        point.setTitle(title);

        // 缩略图
        if (adoption.getImages() != null) {
            try {
                List<String> images = objectMapper.readValue(adoption.getImages(), new TypeReference<>() {});
                if (!images.isEmpty()) {
                    point.setThumbnailImages(images.size() > 3 ? images.subList(0, 3) : images);
                }
            } catch (Exception e) {
                log.error("反序列化图片失败", e);
            }
        }

        // 创建时间
        if (adoption.getCreateTime() != null) {
            point.setCreateTime(adoption.getCreateTime().atZone(java.time.ZoneId.systemDefault()).format(DATE_FORMATTER));
        }

        return point;
    }

    /**
     * 根据救助状态获取标记颜色
     */
    private String getMarkerColorByRescueStatus(String healthStatus, String rescueStatus) {
        // 紧急救助：受伤、生病
        if (StatusConstants.HEALTH_STATUS_INJURED.equals(healthStatus) ||
            StatusConstants.HEALTH_STATUS_SICK.equals(healthStatus)) {
            if (StatusConstants.RESCUE_STATUS_PENDING.equals(rescueStatus) ||
                StatusConstants.RESCUE_STATUS_MEDICAL.equals(rescueStatus)) {
                return StatusConstants.MARKER_COLOR_RED;
            }
        }

        // 需要救助：健康但待救助
        if (StatusConstants.HEALTH_STATUS_HEALTHY.equals(healthStatus) &&
            StatusConstants.RESCUE_STATUS_PENDING.equals(rescueStatus)) {
            return StatusConstants.MARKER_COLOR_YELLOW;
        }

        // 已领养
        if (StatusConstants.RESCUE_STATUS_ADOPTED.equals(rescueStatus)) {
            return StatusConstants.MARKER_COLOR_GREEN;
        }

        // 已完成/关闭
        if (StatusConstants.RESCUE_STATUS_CLOSED.equals(rescueStatus) ||
            StatusConstants.RESCUE_STATUS_RESCUED.equals(rescueStatus)) {
            return StatusConstants.MARKER_COLOR_BLUE;
        }

        return StatusConstants.MARKER_COLOR_YELLOW;
    }

    /**
     * 获取动物类型名称
     */
    private String getAnimalTypeName(String animalType) {
        return switch (animalType) {
            case StatusConstants.ANIMAL_TYPE_CAT -> "猫";
            case StatusConstants.ANIMAL_TYPE_DOG -> "狗";
            default -> "其他";
        };
    }

    /**
     * 获取健康状态名称
     */
    private String getHealthStatusName(String healthStatus) {
        return switch (healthStatus) {
            case StatusConstants.HEALTH_STATUS_HEALTHY -> "健康";
            case StatusConstants.HEALTH_STATUS_INJURED -> "受伤";
            case StatusConstants.HEALTH_STATUS_SICK -> "生病";
            default -> "未知";
        };
    }
}
