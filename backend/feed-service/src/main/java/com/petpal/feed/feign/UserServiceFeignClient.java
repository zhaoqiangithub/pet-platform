package com.petpal.feed.feign;

import com.petpal.feed.dto.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * 用户服务Feign客户端
 */
@FeignClient(name = "user-service", path = "/api/v1/users")
public interface UserServiceFeignClient {

    /**
     * 获取用户实名认证状态
     * @param userId 用户ID
     * @param authorization Authorization头
     * @return 认证状态
     */
    @GetMapping("/{userId}/real-name-status")
    Result<RealNameStatusResponse> getRealNameStatus(
            @PathVariable("userId") Long userId,
            @RequestHeader("Authorization") String authorization
    );

    /**
     * 获取用户基本信息
     * @param userId 用户ID
     * @param authorization Authorization头
     * @return 用户信息
     */
    @GetMapping("/{userId}/profile")
    Result<UserProfileResponse> getUserProfile(
            @PathVariable("userId") Long userId,
            @RequestHeader("Authorization") String authorization
    );

    /**
     * 实名认证状态响应
     */
    record RealNameStatusResponse(
            Boolean certified,
            String status // pending, approved, rejected
    ) {}

    /**
     * 用户信息响应
     */
    record UserProfileResponse(
            Long id,
            String nickname,
            String avatar,
            String realNameStatus
    ) {}
}
