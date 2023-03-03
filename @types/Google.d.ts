/**
 * Type definitions for the Google class
 * @module Google
 */

import { SearchResult } from "./SearchResult";

declare class Google {
    // Private Variables
    private url: string;
    private html: string;

    // Public Variables
    results: SearchResult[];

    /**
     * @name createQuery
     * @description Creates the url for the query based on given search input
     * @param {string} query - Search Query
     * @param {number} searchPage - Search Page
     * @param {string[]} sites - List of sites to search
     * @returns {void}
     */
    private createQuery(query: string, searchPage: number, sites: string[]): void;

    /**
     * @name getPage
     * @description Gets the page based on the current results as string of html
     * @returns {Promise<void>}
     */
    private async getPage(): Promise<void>;

    /**
     * @name getResults
     * @description Get the results from the page and organize them so they can be easily referenced later
     * @return {void}
     */
    private getResults(): void;

    /**
     * Creates a new Search object with the specified configuration options.
     *
     * @constructor
     * @returns {Google} A new Google object.
     */
    constructor(): Google;

    /**
     * @name search
     * @description Performs a search and returns a Promise that resolves with void when the search is complete.
     * @param {string} query - Search Query
     * @param {number} searchPage - Seach Page
     * @param {string[]} sites - List of sites to search
     * @returns {Promise<void>}
     */
    async search(query: string, searchPage: number, sites: string[]): Promise<void>;
}
