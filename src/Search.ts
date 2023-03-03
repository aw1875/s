// External Imports
import chalk from 'chalk';

// Node Imports
import { stdout } from 'process';
import readline from 'readline';
import { exec } from 'child_process';

// Search Engines
import DuckDuckGo from './DuckDuckGo';
import Google from './Google';

// Types
import { SearchResult } from '../@types/SearchResult';
import { Config } from '../@types/Config';

export default class Search {
    // Private Variables
    private query: string;
    private searchPage: number;
    private page: number;
    private spinnerTimer: NodeJS.Timeout | null;
    private selectedIndex: number;
    private config: Config;

    // Public Variables
    results: SearchResult[];

    private redrawResults(): void {
        console.clear();

        // Show Controls
        console.log('****************************************************************');
        console.log(`*                          ${chalk.bold.italic('Controls')}                            *`);
        console.log('*                                                              *');
        console.log('* j - down                                              k - up *')
        console.log('* n - next page                              p - previous page *');
        console.log('* return/space - open                             q/esc - quit *');
        console.log('****************************************************************');

        console.log(`${this.config.searchEngine === 'google' ? 'Google' : 'DuckDuckGo'} results for ${chalk.blue(this.query)} (page ${this.page} / ${Math.ceil(this.results.length / this.config.itemsPerPage)})\n`);

        // Show Results
        const startIndex = (this.page - 1) * this.config.itemsPerPage;
        const endIndex = startIndex + this.config.itemsPerPage;
        const pageResults = this.results.slice(startIndex, endIndex);

        pageResults.forEach((r, i) => {
            const index = startIndex + i;
            const arrow = this.selectedIndex === index ? ` ${chalk.green('\ue602')} ` : '   ';
            console.log(`${arrow}${r.title}`);
            console.log(`${' '.repeat(3)}${r.link}`);
            console.log(`${' '.repeat(3)}${r.snippet}\n`);
        });
    }

    constructor(query: string, config: Config) {
        this.query = query;
        this.searchPage = 0;
        this.page = 1;
        this.spinnerTimer = null;
        this.selectedIndex = 0;
        this.config = config;
        this.results = [];
    }

    resolve: ((value: SearchResult | PromiseLike<SearchResult>) => void) | undefined;

    async search(): Promise<void> {
        const s = this.config.searchEngine == 'google' ? new Google() : new DuckDuckGo();
        this.startSpinner();

        // Get all results until we've reached the config amount of items to find
        while (s.results.length <= this.config.results - this.config.itemsPerPage) {
            await s.search(this.query, this.searchPage, this.config.sites);
            this.searchPage++;
        }

        this.results = s.results;
        this.stopSpinner();

        setTimeout(() => this.showResults(), 1000)
    }

    startSpinner(): void {
        const characters = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        const cursorEsc = {
            hide: '\u001B[?25l',
            show: '\u001B[?25h',
        };
        stdout.write(cursorEsc.hide);

        let i = 0;
        this.spinnerTimer = setInterval(() => {
            stdout.write(`\r${chalk.blue(characters[i++])} Searching for: ${chalk.cyan(this.query)}`);
            i = i >= characters.length ? 0 : i;
        }, 150);
    }

    stopSpinner(): void {
        if (this.spinnerTimer) {
            clearInterval(this.spinnerTimer);
            stdout.write("\r".padEnd(stdout.columns - 1));
            stdout.write(`\r${chalk.green('\uf00c')} Search completed`);
            stdout.write("\n");
            stdout.write("\r");
            stdout.write("\u001B[?25h");
            this.spinnerTimer = null;
        }
    }

    async showResults(): Promise<SearchResult> {
        // Create interface for interactive shell
        const rl = readline.createInterface({
            input: process.stdin,
            output: undefined,
        });

        // Handle keypress events and delegate appropriately
        const handleKeypress = async (_: string, key: any) => {
            try {
                if (key.name === "j") {
                    if (this.selectedIndex < ((this.page - 1) * this.config.itemsPerPage) + (this.config.itemsPerPage - 1)) {
                        this.selectedIndex++;
                        this.redrawResults();
                    }
                } else if (key.name === "k") {
                    if (this.selectedIndex > (this.page - 1) * this.config.itemsPerPage) {
                        this.selectedIndex--;
                        this.redrawResults();
                    }
                } else if (key.name === "return" || key.name === "space") {
                    exec(`open ${this.results[this.selectedIndex].link}`);
                } else if (key.name === "q" || (key.name === "escape" && !key.ctrl)) {
                    rl.close();
                    process.stdin.removeListener("keypress", handleKeypress);
                } else if (key.name === 'n') {
                    if (this.page < Math.ceil(this.results.length / this.config.itemsPerPage)) {
                        this.page++;
                        this.selectedIndex = (this.page - 1) * this.config.itemsPerPage;
                        this.redrawResults();
                    }
                } else if (key.name === 'p') {
                    if (this.page > 1) {
                        this.page--;
                        this.selectedIndex = (this.page - 1) * this.config.itemsPerPage;
                        this.redrawResults();
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        readline.emitKeypressEvents(process.stdin);

        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);

        // Process keypress
        process.stdin.on("keypress", handleKeypress);

        // Update results
        this.redrawResults();

        return new Promise<SearchResult>((resolve) => {
            this.resolve = resolve;
        }).finally(() => {
            rl.close();
            process.stdin.pause();
            process.stdin.removeListener("keypress", handleKeypress);
        });
    }
}
