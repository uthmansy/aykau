"use client";

import { usePagination } from "react-instantsearch";
import { Pagination as AntPagination } from "antd";

export default function AlgoliaPagination() {
  const { currentRefinement, nbPages, refine } = usePagination();

  if (nbPages <= 1) return null;

  return (
    <div className="flex justify-center pt-8">
      <AntPagination
        current={currentRefinement + 1}
        total={nbPages * 12}
        pageSize={12}
        onChange={(page) => refine(page - 1)}
        showSizeChanger={false}
      />
    </div>
  );
}
