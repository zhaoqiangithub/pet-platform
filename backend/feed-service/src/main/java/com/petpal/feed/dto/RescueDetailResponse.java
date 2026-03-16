package com.petpal.feed.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
public class RescueDetailResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long userId;
    private String nickname;
    private String avatar;

    private String animalType;
    private String healthStatus;
    private String rescueStatus;
    private BigDecimal locationLat;
    private BigDecimal locationLng;
    private String address;
    private String description;
    private String breed;
    private String age;
    private String contactPhone;
    private String contactWechat;
    private List<String> images;
    private String reviewStatus;
    private String reviewComment;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant createTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant updateTime;
}
