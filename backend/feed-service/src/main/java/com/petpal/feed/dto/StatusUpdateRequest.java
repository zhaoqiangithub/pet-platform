package com.petpal.feed.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class StatusUpdateRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 新状态
     */
    @NotBlank(message = "状态不能为空")
    private String status;

    /**
     * 进展描述
     */
    private String progress;

    /**
     * 图片列表
     */
    private List<String> images;
}
