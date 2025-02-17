import { format, subDays } from 'date-fns';
// eslint-disable-next-line import/no-named-default
// import { default as ReactECharts2 } from 'echarts-for-react';
import {
  BookmarkX,
  Box,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ListTodo,
  PauseCircle,
  Settings,
  Truck,
  Undo2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { OrderStatistic } from 'shared';
import type { DatePickerRef } from 'ui';
import { Card, CardContent, CardHeader, CardTitle, DatePickerWithRange, Label } from 'ui';
import { cn } from 'ui/lib/utils';

import { orderService } from '@/services';

// let ReactECharts = ReactECharts2;
// // @ts-ignore
// if (ReactECharts2.default) {
//   // @ts-ignore
//   ReactECharts = ReactECharts2.default;
// }

const dateOptionsAsConst = ['Today', 'Last 7 days', 'Last 30 days'] as const;

type DateOptions = (typeof dateOptions)[number];

const dateOptions = [...dateOptionsAsConst];

const handleConvertButtonToState = (dateOpt: DateOptions[]): DateOptionItem[] => {
  return dateOpt.map((item) => {
    if (item === 'Today') return { btnName: item, isChosen: true };

    return { btnName: item, isChosen: false };
  });
};

type DateOptionItem = {
  btnName: DateOptions;
  isChosen: boolean;
};

type AdminDashboardState = {
  buttons: DateOptionItem[];
  filterDate: string;
  orderStatistics: OrderStatistic;
};

const defaultOrderStatistic: OrderStatistic = {
  all: 0,
  pending: 0,
  processing: 0,
  onHold: 0,
  inProduction: 0,
  produced: 0,
  partially_produced: 0,
  packaged: 0,
  labeled: 0,
  in_transit: 0,
  // partially_delivered: 0,
  delivered: 0,
  done: 0,
  cancelled: 0,
  refunded: 0,
  // returned: 0,
};

const AdminDashboard = () => {
  const [adminDashboardState, setAdminDashboardState] = useState<AdminDashboardState>({
    buttons: handleConvertButtonToState(dateOptions),
    filterDate: `${format(new Date(), 'MM/dd/yyyy')}`,
    orderStatistics: { ...defaultOrderStatistic },
  });

  const datePickerRef = useRef<DatePickerRef>(null);

  const options = {
    grid: { top: 8, right: 8, bottom: 24, left: 36 },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        smooth: true,
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
  };

  const handleClickFilterDate = (value: string) => {
    setAdminDashboardState((pre) => ({
      ...pre,
      filterDate: value,
      buttons: pre.buttons.map((button) => ({
        ...button,
        isChosen: false,
      })),
    }));
  };

  const fetchStatistics = async (filterDate: string) => {
    const from = filterDate.split(' - ')[0];
    const to = filterDate.split(' - ')[1] || from;

    if (!from || !to) {
      // toast.error('')

      return;
    }

    const statisticsResponse = await orderService.getStatistics(from, to);
    if (!statisticsResponse.success || !statisticsResponse.data) {
      toast.error(statisticsResponse.message);

      return;
    }

    setAdminDashboardState((pre) => ({
      ...pre,
      orderStatistics: statisticsResponse.data || { ...defaultOrderStatistic },
    }));
  };

  useEffect(() => {
    if (adminDashboardState.filterDate) {
      fetchStatistics(adminDashboardState.filterDate);
    }
  }, [adminDashboardState.filterDate]);

  const handleClickBtnOption = (btnName: DateOptions) => {
    setAdminDashboardState((pre) => {
      const newButtons = [...pre.buttons].map((item) => {
        if (item.btnName === btnName) {
          return {
            ...item,
            isChosen: true,
          };
        }

        return { ...item, isChosen: false };
      });

      // to day
      const date = {
        from: new Date(),
        to: new Date(),
      };

      if (btnName === 'Last 7 days') date.from = subDays(new Date(), 7);

      if (btnName === 'Last 30 days') date.from = subDays(new Date(), 30);

      return {
        ...pre,
        buttons: [...newButtons],
        filterDate: `${format(date.from, 'MM/dd/yyyy')} - ${format(date.to, 'MM/dd/yyyy')}`,
      };
    });

    datePickerRef.current?.resetDatePicked();
  };

  return (
    <div className="w-full p-4">
      <div className="mb-6 flex w-[200px] rounded-[5px] border bg-white shadow">
        <div className="w-full">
          <a href="/orders" className="flex items-center p-3">
            <ChevronLeft />
            Go Back Home
          </a>
        </div>
      </div>
      <div className="mb-6 flex rounded-[5px] border bg-white shadow">
        <div className="flex flex-col items-center gap-3 overflow-x-auto md:flex-row">
          {adminDashboardState.buttons.length > 0 &&
            adminDashboardState.buttons.map((item) => (
              <div key={item.btnName} className="w-full p-3 md:w-auto">
                <button
                  key={item.btnName}
                  className={`flex h-full w-full gap-3 rounded-md px-4 py-[12px] ${
                    adminDashboardState.buttons.find((button) => button.btnName === item.btnName)?.isChosen
                      ? 'bg-[118deg] bg-gradient-to-r from-[rgba(247,176,23,.7)] to-purple-500 text-white shadow-[rgba(115,103,240,.6)] transition duration-300'
                      : 'border border-primary bg-white text-color'
                  }`}
                  onClick={() => {
                    handleClickBtnOption(item.btnName);
                  }}
                >
                  {item.btnName}
                </button>
              </div>
            ))}

          <div className="w-full p-3 md:w-auto">
            <div
              className={cn(
                'flex h-full w-full items-center gap-3 rounded-md bg-[118deg] bg-gradient-to-r from-[rgba(115,103,240,.7)] to-purple-500 px-4 py-[12px] text-white shadow-md shadow-[rgba(115,103,240,.6)] transition duration-300 ',
              )}
            >
              <Settings />
              <DatePickerWithRange
                // datePickedProps={format(new Date(), 'MM/dd/yyyy')}
                popoverDefault={<p className="w-full text-center">Custom</p>}
                formatDatePick="MM/dd/yyyy"
                className={cn(
                  'hover:text-color-white flex h-[28px] w-full min-w-[96px] items-center gap-3 rounded-md bg-[#dedbfb] px-2 py-1 text-[#7367f0] transition duration-300',
                )}
                onDatePickedChange={handleClickFilterDate}
                ref={datePickerRef}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row">
        <div className="w-full md:w-1/5">
          <Card className="h-full w-full">
            <CardHeader>
              <CardTitle>
                <div className="flex justify-center">
                  <div className="flex items-center justify-center rounded-full bg-[#28c76f26] p-3">
                    <Box className="text-[#28c76f]" />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Label className="text-4xl font-bold" admin-total-statistic="true">
                  {adminDashboardState.orderStatistics.total}
                </Label>
                <p className="font-medium text-color">Orders</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-4/5">
          <Card className="h-full w-full p-[14px]">
            <CardHeader>
              <CardTitle>
                <p className="text-center md:text-start">Order Statistics</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:py-[14px] md:pt-[24px]">
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-7">
                <div className="flex items-center">
                  <div>
                    <div>
                      <div className="flex items-center justify-center rounded-full bg-[#28c76f26] p-3">
                        <ListTodo className="text-[#28c76f]" />
                      </div>
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.pending}</p>
                    <p className="truncate text-[12px] font-normal">Pending</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#ff9f4326] p-3">
                      <PauseCircle className="text-[#ff9f43]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.processing}</p>
                    <p className="truncate text-[12px] font-normal">Processing</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#7367f026] p-3">
                      <Check className="text-[#7367f0]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.inProduction}</p>
                    <p className="truncate text-[12px] font-normal">In production</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#28c76f26] p-3">
                      <CheckCircle2 className="text-[#28c76f]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.produced}</p>
                    <p className="truncate text-[12px] font-normal">Produced</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#00cfe826] p-3">
                      <Truck className="text-[#00cfe8]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.in_transit}</p>
                    <p className="truncate text-[12px] font-normal">In Transit</p>
                  </div>
                </div>
                {/* <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#b5dbb4] p-3">
                      <Truck className="text-[#1D741B]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">
                      {adminDashboardState.orderStatistics.partially_delivered}
                    </p>
                    <p className="truncate text-[12px] font-normal">Partially delivered</p>
                  </div>
                </div> */}
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#ea545526] p-3">
                      <Truck className="text-[#ea5455]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.delivered}</p>
                    <p className="truncate text-[12px] font-normal">Delivered</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#7367f026] p-3">
                      <CheckCircle className="text-[#ea5455]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.done}</p>
                    <p className="truncate text-[12px] font-normal">Done</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#7367f026] p-3">
                      <BookmarkX className="text-[#ea5455]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.cancelled}</p>
                    <p className="truncate text-[12px] font-normal">Cancelled</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#7367f026] p-3">
                      <Undo2 className="text-[#ea5455]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.refunded}</p>
                    <p className="truncate text-[12px] font-normal">Refunded</p>
                  </div>
                </div>
                {/* <div className="flex items-center">
                  <div>
                    <div className="flex items-center justify-center rounded-full bg-[#7367f026] p-3">
                      <CornerDownLeft className="text-[#ea5455]" />
                    </div>
                  </div>
                  <div className="ml-[14px] w-full overflow-hidden">
                    <p className="text-[20px] font-semibold">{adminDashboardState.orderStatistics.returned}</p>
                    <p className="truncate text-[12px] font-normal">Returned</p>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Delivered Packages</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <ReactECharts option={options} /> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { AdminDashboard };
