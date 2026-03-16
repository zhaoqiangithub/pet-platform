package com.petpal.feed.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petpal.feed.model.StatusHistory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StatusHistoryMapper extends BaseMapper<StatusHistory> {
}
