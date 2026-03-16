package com.petpal.feed.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.List;

@Data
public class AdoptionDetailResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long userId;
    private String nickname;
    private String avatar;

    private String name;
    private String animalType;
    private String breed;
    private String age;
    private String gender;
    private String size;
    private String personality;
    private HealthStatus healthStatus;
    private String requirements;
    private String story;
    private List<String> images;
    private String contactPhone;
    private String contactWechat;
    private String adoptionStatus;
    private String reviewStatus;
    private String reviewComment;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant createTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant updateTime;

    @Data
    public static class HealthStatus implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Boolean vaccinated;
        private Boolean dewormed;
        private Boolean neutered;
    }
}
