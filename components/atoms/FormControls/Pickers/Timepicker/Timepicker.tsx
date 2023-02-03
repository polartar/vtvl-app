import { ConfigProvider } from 'antd';
import type { PickerTimeProps } from 'antd/lib/date-picker/generatePicker';
import * as React from 'react';

import Datepicker from '../Datepicker/Datepicker';

export type TimePickerProps = Omit<PickerTimeProps<Date>, 'picker'>;

const Timepicker = React.forwardRef<any, TimePickerProps>((props, ref) => (
  <ConfigProvider
    theme={{
      components: {
        DatePicker: {
          borderRadius: 9999,
          colorBgBase: 'red'
        }
      }
    }}>
    <Datepicker {...props} picker="time" mode={undefined} ref={ref} />
  </ConfigProvider>
));

Timepicker.displayName = 'Timepicker';

export default Timepicker;
