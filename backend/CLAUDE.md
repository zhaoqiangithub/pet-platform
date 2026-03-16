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

### 测试配置文件（必须创建）

每个微服务必须创建 `src/test/resources/application.yml`：

```yaml
spring:
  config:
    activate:
      on-profile: test

  cloud:
    nacos:
      config:
        import-check:
          enabled: false
      discovery:
        enabled: false

  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
      - org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration

  datasource:
    url: jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE
    driver-class-name: org.h2.Driver
    username: sa
    password:

mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.nologging.NoLoggingImpl
```

### Controller测试示例

使用 @WebMvcTest 进行轻量级Controller测试：

```java
@WebMvcTest(RescueController.class)
class RescueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RescueService rescueService;

    @Test
    void publish_Success() throws Exception {
        when(rescueService.publish(anyLong(), any())).thenReturn(new Rescue());

        mockMvc.perform(post("/api/v1/rescue/publish")
                .header("X-User-Id", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"animalType\":\"cat\",\"healthStatus\":\"healthy\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}
```

### Service单元测试示例

```java
@ExtendWith(MockitoExtension.class)
class RescueServiceTest {

    @Mock
    private RescueMapper rescueMapper;

    @InjectMocks
    private RescueService rescueService;

    @Test
    void publish_Success() {
        when(rescueMapper.insert(any(Rescue.class))).thenReturn(1);

        Rescue result = rescueService.publish(userId, request);

        assertNotNull(result);
        verify(rescueMapper, times(1)).insert(any(Rescue.class));
    }
}
```

### 测试分层策略

| 层级 | 注解 | 速度 | 用途 |
|------|------|------|------|
| 单元测试 | @ExtendWith(MockitoExtension.class) | 快 | 验证Service业务逻辑 |
| Controller测试 | @WebMvcTest | 中 | 验证API端点 |
| 集成测试 | @SpringBootTest + TestContainers | 慢 | 验证完整业务流程 |

### 禁止偷懒行为

- 禁止：只写Service层测试，删除Controller测试
- 禁止：使用@SpringBootTest但不加外部依赖Mock
- 禁止：测试失败后跳过或删除测试用例
- 必须：每个Controller方法至少有一个测试用例
- 必须：使用正确的测试配置禁用外部依赖

### 已知测试陷阱

**@WebMvcTest 与 @FeignClient 冲突**

当服务使用 @EnableFeignClients 时，@WebMvcTest 会尝试加载 Feign 客户端，导致需要 Nacos/注册中心。

解决方案：
1. 使用 @MockBean  Mock 所有 Feign 客户端
2. 添加 @ActiveProfiles("test") 确保加载测试配置
3. 或者使用 @SpringBootTest(webEnvironment = WebEnvironment.MOCK)

```java
@WebMvcTest(RescueController.class)
@ActiveProfiles("test")
class RescueControllerTest {

    @MockBean
    private RescueService rescueService;

    @MockBean
    private UserServiceFeignClient userServiceFeignClient;

    @MockBean
    private NotificationServiceFeignClient notificationServiceFeignClient;
}
```

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
| 方法   | 路径                           | 描述            |
| ------ | ------------------------------ | --------------- |
| POST   | `/api/v1/users/register`       | 用户注册        |
| POST   | `/api/v1/users/login`          | 登录（返回JWT） |
| GET    | `/api/v1/users/profile`        | 获取个人信息    |
| PUT    | `/api/v1/users/profile`        | 更新个人信息    |
| GET    | `/api/v1/users/addresses`      | 地址列表        |
| POST   | `/api/v1/users/addresses`      | 新增地址        |
| PUT    | `/api/v1/users/addresses/{id}` | 更新地址        |
| DELETE | `/api/v1/users/addresses/{id}` | 删除地址        |

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

## 测试开发规范

 ### 开发流程
 1. **先编译主代码**：编写测试前，先执行 `mvn clean compile` 确保主代码无编译错误
 2. **编写测试代码**：使用与主代码相同的包路径
 3. **验证测试**：执行 `mvn test` 验证测试通过

 ### 测试文件组织
 - 单元测试：`src/test/java/` 目录
 - 测试资源配置：`src/test/resources/` 目录
 - 测试类命名：`{ClassName}Test.java`

 ### 避免常见错误
 - 确保主代码已编译（先运行 `mvn clean compile`）
 - 测试类的包路径需与被测试类一致
 - Mock 外部依赖（数据库、服务）
 - 使用 H2 内存数据库进行集成测试

 ### 运行测试
 ```bash
 # 编译主代码（必须先执行）
 cd backend/{service} && mvn clean compile

 # 运行测试
 cd backend/{service} && mvn test

 验证清单

 - 主代码编译无错误
 - 测试代码编译无错误
 - 所有测试用例通过
 - 测试覆盖核心业务逻辑