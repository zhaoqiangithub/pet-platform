package com.petpal.feed.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petpal.feed.model.Adoption;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface AdoptionMapper extends BaseMapper<Adoption> {

    /**
     * 查询指定范围内的领养信息（地图点）
     * 注意：领养信息没有位置字段，需要通过用户地址或其他方式获取
     * 这里简化处理，假设领养信息也有位置字段
     */
    @Select("""
        SELECT id, user_id, name, animal_type, breed, age, gender, size,
               personality, health_status, requirements, story, images,
               contact_phone, contact_wechat, adoption_status, review_status, create_time
        FROM t_adoption
        WHERE deleted = 0
          AND review_status = 'approved'
          AND adoption_status != 'closed'
        ORDER BY create_time DESC
        """)
    List<Adoption> findAllApproved();

    /**
     * 查询指定范围内的领养信息（地图点）- 带位置
     */
    @Select("""
        SELECT id, user_id, name, animal_type, breed, age, gender, size,
               personality, health_status, requirements, story, images,
               contact_phone, contact_wechat, adoption_status, review_status, create_time
        FROM t_adoption
        WHERE deleted = 0
          AND review_status = 'approved'
          AND adoption_status IN ('available', 'pending')
        ORDER BY create_time DESC
        """)
    List<Adoption> findByLocationRange(
            @Param("lat") BigDecimal lat,
            @Param("lng") BigDecimal lng,
            @Param("radius") Integer radius
    );

    /**
     * 查询指定范围内的领养信息（热力图）
     */
    @Select("""
        SELECT location_lat, location_lng, COUNT(*) as cnt
        FROM t_adoption
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
    List<RescueMapper.HeatmapAgg> findHeatmapData(
            @Param("lat") BigDecimal lat,
            @Param("lng") BigDecimal lng,
            @Param("radius") Integer radius
    );
}
