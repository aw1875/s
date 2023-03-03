// External Imports
import * as cheerio from 'cheerio';
import axios from 'axios';

// Types
import { SearchResult } from '../@types/SearchResult';

const BASE_URL = "https://html.duckduckgo.com/html/?q=";

export default class DuckDuckGo {
    // Private Variables
    private url: string;
    private html: string;

    // Public Variables
    results: SearchResult[];

    private createQuery(query: string, searchPage: number, sites: string[]): void {
        // Create uri encoded string based on the query and config sites then replace spaces with +
        const searchQuery = encodeURIComponent(`${query} (${sites.map((s) => `site:${s}`).join(' | ')})`)
            .replace(/%20/g, '+');

        this.url = `${BASE_URL}${searchQuery}&s=${(searchPage + 1) * 30}&dc=${(searchPage + 1) * 30 + 1}`;
    }

    private async getPage(): Promise<void> {
        const { data } = await axios.get(this.url, {
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'text/html; charset=UTF-8',
                'Accept-Language': 'en-US,en;q=0.9',
                Referer: 'https://duckduckgo.com/',
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

        // Get Titles and Links
        $('.result__title > a').each((i, el) => {
            titles[i] = $(el).text();
            links[i] = decodeURIComponent(
                $(el).attr('href')?.replace(/^.*?—\s+|\/\/duckduckgo\.com\/l\/\?uddg=/g, '')
                    .replace(/&rut=.*/, '')
                ?? "");
        });

        // Get Snippets
        $('.result__snippet').each((i, el) => {
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

    constructor() {
        this.url = '';
        this.html = '';
        this.results = [];
    }

    async search(query: string, searchPage: number, sites: string[]): Promise<void> {
        this.createQuery(query, searchPage, sites);
        await this.getPage();
        this.getResults();
    }
}
