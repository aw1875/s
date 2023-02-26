/**
 * Type definitions for the Search class
 * @module Search
 */

import { SearchResult } from "./SearchResult";

declare class Search {
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

    /**
     * @name createQuery
     * @description Creates the url for the query based on given search input
     * @param {boolean} next - Default as false
     * @returns {void}
     */
    private createQuery(next: boolean = false): void;

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
     * @name redrawResults
     * @description Redraws the interface so that the output is interactive
     * @returns {void}
     */
    private redrawResults(): void;

    /**
     * Creates a new Search object with the specified configuration options.
     *
     * @constructor
     * @param {string} query - The search query
     * @param {Config} config - The configuration options for the search.
     * @returns {Search} A new Search object.
     */
    constructor(query: string, config: Config);

    /**
     * @name resolve
     * @description A callback function that is called when a Promise is resolved with a SearchResult object.
     * @param {SearchResult | PromiseLike<SearchResult>} value - The SearchResult or Promise for a SearchResult that the Promise was resolved with.
     * @returns {void}
     */
    resolve: ((value: SearchResult | PromiseLike<SearchResult>) => void) | undefined;

    /**
     * @name search
     * @description Performs a search and returns a Promise that resolves with void when the search is complete.
     * @returns {Promise<void>}
     */
    async search(): Promise<void>;

    /**
     * @name startSpinner
     * @description Starts the spinning animation when a process is running
     * @return {void}
     */
    startSpinner(): void;

    /**
     * @name stopSpinner
     * @description Stops the spinning animation once a process has completed
     * @returns {void}
     */
    stopSpinner(): void;

    /**
     * @name showResults
     * @description Creates an interactive output of the results for users to be able to scroll through and select
     * @returns {Promise<SearchResult>}
     */
    async showResults(): Promise<SearchResult>;
}
