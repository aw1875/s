<h2 align="center">S - Terminal Search Tool</h2>
<img src="images/s.png" />

Search Google or DuckDuckGo directly in your terminal finely grained based on what you like. Customize the sites you want results from and more.

## Setup

To get S up and running, you first need to install all dependencies:

```bash
yarn install
```

Then, running 2 simple commands is all you need.

```bash
yarn build
yarn setup
```

*If you get permission issues running `yarn setup` try running it with sudo as `sudo yarn setup`*

## Using S

After installing S, to use it all you need to do is type s `[your query]` in your terminal. For example:

```bash
s hello world nodejs
```

This will get results for "hello world nodejs" based on the config.json and display them in your terminal.

### Moving in S

Although there is a controls output that tells you the movements, here is what you would need to know just in case.

`j` - Move down a result<br/>
`k` - Move up a result<br/>
`n` - Move to the next page of results<br/>
`p` - Move to the previous page of results<br/>
`return` or `space` - Open the link in your default browser<br/>
`q` or `esc` - Quit the program


## Config

This package comes with a default config.json file that will be located at /etc/s/config.json once installed. You can edit this file to better suit your needs. The config has 4 sections that are customizable.

`sites` - An array of strings that your results will be based on<br/>
`results` - A number for the amount of results you want<br/>
`itemsPerPage` - A number for the number of items you want shown on each page<br/>
`searchEngine` - Either `google` or `duckduckgo`

An example config for Google would look like this:

```json
{
  "sites": [
    "stackoverflow.com",
    "stackexchange.com"
  ],
  "results": 30,
  "itemsPerPage": 5,
  "searchEngine": "google"
}
```

See [config.json](https://github.com/aw1875/s/blob/master/config.json) for an example.
