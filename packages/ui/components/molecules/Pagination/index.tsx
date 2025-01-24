import type { PaginationState } from '@tanstack/react-table';
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
// eslint-disable-next-line import/no-named-default
import { default as ReactPaginate2 } from 'react-paginate';

let ReactPaginate = ReactPaginate2;
// @ts-ignore
if (ReactPaginate2.default) {
  // @ts-ignore
  ReactPaginate = ReactPaginate2.default;
}

type ShowInputPagination = {
  showInput?: boolean;
  showTotalOfPage?: boolean;
};

export type ParamUrl = {
  keyParamUrl: string;
  valueParamUrl: string;
};
export type PaginationProps = {
  name: string;
  total: number;
  count?: number;
  isOffline?: boolean;
  searchValue?: string;
  paramUrl?: ParamUrl[];
  showViewPerPage?: boolean;
  orderGroupParamUrl?: string;
  pagination: PaginationState;
  singleItemParamUrl?: boolean;
  showInputPagination?: ShowInputPagination;
  setSearchValue?: Dispatch<SetStateAction<string>>;
  setIsParamLoaded?: Dispatch<SetStateAction<boolean>>;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  setParamUrl?: React.Dispatch<React.SetStateAction<ParamUrl[]>>;
  setOrderGroupParamUrl?: React.Dispatch<React.SetStateAction<string>>;
  pageOptions: number[];
};

const Pagination = (props: PaginationProps) => {
  const {
    name,
    total,
    pagination,
    searchValue,
    setPagination,
    showViewPerPage = true,
    showInputPagination,
    setSearchValue,
    paramUrl,
    count,
    setIsParamLoaded,
    singleItemParamUrl,
    isOffline = false,
    orderGroupParamUrl,
    setOrderGroupParamUrl,
    pageOptions = [20, 40, 60, 100],
  } = props;

  console.log('🚀 ~ Pagination ~ pageOptions:', pageOptions);

  const handlePaginationChange = (data: Record<string, number>) => {
    const { selected } = data;

    return setPagination((pre) => ({
      ...pre,
      pageIndex: Number(selected) + 1,
    }));
  };

  const handlePageSizeChange = (value: string, key: keyof PaginationState) => {
    return setPagination((pre) => ({
      ...pre,
      [key]: value,
    }));
  };

  const handleGoToPage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = Number(e.target.value);
    let inputPageIndex: number;

    if (inputValue > 0) {
      if (inputValue < Math.ceil(total / pagination.pageSize)) {
        inputPageIndex = inputValue - 1;
      } else {
        inputPageIndex = Math.ceil(total / pagination.pageSize) - 1;
      }
    } else {
      inputPageIndex = 0;
    }

    setPagination((pre) => ({
      ...pre,
      pageIndex: inputPageIndex,
    }));
  };

  useEffect(() => {
    if (isOffline) return;

    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const pageIndex = url.searchParams.get('page') || pagination.pageIndex;
    let limit = url.searchParams.get('limit') || pagination.pageSize;
    const searchValueParam = url.searchParams.get('search') || '';
    const orderGroupValueParam = url.searchParams.get('orderGroupId') || '';

    if (Number(limit) > pagination.pageSize) {
      limit = String(pageOptions[0]);
    }

    if (setIsParamLoaded) {
      setIsParamLoaded(true);
    }

    setPagination((prev) => ({
      ...prev,
      pageIndex: Number(pageIndex),
      pageSize: Number(limit),
    }));

    if (orderGroupValueParam && setOrderGroupParamUrl) {
      setOrderGroupParamUrl(orderGroupValueParam);
    }

    if (!setSearchValue || !searchValueParam) {
      return;
    }
    setSearchValue(searchValueParam);
  }, []);

  useEffect(() => {
    if (isOffline) return;

    const params = [];
    if (paramUrl && paramUrl?.length > 0) {
      paramUrl.forEach((param) => {
        if (!param.valueParamUrl) {
          return;
        }
        params.push(`${param.keyParamUrl}=${param.valueParamUrl}`);
      });
    }
    if (pagination.pageIndex > 1) {
      params.push(`page=${pagination.pageIndex}`);
    }
    if (singleItemParamUrl) {
      params.push(`singleItem=true`);
    }

    if (orderGroupParamUrl) {
      params.push(`orderGroupId=${orderGroupParamUrl}`);
    }

    if (pagination.pageSize > 20) {
      params.push(`limit=${pagination.pageSize}`);
    }

    if (searchValue) {
      params.push(`search=${searchValue}`);
    }

    if (params.length > 0) {
      window.history.replaceState('', '', `?${params.join('&')}`);
    } else {
      window.history.replaceState('', '', window.location.href.split('?')[0]);
    }
  }, [pagination.pageIndex, pagination.pageSize, searchValue, paramUrl, singleItemParamUrl, orderGroupParamUrl]);

  return (
    <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      {showViewPerPage && (
        <div className="mr-[130px] flex items-center gap-2 md:w-1/3">
          <span>View</span>
          <div>
            <Select
              defaultValue={`${pagination?.pageSize}`}
              value={`${pagination?.pageSize}`}
              onValueChange={(value: string) => {
                handlePageSizeChange(value, 'pageSize');
              }}
            >
              <SelectTrigger disabled={total < pageOptions[0]!}>
                <SelectValue placeholder={pageOptions[0]} className="pr-10" />
              </SelectTrigger>
              <SelectContent>
                {pageOptions.map((pageSize) => {
                  console.log(pageSize);

                  return (
                    <SelectItem key={pageSize} disabled={total < pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <span>{name} per page</span>
        </div>
      )}

      {showInputPagination && (
        <p className="flex items-center gap-1 md:w-1/3 md:text-center">
          {showInputPagination.showTotalOfPage && (
            <span>
              {' '}
              {count} of {total} {name}
            </span>
          )}
          {showInputPagination.showTotalOfPage && showInputPagination.showInput ? '|' : ''}
          {showInputPagination.showInput && (
            <Input
              type="number"
              min={1}
              defaultValue={1}
              max={Math.ceil(total / pagination.pageSize)}
              onChange={handleGoToPage}
              className="w-16 rounded border p-1"
            />
          )}
        </p>
      )}

      <div className="md:flex md:w-1/3 md:justify-end">
        <ReactPaginate
          previousLabel={<ChevronLeft />}
          nextLabel={<ChevronRight />}
          forcePage={pagination.pageIndex - 1}
          breakLabel="..."
          breakLinkClassName="page-link"
          pageCount={Math.ceil(total / pagination.pageSize)}
          pageRangeDisplayed={4}
          marginPagesDisplayed={2}
          onPageChange={handlePaginationChange}
          containerClassName="pagination justify-content-center"
          pageClassName="font-bold w-7 h-7 cursor-pointer flex items-center justify-center border border-transparent mx-1"
          previousClassName="font-bold w-7 h-7 cursor-pointer flex items-center justify-center border border-transparent"
          nextClassName="font-bold w-7 h-7 cursor-pointer flex items-center justify-center border border-transparent"
          pageLinkClassName="w-full h-full text-center"
          disabledClassName="text-muted-foreground"
          activeClassName="!border-primary rounded-[3px] bg-background text-primary"
          className="flex items-center"
        />
      </div>
    </div>
  );
};

export { Pagination };
