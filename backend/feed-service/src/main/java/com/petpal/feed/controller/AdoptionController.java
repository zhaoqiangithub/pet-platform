package com.petpal.feed.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.petpal.feed.dto.AdoptionDetailResponse;
import com.petpal.feed.dto.AdoptionPublishRequest;
import com.petpal.feed.dto.Result;
import com.petpal.feed.dto.StatusUpdateRequest;
import com.petpal.feed.model.Adoption;
import com.petpal.feed.service.AdoptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/adoption")
@RequiredArgsConstructor
@Tag(name = "领养信息", description = "领养信息发布、查询、状态更新API")
public class AdoptionController {

    private final AdoptionService adoptionService;

    @PostMapping("/publish")
    @Operation(summary = "发布领养信息", description = "用户发布领养信息，需先完成实名认证")
    public Result<Adoption> publish(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @ModelAttribute AdoptionPublishRequest request) {
        Adoption adoption = adoptionService.publish(userId, request);
        return Result.success("发布成功，请等待审核", adoption);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取领养详情", description = "根据ID获取领养详细信息")
    public Result<AdoptionDetailResponse> getDetail(
            @Parameter(description = "领养信息ID") @PathVariable Long id) {
        AdoptionDetailResponse detail = adoptionService.getDetail(id);
        return Result.success(detail);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新领养状态", description = "更新领养信息的状态")
    public Result<Adoption> updateStatus(
            @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "领养信息ID") @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        Adoption adoption = adoptionService.updateStatus(id, userId, request);
        return Result.success("状态更新成功", adoption);
    }

    @GetMapping("/filter")
    @Operation(summary = "领养信息筛选", description = "根据条件筛选领养信息")
    public Result<Page<Adoption>> filter(
            @Parameter(description = "动物类型") @RequestParam(required = false) String animalType,
            @Parameter(description = "品种") @RequestParam(required = false) String breed,
            @Parameter(description = "年龄") @RequestParam(required = false) String age,
            @Parameter(description = "性别") @RequestParam(required = false) String gender,
            @Parameter(description = "体型") @RequestParam(required = false) String size,
            @Parameter(description = "是否疫苗") @RequestParam(required = false) Boolean vaccinated,
            @Parameter(description = "距离（公里）") @RequestParam(required = false) Integer distance,
            @Parameter(description = "时间范围") @RequestParam(required = false) String timeRange,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "20") Integer pageSize) {
        Page<Adoption> result = adoptionService.findByFilter(
                animalType, breed, age, gender, size, vaccinated, distance, timeRange, page, pageSize);
        return Result.success(result);
    }
}
