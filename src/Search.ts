// External Imports
import * as cheerio from 'cheerio';
import axios from 'axios';
import chalk from 'chalk';

// Node Imports
import { stdout } from 'process';
import readline from 'readline';
import { exec } from 'child_process';

// Types
import { SearchResult } from '../@types/SearchResult';
import { Config } from '../@types/Config';

const BASE_URL = "https://www.google.com/search?q=";

export default class Search {
    // Private Variables
    private query: string;
    private searchPage: number;
    private page: number;
    private url: string;
    private html: string;
    private spinnerTimer: NodeJS.Timeout | null;
    private selectedIndex: number;
    private config: Config;

    // Public Variables
    results: SearchResult[];

    private createQuery(): void {
        // Create uri encoded string based on the query and config sites then replace spaces with +, ( with %28 and ) with %29
        const searchQuery = encodeURIComponent(`${this.query} (${this.config.sites.map((s) => `site:${s}`).join(' | ')})`)
            .replace(/%20/g, '+')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');

        this.url = `${BASE_URL}${searchQuery}&start=${this.searchPage * this.config.itemsPerPage}`;
    }

    private async getPage(): Promise<void> {
        const { data } = await axios.get(this.url, {
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'text/html; charset=UTF-8',
                'Accept-Language': 'en-US,en;q=0.9',
                Referer: 'https://www.google.com/',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
            },
        });

        this.html = data;
    }

    private getResults(): void {
        const $ = cheerio.load(this.html);
        const titles: string[] = [];
        const links: string[] | undefined[] = [];
        const snippets: string[] = [];

        // Get Titles
        $('.yuRUbf > a > h3').each((i, el) => {
            titles[i] = $(el).text();
        });

        // Get Links
        $('.yuRUbf > a').each((i, el) => {
            links[i] = $(el).attr('href');
        });

        // Get Snippets
        $('.g .VwiC3b').each((i, el) => {
            snippets[i] = $(el).text().replace(/^.*?—\s+/, '');
        });

        // Create array of all info as SearchResult objects
        const results: SearchResult[] = [];
        for (let i = 0; i < titles.length; i++) {
            results[i] = {
                title: titles[i],
                link: links[i],
                snippet: snippets[i],
            }
        }

        this.results.push(...results);
    }

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

        console.log(`Your results for ${chalk.blue(this.query)} (page ${this.page} / ${Math.ceil(this.results.length / this.config.itemsPerPage)})\n`);

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
        this.url = "";
        this.html = "";
        this.spinnerTimer = null;
        this.selectedIndex = 0;
        this.config = config;
        this.results = [];
    }

    resolve: ((value: SearchResult | PromiseLike<SearchResult>) => void) | undefined;

    async search(): Promise<void> {
        this.startSpinner();

        // Get all results until we've reached the config amount of items to find
        while (this.results.length <= this.config.results - this.config.itemsPerPage) {
            this.createQuery();
            await this.getPage();
            this.getResults();
            this.searchPage++;
        }

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
