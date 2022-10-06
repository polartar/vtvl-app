import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';

import vtvlTheme from './vtvlTheme';

addons.setConfig({
  // theme: themes.dark,
  theme: vtvlTheme
});
