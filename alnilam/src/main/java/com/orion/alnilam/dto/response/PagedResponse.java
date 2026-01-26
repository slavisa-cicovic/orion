package com.orion.alnilam.dto.response;

import java.util.List;
import lombok.Getter;

@Getter
public class PagedResponse<T> {
    private final List<T> items;
    private final int page;
    private final int pageSize;
    private final long total;

    public PagedResponse(List<T> items, int page, int pageSize, long total) {
        this.items = items;
        this.page = page;
        this.pageSize = pageSize;
        this.total = total;
    }
}
