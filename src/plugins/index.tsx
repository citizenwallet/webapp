/**
 * How to create a new plugin?
 * 
 * 1. Create a new file in the plugins folder (copy paste an existing one, real artists steal)
 * 2. Import the icon you want to use from the fontawesome library (https://fontawesome.com/search?m=free&q=)
 * 3. Provide a frameSrc. This is the URL of the plugin hosted by you. It will be loaded with the following URL params: ?account=0x1234&redirectUrl= (the redirectUrl is the URL of the wallet, so the plugin can redirect back to the wallet after the user is done)
 * 4. Import the new file here and add it to the plugins array
 */

import topup from './topup';
import mint from './mint';
import dashboard from './dashboard';

const plugins = [topup, mint, dashboard];

export default plugins;
