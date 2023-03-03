export interface Config {
    sites: string[];
    results: number;
    itemsPerPage: number;
    searchEngine: 'google' | 'duckduckgo';
}
