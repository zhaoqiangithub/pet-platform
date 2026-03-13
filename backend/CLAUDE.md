# 后端模块 - 微服务最佳实践

## 职责
定义所有微服务通用的开发规范、代码结构、测试策略、部署要求。

## 技术栈（所有服务共享）
- **基础框架**：Spring Boot 3.2 + Spring Cloud 2023
- **服务治理**：Spring Cloud Alibaba Nacos（注册中心/配置中心）
- **网关**：Spring Cloud Gateway
- **服务调用**：OpenFeign + Resilience4j
- **消息队列**：Spring Kafka
- **数据库**：PostgreSQL 16 + MyBatis-Plus
- **缓存**：Spring Cache + Redis
- **安全**：Spring Security + OAuth2（JWT）
- **文档**：SpringDoc OpenAPI 3
- **构建**：Maven + Jib（容器镜像）
- **测试**：JUnit 5 + Mockito + TestContainers + Spring Cloud Contract

## 通用微服务结构
每个微服务遵循以下结构：
{service-name}/
├── pom.xml
├── src/main/java/com/petpal/{service}/
│ ├── controller/ # REST控制器
│ ├── service/ # 业务逻辑
│ ├── repository/ # 数据访问（MyBatis Mapper）
│ ├── model/ # 实体类（POJO）
│ ├── dto/ # 数据传输对象
│ ├── config/ # 配置类
│ ├── constant/ # 常量
│ ├── util/ # 工具类
│ └── {Service}Application.java
├── src/main/resources/
│ ├── mapper/ # MyBatis XML映射（可选）
│ └── application.yml
├── src/test/
└── Dockerfile

text

## API设计规范
- **路径**：`/api/v1/{resource}`（复数）
- **方法**：GET（查询）、POST（创建）、PUT（全量更新）、PATCH（部分更新）、DELETE（删除）
- **请求体**：JSON，使用DTO接收
- **响应**：统一封装`Result<T>`：
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {},
    "timestamp": "2026-03-14T12:00:00Z"
  }
错误码：每个服务分配1000个区间

user-service: 10000-10999

pet-service: 11000-11999

product-service: 12000-12999

order-service: 13000-13999

appointment-service: 14000-14999

consult-service: 15000-15999

feed-service: 16000-16999

notification-service: 17000-17999

网关通用错误: 1000-1999

开发规范
分层职责
Controller：参数验证、权限检查、调用Service、返回响应（≤20行）

Service：核心业务逻辑、事务管理

Repository：数据库操作（MyBatis Mapper），只包含SQL相关逻辑

异常处理
所有服务实现@RestControllerAdvice，统一处理异常。

业务异常继承RuntimeException，定义错误码。

示例：

java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusiness(BusinessException e) {
        return Result.error(e.getCode(), e.getMessage());
    }
}
日志规范
使用SLF4j + Logback

日志级别：开发DEBUG，生产INFO

关键操作打印审计日志（用户ID、操作、结果）

异常日志打印完整堆栈（ERROR级别）

数据库规范
主键：雪花算法（IdWorker）

字段：create_time、update_time自动填充，逻辑删除字段deleted（0/1）

索引：经常查询的字段加索引，联合索引注意顺序

分表：订单、消息等大表按月分表（通过ShardingSphere或应用层路由）

缓存规范
使用Spring Cache注解（@Cacheable, @CacheEvict）

缓存Key设计：serviceName:methodName:参数

Redis序列化：JSON（方便跨服务查看）

消息队列规范
使用Kafka，Topic命名：pet.{service}.{event}

消息体：JSON，包含事件ID、时间戳、数据

消费端必须幂等（通过事件ID去重）

测试规范
单元测试：覆盖service层，使用Mockito。

集成测试：@SpringBootTest + TestContainers，测试完整API。

契约测试：Spring Cloud Contract，确保服务间接口兼容。

性能测试：JMeter脚本放在src/test/jmeter。

安全规范
认证：OAuth2 JWT，网关统一鉴权，微服务内部通过X-User-Id头传递用户信息。

敏感数据：手机号、身份证等加密存储（AES），日志脱敏。

防SQL注入：使用MyBatis参数绑定，禁止${}拼接。

部署规范
容器镜像：使用Jib构建，基础镜像eclipse-temurin:21-jre-alpine。

K8s部署：每个服务对应一个Deployment + Service + ConfigMap + Secret，Ingress暴露网关。

环境隔离：命名空间dev、test、prod，资源配额严格限制。

滚动更新：配置readinessProbe和livenessProbe，确保零宕机发布。

常用命令
bash
# 编译所有服务
mvn clean package

# 启动单个服务（开发）
cd user-service && mvn spring-boot:run

# 构建镜像
cd user-service && mvn jib:build -Dimage=myregistry/pet-user-service

# 运行测试（单个服务）
cd user-service && mvn test

# 运行契约测试
mvn contract:test
引用文档
API契约：@../docs/api-contracts/

架构决策：@../docs/decisions/

K8s配置：@../k8s/

text

---

### 4. 微服务示例：`/backend/user-service/CLAUDE.md`

```markdown
# 用户服务 (user-service)

## 职责
管理用户注册、登录、个人信息、地址管理、认证授权。

## 数据库
- 数据库名：`pet_user`
- 主要表：
  - `t_user` (id, phone, password_hash, nickname, avatar, status, create_time, update_time, deleted)
  - `t_user_address` (id, user_id, receiver, phone, province, city, district, detail, is_default)

## API端点（参考OpenAPI契约）
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/v1/users/register` | 用户注册 |
| POST | `/api/v1/users/login` | 登录（返回JWT） |
| GET  | `/api/v1/users/profile` | 获取个人信息 |
| PUT  | `/api/v1/users/profile` | 更新个人信息 |
| GET  | `/api/v1/users/addresses` | 地址列表 |
| POST | `/api/v1/users/addresses` | 新增地址 |
| PUT  | `/api/v1/users/addresses/{id}` | 更新地址 |
| DELETE | `/api/v1/users/addresses/{id}` | 删除地址 |

完整契约见：`@../../docs/api-contracts/user-service.yaml`

## 特殊规则
- 密码使用BCrypt加密存储。
- 登录成功后返回JWT，有效期7天。
- 手机号唯一性校验。
- 用户状态：0-正常，1-禁用，2-未验证。

## 本地开发
```bash
# 启动（需先启动Nacos、PostgreSQL）
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 测试
mvn test

# 构建镜像
mvn jib:build -Dimage=myregistry/pet-user-service
依赖的其他服务
无（独立服务，但会调用通知服务发送验证码）