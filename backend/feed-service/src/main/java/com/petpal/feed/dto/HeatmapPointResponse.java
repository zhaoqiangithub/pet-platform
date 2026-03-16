package com.petpal.feed.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class HeatmapPointResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private BigDecimal lat;
    private BigDecimal lng;
    private Integer intensity; // 权重，1-10
}
