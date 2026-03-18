package com.petpal.feed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class AdoptionPublishRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 名字
     */
    private String name;

    /**
     * 动物类型
     */
    private String animalType;

    /**
     * 品种
     */
    @NotBlank(message = "品种不能为空")
    private String breed;

    /**
     * 年龄
     */
    @NotBlank(message = "年龄不能为空")
    private String age;

    /**
     * 性别
     */
    @NotBlank(message = "性别不能为空")
    private String gender;

    /**
     * 体型
     */
    private String size;

    /**
     * 性格描述
     */
    @NotBlank(message = "性格描述不能为空")
    private String personality;

    /**
     * 健康状况
     */
    @NotNull(message = "健康状况不能为空")
    private HealthStatus healthStatus;

    /**
     * 领养要求
     */
    @NotBlank(message = "领养要求不能为空")
    private String requirements;

    /**
     * 救助故事
     */
    private String story;

    /**
     * 图片URL列表
     */
    @NotNull(message = "图片不能为空")
    @Size(min = 1, max = 9, message = "图片数量需在1-9张之间")
    private List<String> images;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 微信联系方式
     */
    private String contactWechat;

    @Data
    public static class HealthStatus implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Boolean vaccinated;
        private Boolean dewormed;
        private Boolean neutered;
    }
}
