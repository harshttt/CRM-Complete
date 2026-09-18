import React, { useEffect } from "react";
import { Pagination, Tag } from "antd";
import { parseAsInteger, useQueryState } from "nuqs";

export default function MyPagination(props) {
  const {qData = {}, DEFAULT_NUQS_CONFIG = {}, hideTotal, total = 0, onChange: onChangeProp, pageSizeOptions = ["10", "20", "50", "100"], size = "small"} = props;

  const _hideTotal = hideTotal === undefined ? false : hideTotal;

  // safe parser (guard in case DEFAULT_NUQS_CONFIG is undefined)
  const parser = parseAsInteger && parseAsInteger.withOptions ? parseAsInteger.withOptions(DEFAULT_NUQS_CONFIG) : parseAsInteger;

  const [page, setPage] = useQueryState("page", parser.withDefault(Number(qData.page ?? 1)));
  const [pageLimit, setPageLimit] = useQueryState("limit", parser.withDefault(Number(qData.limit ?? 20)));

  // Ensure numeric values
  const currentPage = Number.isFinite(Number(page)) ? Number(page) : 1;
  const currentLimit = Number.isFinite(Number(pageLimit)) ? Number(pageLimit) : 20;

  // When parent qData changes externally, sync query state (prevents drift)
  useEffect(() => {
    if (qData.page && Number(qData.page) !== currentPage) {
      setPage(Number(qData.page));
    }
    if (qData.limit && Number(qData.limit) !== currentLimit) {
      setPageLimit(Number(qData.limit));
    }
  }, [qData.page, qData.limit]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / currentLimit));

  // clamp page if it goes beyond totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages);
      onChangeProp?.({ ...(qData || {}), page: totalPages, limit: currentLimit });
    }
  }, [total, currentLimit, totalPages]);

  const handleChange = (newPage, newPageSize) => {
    // pageSize changed (user changed page size)
    if (currentLimit !== newPageSize) {
      // when size changes, reset to page 1 (common UX)
      setPage(1);
      setPageLimit(newPageSize);
      onChangeProp?.({ ...(qData || {}), page: 1, limit: newPageSize });
      return;
    }

    // only page changed
    setPage(newPage);
    // keep the existing page size (currentLimit)
    onChangeProp?.({ ...(qData || {}), page: newPage, limit: currentLimit });
  };

  // AntD expects showTotal(total, range)
  const showTotal = (t, range) => {
    if (_hideTotal) return null;
    if (!t) return null;
    const [start = 0, end = 0] = range || [];
    // clamp end to total
    const safeEnd = Math.min(end, t);
    return <Tag>{`Showing ${start} - ${safeEnd} out of ${t}`}</Tag>;
  };

  if (!total || total <= 0) return null;

  return ( <Pagination total={total} showTotal={showTotal} pageSize={currentLimit} current={currentPage} onChange={handleChange} showSizeChanger={true} showQuickJumper pageSizeOptions={pageSizeOptions} size={size} /> );
}
