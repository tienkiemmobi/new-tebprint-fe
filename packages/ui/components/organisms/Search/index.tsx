import { Button, Input } from '@ui';
import { Loader2, SearchIcon, XCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'shared';

type SearchProps = {
  searchValue?: string;
  placeholder?: string;
  className?: string;
  searchContent?: React.ReactNode;
  onSearch?: (param: string) => void;
  loading?: boolean;
};

const Search: React.FC<SearchProps> = ({
  placeholder = 'Search for products, categories...',
  className = 'mt-[24px]',
  searchContent,
  onSearch,
  loading,
  searchValue,
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchText = useDebounce(searchText, 2000);

  const handleClearSearch = () => {
    if (!onSearch) {
      return;
    }
    // onSearch('');
    setSearchText('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (searchValue) {
      setSearchText(searchValue);
    }
  }, [searchValue]);

  useEffect(() => {
    const handleSearch = (value: string) => {
      if (!onSearch || (!/\S/.test(value) && value.length)) {
        return;
      }
      onSearch(value.trim());
    };
    if (!initialLoad) {
      handleSearch(debouncedSearchText);
    } else {
      setInitialLoad(false);
    }
  }, [debouncedSearchText]);

  return (
    <div
      className={`flex w-full items-center justify-between gap-10 focus:border-2 focus:border-primary sm:justify-between md:w-full md:justify-between lg:justify-between ${className}`}
    >
      <div className="w-full sm:w-full md:w-full lg:w-full">
        <div className="flex h-12 w-full items-center gap-5 md:items-center md:gap-2 lg:w-full">
          <div className="relative flex h-full w-full items-center gap-5 md:items-center md:gap-2 lg:w-full">
            <Button className="absolute left-0 h-12 bg-transparent text-color hover:bg-transparent">
              <SearchIcon width="24px" height="48px" />
            </Button>
            <Input
              ref={inputRef}
              value={searchText}
              className="mx-[1px] h-[48px] w-[calc(100%-2px)] rounded-[24px] border-[#C4C7C8] bg-[#E8F0FE] px-16 required:shadow focus:bg-white"
              placeholder={placeholder}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {!!searchText && !loading && (
              <Button
                onClick={handleClearSearch}
                className="absolute right-0 h-12 bg-transparent text-color hover:bg-transparent"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
            {loading && (
              <Button className="absolute right-0 h-12 bg-transparent text-color hover:bg-transparent">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            )}
          </div>
          {searchContent}
        </div>
      </div>
    </div>
  );
};

export { Search };
