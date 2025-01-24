import type { PaginationState } from '@tanstack/react-table';
import axios from 'axios';
import saveAs from 'file-saver';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Dialog, DialogContent, DialogTrigger, Pagination, Search, TooltipFileName } from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import type { Mockup } from '@/interfaces/mockup';
import { mockupService } from '@/services/mockup';

const MyMockup = () => {
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [totalMockups, setTotalMockups] = useState(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);

  const handleDownload = async (mockupId: string, fileName: string) => {
    const downloadMockupResponse = await mockupService.downloadMockup(mockupId);
    if (!downloadMockupResponse.success || !downloadMockupResponse.data) {
      toast.error(downloadMockupResponse.message);

      return;
    }

    const { signature, encryptedUrl, expiresAt, cdn } = downloadMockupResponse;

    try {
      const downloadResponse = await axios.post<Blob>(
        cdn,
        { encryptedUrl, expiresAt },
        {
          responseType: 'blob',
          headers: {
            signature,
          },
        },
      );
      if (downloadResponse && downloadResponse.data) {
        saveAs(downloadResponse.data, fileName);
      }
    } catch (error) {
      let errorMessage = 'Unknown Error';
      if (axios.isAxiosError<Blob>(error)) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const mockupResponse = await mockupService.getMockups(pagination, searchValue);

      if (!mockupResponse.success || !mockupResponse.data) {
        toast.error(mockupResponse.message);

        return;
      }

      setMockups(mockupResponse.data);
      setTotalMockups(mockupResponse?.total || 0);
      setIsLoading(false);
    })();
  }, [searchValue, pagination]);

  return (
    <div className="w-full p-4">
      <div className="block rounded-[5px] border bg-white px-6 py-4 shadow-md md:flex">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">My Mockups</h2>
      </div>
      <div className="mt-6 h-full w-full">
        <div className="rounded-sm border bg-white shadow-md">
          <div className="border-b-[1px] border-solid border-[#e3e4e5] px-4 pb-4">
            <Search placeholder="Search by name" loading={isLoading} onSearch={setSearchValue} />
          </div>
          <div className="flex flex-wrap items-center p-4">
            {mockups?.map((mockup) => {
              return (
                <div key={mockup._id} className="mb-8 w-full px-4 sm:w-1/2 md:w-1/3 lg:w-1/4">
                  <div className="p-1 hover:bg-slate-100">
                    <Dialog>
                      <DialogTrigger className="max-h-full w-full">
                        <div className="relative rounded-[3px] border border-solid border-[#e3e4e5] pb-[100%]">
                          <img
                            className="absolute top-0 h-full w-full rounded-[3px] border border-solid border-[#e3e4e5] bg-[#f7f7f7] object-cover object-center"
                            src={mockup.file.preview}
                          />
                        </div>
                        <div>
                          <TooltipFileName fileName={mockup.fileName} />
                          <p>{`${mockup.width}px x ${mockup.height}px`}</p>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[841px]">
                        <div className="flex w-full flex-col p-[10px] md:flex-row">
                          <div className="relative h-[47vh] w-full md:w-2/3">
                            <img
                              className="absolute top-0 h-full w-full rounded-[3px] border border-solid border-[#e3e4e5] bg-[#f7f7f7] object-contain object-center"
                              src={mockup.file.preview}
                            />
                          </div>
                          <div className="flex w-full flex-col justify-normal gap-2 py-5 md:w-1/3 md:justify-between md:px-5 md:py-0">
                            <div>
                              <p>{mockup.fileName}</p>
                              <p>{`${mockup.width}px x ${mockup.height}px`}</p>
                            </div>
                            <div>
                              <Button
                                onClick={() => handleDownload(mockup._id, mockup.fileName)}
                                className="border border-[#c4c7c8] bg-white text-color md:w-full"
                              >
                                DownLoad
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}
            <div className="w-full">
              <Pagination
                name="Mockups"
                total={totalMockups}
                pagination={pagination}
                showInputPagination={{ showInput: true, showTotalOfPage: true }}
                setPagination={setPagination}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                count={mockups.length}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MyMockup };
