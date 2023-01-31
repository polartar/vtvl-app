import generatePicker from 'antd/lib/date-picker/generatePicker';
import 'antd/lib/date-picker/style/index';
import dateFnsGenerateConfig from 'rc-picker/lib/generate/dateFns';

const Datepicker = generatePicker<Date>(dateFnsGenerateConfig);

export default Datepicker;
