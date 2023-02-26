// Node Imports
import { readFileSync } from 'fs';

// Classes
import Search from './Search';

// Types
import { Config } from '../@types/Config';

const CONFIG_PATH = '/etc/s/config.json'; // just config.json for dev

// Main Loop
(async () => {
    let config: Config;

    try {
        config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    } catch (e: any) {
        console.error(`Error reading config file: ${e.message}`);
        process.exit(1);
    }

    const s = new Search(process.argv.slice(2).join(' '), config);
    s.search()
})();
