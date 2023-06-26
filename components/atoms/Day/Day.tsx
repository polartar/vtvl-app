import styled from '@emotion/styled';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { isAfter, isBefore, isEqual } from 'date-fns';
import * as React from 'react';

const isBetween = (date: Date, startDate: Date, endDate: Date) => {
  return (isAfter(date, startDate) || isEqual(date, startDate)) && (isBefore(date, endDate) || isEqual(date, endDate));
};

interface CustomPickerDayProps extends PickersDayProps<Date> {
  dayIsBetween: boolean;
  isFirstDay: boolean;
  isLastDay: boolean;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay'
})<CustomPickerDayProps>(({ theme, dayIsBetween, isFirstDay, isLastDay }) => ({
  ...(dayIsBetween && {
    borderRadius: 0,
    backgroundColor: 'var(--primary-50)',
    color: 'var(--neutral-900)',
    '&:hover, &:focus': {
      color: 'var(--neutral-50)',
      backgroundColor: 'var(--primary-900)'
    }
  }),
  ...(isFirstDay && {
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
    backgroundColor: 'var(--primary-900)',
    color: 'var(--neutral-50)'
  }),
  ...(isLastDay && {
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
    backgroundColor: 'var(--primary-900)',
    color: 'var(--neutral-50)'
  }),
  '&:disabled, &[disabled]': {
    '&, &:hover, &:focus': {
      backgroundColor: 'transparent !important'
    }
  }
})) as React.ComponentType<CustomPickerDayProps>;

// A custom day render for the calendar pickers
// This will add highlights to the date range
const Day = (
  props: PickersDayProps<Date> & {
    selectedDay?: Date | null;
    selectedStartDate?: Date | null;
    selectedEndDate?: Date | null;
  }
) => {
  const { day, selectedDay = null, selectedStartDate, selectedEndDate, ...other } = props;

  console.log('DAY', props);

  if (selectedStartDate == null && selectedEndDate === null) {
    return <PickersDay day={day} {...other} />;
  }

  const start = selectedStartDate;
  const end = selectedEndDate;

  const dayIsBetween = start && end ? isBetween(day, start, end) : false;
  const isFirstDay = start ? isEqual(day, start) : false;
  const isLastDay = end ? isEqual(day, end) : false;

  return (
    <CustomPickersDay
      {...other}
      day={day}
      sx={dayIsBetween ? { px: 2.5, mx: 0 } : {}}
      dayIsBetween={dayIsBetween}
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
    />
  );
};

export default Day;
