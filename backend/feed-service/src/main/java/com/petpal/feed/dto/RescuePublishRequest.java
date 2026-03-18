package com.petpal.feed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RescuePublishRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 动物类型
     */
    @NotBlank(message = "动物类型不能为空")
    private String animalType;

    /**
     * 健康状态
     */
    @NotBlank(message = "健康状态不能为空")
    private String healthStatus;

    /**
     * 位置纬度
     */
    @NotNull(message = "位置纬度不能为空")
    private BigDecimal locationLat;

    /**
     * 位置经度
     */
    @NotNull(message = "位置经度不能为空")
    private BigDecimal locationLng;

    /**
     * 地址描述
     */
    private String address;

    /**
     * 描述
     */
    @Size(max = 2000, message = "描述不能超过2000字")
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
    @NotBlank(message = "联系方式不能为空")
    private String contactPhone;

    /**
     * 微信联系方式
     */
    private String contactWechat;

    /**
     * 图片URL列表
     */
    @Size(min = 1, max = 9, message = "图片数量需在1-9张之间")
    private List<String> images;
}
