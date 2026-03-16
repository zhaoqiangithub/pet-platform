package com.petpal.feed.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

@Data
@TableName("t_adoption")
public class Adoption implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    /**
     * 名字
     */
    private String name;

    /**
     * 动物类型: cat, dog, other
     */
    private String animalType;

    /**
     * 品种
     */
    private String breed;

    /**
     * 年龄: young, adult, senior
     */
    private String age;

    /**
     * 性别: male, female
     */
    private String gender;

    /**
     * 体型: small, medium, large
     */
    private String size;

    /**
     * 性格描述
     */
    private String personality;

    /**
     * 健康状况 (JSON格式: {vaccinated, dewormed, neutered})
     */
    private String healthStatus;

    /**
     * 领养要求
     */
    private String requirements;

    /**
     * 救助故事
     */
    private String story;

    /**
     * 图片URL数组 (JSON格式)
     */
    private String images;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 微信联系方式
     */
    private String contactWechat;

    /**
     * 领养状态: available, pending, adopted, closed
     */
    private String adoptionStatus;

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
