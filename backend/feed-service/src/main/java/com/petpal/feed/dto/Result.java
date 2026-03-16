package com.petpal.feed.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.io.Serializable;
import java.time.Instant;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer code;
    private String message;
    private T data;
    private Instant timestamp;

    public Result() {
        this.timestamp = Instant.now();
    }

    public Result(Integer code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = Instant.now();
    }

    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now();
    }

    public static <T> Result<T> success() {
        return new Result<>(0, "success");
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(0, "success", data);
    }

    public static <T> Result<T> success(String message, T data) {
        return new Result<>(0, message, data);
    }

    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(1, message);
    }
}
