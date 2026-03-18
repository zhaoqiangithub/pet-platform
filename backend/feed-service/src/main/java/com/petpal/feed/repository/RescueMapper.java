package com.petpal.feed.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petpal.feed.model.Rescue;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface RescueMapper extends BaseMapper<Rescue> {

    /**
     * 查询指定范围内的救助信息（地图点）
     */
    @Select("""
        SELECT id, user_id, animal_type, health_status, rescue_status,
               location_lat, location_lng, address, description, breed, age,
               contact_phone, contact_wechat, images, review_status, create_time
        FROM t_rescue
        WHERE deleted = 0
          AND review_status = 'approved'
          AND location_lat IS NOT NULL
          AND location_lng IS NOT NULL
          AND (
            (${lat} - location_lat) * (${lat} - location_lat) +
            (${lng} - location_lng) * (${lng} - location_lng)
          ) <= (${radius} / 111.0) * (${radius} / 111.0)
        ORDER BY create_time DESC
        """)
    List<Rescue> findByLocationRange(
            @Param("lat") BigDecimal lat,
            @Param("lng") BigDecimal lng,
            @Param("radius") Integer radius
    );

    /**
     * 查询指定范围内的救助信息（热力图）
     */
    @Select("""
        SELECT location_lat, location_lng, COUNT(*) as cnt
        FROM t_rescue
        WHERE deleted = 0
          AND review_status = 'approved'
          AND location_lat IS NOT NULL
          AND location_lng IS NOT NULL
          AND (
            (${lat} - location_lat) * (${lat} - location_lat) +
            (${lng} - location_lng) * (${lng} - location_lng)
          ) <= (${radius} / 111.0) * (${radius} / 111.0)
        GROUP BY location_lat, location_lng
        """)
    List<HeatmapAgg> findHeatmapData(
            @Param("lat") BigDecimal lat,
            @Param("lng") BigDecimal lng,
            @Param("radius") Integer radius
    );

    /**
     * 热力图聚合结果
     */
    @SuppressWarnings("unused")
    class HeatmapAgg {
        public BigDecimal location_lat;
        public BigDecimal location_lng;
        public Long cnt;
    }
}
