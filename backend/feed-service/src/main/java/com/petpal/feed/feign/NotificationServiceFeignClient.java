package com.petpal.feed.feign;

import com.petpal.feed.dto.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * 通知服务Feign客户端
 */
@FeignClient(name = "notification-service", path = "/api/v1/notifications")
public interface NotificationServiceFeignClient {

    /**
     * 发送站内通知
     * @param authorization Authorization头
     * @param request 通知请求
     * @return 结果
     */
    @PostMapping("/send")
    Result<Void> sendNotification(
            @RequestHeader("Authorization") String authorization,
            @RequestBody NotificationRequest request
    );

    /**
     * 通知请求
     */
    record NotificationRequest(
            Long userId,           // 接收用户ID
            String type,           // 通知类型: review_result, status_update
            String title,          // 通知标题
            String content,        // 通知内容
            String targetType,     // 目标类型: rescue, adoption
            Long targetId          // 目标ID
    ) {}
}
