import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@ui';
import { cn } from '@ui/lib/utils';
import { format, subDays } from 'date-fns';
import React from 'react';
import { type DateRange } from 'react-day-picker';
import { MARK_AS_DATE } from 'shared';

const SM_SCREEN = 640;

const dateOptionsAsConst = ['Custom', 'Today', 'Last 7 days', 'Last 30 days'] as const;

export type DateOptions = (typeof dateOptions)[number];

const dateOptions = [...dateOptionsAsConst];

const handleConvertButtonToState: (dateOpt: string[]) => DateOptionItem[] = (dateOpt: string[]) => {
  return dateOpt.map((item) => ({ btnName: item as DateOptions, isChosen: false }));
};

type DateOptionItem = {
  btnName: DateOptions;
  isChosen: boolean;
};

type DatePickerWithRangeState = {
  buttons: DateOptionItem[];
  date?: DateRange;
  datePicked?: string;
  numberOfMonths: number;
};

const initDatePickerState: DatePickerWithRangeState = {
  buttons: handleConvertButtonToState(dateOptions),
  date: undefined,
  datePicked: '',
  numberOfMonths: 2,
};

type DatePickerWithRangeProps = {
  // dateRange?: string;
  popoverDefault?: React.ReactNode;
  handleClickApply?: (...args: any) => void;
  handleClickClear?: (...args: any) => void;
  handleClickChooseRange?: (value: string, isDate?: boolean) => void;
  onDatePickedChange?: (value: string) => void;
  isDropDown?: boolean;
  canClearOverApply?: boolean;
  datePickedProps?: string;
  formatDatePick?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export type DatePickerRef = {
  resetDatePicked: () => void;
  getCurDatePicking: () => string;
};

const DatePickerWithRange = React.forwardRef<DatePickerRef, DatePickerWithRangeProps>(
  (
    {
      className,
      handleClickChooseRange = (_value: string) => {},
      onDatePickedChange = (_value: string) => {},
      isDropDown,
      popoverDefault,
      canClearOverApply = false,
      datePickedProps,
      formatDatePick,
    },
    ref,
  ) => {
    const [datePickerState, setDatePickerState] = React.useState<DatePickerWithRangeState>({
      ...initDatePickerState,
      datePicked: datePickedProps,
      ...(datePickedProps && {
        date: {
          from: new Date(datePickedProps?.split(' - ')[0] as string),
          to: new Date(datePickedProps?.split(' - ')[1] as string),
        },
      }),
    });
    const btnRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < SM_SCREEN) {
          setDatePickerState((pre) => ({ ...pre, numberOfMonths: 1 }));
        } else {
          setDatePickerState((pre) => ({ ...pre, numberOfMonths: 2 }));
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    const getDatePicked = React.useCallback((date?: DateRange) => {
      if (date?.from) {
        if (date.to) {
          return `${format(date.from, `${formatDatePick || 'LLL dd yyyy'}`)} - ${format(
            date.to,
            `${formatDatePick || 'LLL dd yyyy'}`,
          )}`;
        }

        return format(date.from, `${formatDatePick || 'LLL dd yyyy'}`);
      }

      return undefined;
    }, []);

    const handleClickApply = React.useCallback(() => {
      handleClickChooseRange(datePickerState.datePicked || '', true);

      setDatePickerState((pre) => {
        return { ...pre, datePicked: getDatePicked(pre.date) };
      });

      btnRef.current?.click();
    }, [datePickerState.datePicked]);

    React.useEffect(() => {
      if (datePickerState.datePicked) {
        handleClickChooseRange(datePickerState.datePicked, true);

        onDatePickedChange(datePickerState.datePicked);
      }
    }, [datePickerState.datePicked]);

    const handleClickClear = React.useCallback(() => {
      if (canClearOverApply) handleClickChooseRange(datePickerState.datePicked || '', true);

      setDatePickerState((pre) => {
        const newButtons = [...pre.buttons].map((item) => ({
          ...item,
          isChosen: false,
        }));

        return {
          ...pre,
          buttons: [...newButtons],
          date: undefined,
          datePicked: undefined,
        };
      });
    }, [datePickerState.datePicked]);

    const handleSelectDate = React.useCallback((datePick?: DateRange) => {
      setDatePickerState((pre) => {
        const newButtons = [...pre.buttons].map((item) => {
          if (item.btnName === 'Custom') {
            return {
              ...item,
              isChosen: true,
            };
          }

          return { ...item, isChosen: false };
        });

        let newDatePickState: DatePickerWithRangeState = {
          ...pre,
          date: undefined,
          buttons: [...newButtons],
        };

        if (datePick) newDatePickState = { ...newDatePickState, date: { ...datePick } };

        return newDatePickState;
      });
    }, []);

    const handleClickBtnOption = React.useCallback((btnName: DateOptions) => {
      setDatePickerState((pre) => {
        let newDate: DateRange | undefined;
        const newButtons = [...pre.buttons].map((item) => {
          if (item.btnName === btnName) {
            return {
              ...item,
              isChosen: true,
            };
          }

          return { ...item, isChosen: false };
        });

        if (btnName === 'Today')
          newDate = {
            from: new Date(),
          };

        if (btnName === 'Last 7 days')
          newDate = {
            from: subDays(new Date(), 7),
            to: new Date(),
          };

        if (btnName === 'Last 30 days')
          newDate = {
            from: subDays(new Date(), 30),
            to: new Date(),
          };

        return {
          ...pre,
          buttons: [...newButtons],
          date: newDate ? { ...newDate } : undefined,
        };
      });
    }, []);

    React.useImperativeHandle(ref, () => ({
      resetDatePicked() {
        handleClickClear();
      },

      getCurDatePicking() {
        return getDatePicked(datePickerState.date) ? `${getDatePicked(datePickerState.date)}_${MARK_AS_DATE}` : '';
      },
    }));

    const buttonsChosen = React.useMemo(() => {
      return datePickerState.buttons.filter((item) => item.isChosen).map((item) => item.btnName);
    }, [datePickerState.buttons]);

    const getDatePickCElement = React.useMemo(() => {
      return (
        <>
          <div className={`no-scrollbar flex items-center justify-start gap-4 overflow-x-auto`}>
            {datePickerState.buttons.length > 0 &&
              datePickerState.buttons.map((item) => (
                <button
                  key={item.btnName}
                  className={`cursor-pointer whitespace-nowrap rounded-[24px] border px-4 py-1 text-center text-base transition ${
                    buttonsChosen.includes(item.btnName)
                      ? 'border-[#17262b] bg-[#485256] text-background hover:border-[#17262b] hover:bg-[#17262b]'
                      : 'border-[#e3e4e5] bg-[#f7f7f7] hover:border-[#c4c7c8] hover:bg-[#e3e4e5]'
                  }`}
                  onClick={() => {
                    handleClickBtnOption(item.btnName);
                    handleClickApply();
                  }}
                >
                  {item.btnName}
                </button>
              ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={datePickerState.date?.from}
            selected={datePickerState.date}
            onSelect={handleSelectDate}
            numberOfMonths={datePickerState.numberOfMonths}
            today={datePickedProps ? new Date(datePickedProps) : undefined}
            max={30}
          />
        </>
      );
    }, [datePickerState]);

    return (
      <>
        {isDropDown ? (
          <div className="px-6 pb-6 pt-1">{getDatePickCElement}</div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'justify-start text-left font-normal',
                  !datePickerState.date && 'text-muted-foreground',
                  className,
                )}
                ref={btnRef}
              >
                {datePickerState.datePicked ? datePickerState.datePicked : popoverDefault}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="rounded-[3px] p-6 shadow">
                {getDatePickCElement}
                <div className="mt-2 flex justify-end gap-6">
                  <button
                    className="h-[40px] cursor-pointer rounded-[3px] border border-[#c4c7c8] px-[calc(1.5rem-1px)] py-[0.5rem-1px] text-base font-medium transition hover:text-[#29ab51]"
                    onClick={handleClickClear}
                  >
                    Clear
                  </button>
                  <button
                    className="h-[40px] cursor-pointer rounded-[3px] border border-[#c4c7c8] bg-[#29ab51] px-[calc(1.5rem-1px)] py-[0.5rem-1px] text-base font-medium text-background transition hover:bg-[#248e4c]"
                    onClick={handleClickApply}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </>
    );
  },
);

export { DatePickerWithRange };
