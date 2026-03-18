package com.petpal.feed.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.petpal.feed.dto.RescueDetailResponse;
import com.petpal.feed.dto.Result;
import com.petpal.feed.dto.RescuePublishRequest;
import com.petpal.feed.dto.StatusUpdateRequest;
import com.petpal.feed.model.Rescue;
import com.petpal.feed.service.RescueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/rescue")
@RequiredArgsConstructor
@Tag(name = "救助信息", description = "救助信息发布、查询、状态更新API")
public class RescueController {

    private final RescueService rescueService;

    @PostMapping("/publish")
    @Operation(summary = "发布救助信息", description = "用户发布救助信息，需先完成实名认证")
    public Result<Rescue> publish(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody RescuePublishRequest request) {
        Rescue rescue = rescueService.publish(userId, request);
        return Result.success("发布成功，请等待审核", rescue);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取救助详情", description = "根据ID获取救助详细信息")
    public Result<RescueDetailResponse> getDetail(
            @Parameter(description = "救助信息ID") @PathVariable Long id) {
        RescueDetailResponse detail = rescueService.getDetail(id);
        return Result.success(detail);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新救助状态", description = "更新救助信息的状态")
    public Result<Rescue> updateStatus(
            @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "救助信息ID") @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        Rescue rescue = rescueService.updateStatus(id, userId, request);
        return Result.success("状态更新成功", rescue);
    }

    @GetMapping("/filter")
    @Operation(summary = "救助信息筛选", description = "根据条件筛选救助信息")
    public Result<Page<Rescue>> filter(
            @Parameter(description = "动物类型") @RequestParam(required = false) String animalType,
            @Parameter(description = "紧急程度") @RequestParam(required = false) String urgency,
            @Parameter(description = "距离（公里）") @RequestParam(required = false) Integer distance,
            @Parameter(description = "时间范围") @RequestParam(required = false) String timeRange,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "20") Integer pageSize) {
        Page<Rescue> result = rescueService.findByFilter(animalType, urgency, distance, timeRange, page, pageSize);
        return Result.success(result);
    }
}
