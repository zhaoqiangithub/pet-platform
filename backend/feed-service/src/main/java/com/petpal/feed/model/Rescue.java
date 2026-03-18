package com.petpal.feed.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@TableName("t_rescue")
public class Rescue implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    /**
     * 动物类型: cat, dog, other
     */
    private String animalType;

    /**
     * 健康状态: healthy, injured, sick
     */
    private String healthStatus;

    /**
     * 救助状态: pending, rescuing, rescued, medical, adopted, closed
     */
    private String rescueStatus;

    /**
     * 位置纬度
     */
    private BigDecimal locationLat;

    /**
     * 位置经度
     */
    private BigDecimal locationLng;

    /**
     * 地址描述
     */
    private String address;

    /**
     * 描述
     */
    private String description;

    /**
     * 品种
     */
    private String breed;

    /**
     * 年龄
     */
    private String age;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 微信联系方式
     */
    private String contactWechat;

    /**
     * 图片URL数组 (JSON格式)
     */
    private String images;

    /**
     * 审核状态: pending, approved, rejected
     */
    private String reviewStatus;

    /**
     * 审核备注
     */
    private String reviewComment;

    @TableField(fill = FieldFill.INSERT)
    private Instant createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Instant updateTime;

    @TableLogic
    private Integer deleted;
}
