package com.petpal.feed.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class MapPointResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String type; // rescue, adoption
    private String markerColor; // red, yellow, green, blue
    private BigDecimal lat;
    private BigDecimal lng;
    private String title;
    private String status;
    private String animalType;
    private List<String> thumbnailImages;
    private String createTime;
}
