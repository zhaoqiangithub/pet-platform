package com.petpal.feed.controller;

import com.petpal.feed.dto.HeatmapPointResponse;
import com.petpal.feed.dto.MapPointResponse;
import com.petpal.feed.dto.Result;
import com.petpal.feed.service.MapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
@Tag(name = "地图", description = "地图相关API")
public class MapController {

    private final MapService mapService;

    @GetMapping("/points")
    @Operation(summary = "获取地图上的信息点", description = "获取指定范围内的救助/领养信息点")
    public Result<List<MapPointResponse>> getMapPoints(
            @Parameter(description = "纬度", required = true) @RequestParam BigDecimal lat,
            @Parameter(description = "经度", required = true) @RequestParam BigDecimal lng,
            @Parameter(description = "半径（公里）") @RequestParam(required = false, defaultValue = "5") Integer radius,
            @Parameter(description = "类型筛选，逗号分隔") @RequestParam(required = false) String types) {
        List<MapPointResponse> points = mapService.getMapPoints(lat, lng, radius, types);
        return Result.success(points);
    }

    @GetMapping("/heatmap")
    @Operation(summary = "获取热力图数据", description = "获取指定范围内的热力图数据")
    public Result<List<HeatmapPointResponse>> getHeatmapData(
            @Parameter(description = "纬度", required = true) @RequestParam BigDecimal lat,
            @Parameter(description = "经度", required = true) @RequestParam BigDecimal lng,
            @Parameter(description = "半径（公里）") @RequestParam(required = false, defaultValue = "10") Integer radius) {
        List<HeatmapPointResponse> points = mapService.getHeatmapData(lat, lng, radius);
        return Result.success(points);
    }
}
