package com.petpal.feed.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

@Data
@TableName("t_status_history")
public class StatusHistory implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 目标类型: rescue, adoption
     */
    private String targetType;

    /**
     * 目标ID
     */
    private Long targetId;

    /**
     * 旧状态
     */
    private String oldStatus;

    /**
     * 新状态
     */
    private String newStatus;

    /**
     * 进展描述
     */
    private String progress;

    /**
     * 图片URL数组 (JSON格式)
     */
    private String images;

    /**
     * 操作人ID
     */
    private Long userId;

    @TableField(fill = FieldFill.INSERT)
    private Instant createTime;
}
