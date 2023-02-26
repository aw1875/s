<h2 align="center">S - Terminal Search Tool</h2>

Search Google directly in your terminal finely grained based on what you like. Customize the sites you want results from and more.

## Setup

Running 2 simple commands is all you need.

```bash
yarn build
yarn setup
```

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

This package comes with a default config.json file that will be located at /etc/s/config.json once installed. You can edit this file to better suit your needs. The config has 3 sections that are customizable.

`sites` - An array of strings that your results will be based on<br/>
`results` - A number for the amount of results you want<br/>
`itemsPerPage` - A number for the number of items you want shown on each page
