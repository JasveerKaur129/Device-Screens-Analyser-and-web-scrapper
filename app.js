const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const responsiveScreen = [
    { name: 'windows', width: 1360, height: 768 },  
    { name: 'Tab', width: 768, height: 1024 },
    { name: 'Android', width: 360, height: 640 },
    { name: 'iPhone', width: 375, height: 667 },
];

// Enter URL which will be captured
const urls = [
    { name: 'News',
     link: 'https://www.starwars.com/news'},
    {name: 'wikipedia',
     link: 'https://www.wikipedia.com'}
    ]
    
async function setViewports(screen, url) {
    const browser = await puppeteer.launch({headless: false,
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        defaultViewport: null,
        dumpio:false,
        ignoreHTTPSErrors:true,
        args:[ '--window-size=1920,1040',"--disable-notifications"]
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    
    await page.goto(url.link);

    // Setting-up viewports 
    await page.setViewport({
        width : screen.width,
        height: screen.height
    });
    await getScreenshots(screen, url, page, browser);
}
// Directory Create if not exist
async function getScreenshots(screen, url, page, browser) {
    
    let dirName=screen.name+`(`+ screen.width+`-`+screen.height +`)`;
    let MainDir=`./PageScreenShot/`;
    let new_location = path.join(MainDir,dirName);

    fs.mkdir(new_location, function cb(err) {
        if (err) { 
            if (err.code == 'EEXIST') cb(null); 
            else cb(err); 
        }
    });
    
    const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));
    await page.screenshot({
        path: new_location +`/`+ url.name + `.png`,
        fullPage: false 
    });

    await delay(2000);
    await browser.close();
}
async function getResolutions(responsiveScreen, urls) {
    for (let screen of responsiveScreen) {
        
        for (let url of urls) {
            await setViewports(screen, url);
        }
    }
}
getResolutions(responsiveScreen, urls);

axios.get("https://www.starwars.com/news")
    .then((response) => {
        let $ = cheerio.load(response.data);
        let articles = [];

        $('.news-articles li').each((index, element) => {
            articles.push({
                url: $(element).find('a').attr('href'),
                title: $(element).find('h2').text().trim(),
                aurthor: $(element).find('.byline-author').text().trim()
            });
        });
        
        fs.writeFile('./articles.json', JSON.stringify(articles,null,4), (error) => {
            if (error) throw error;
        })
    })
    .catch((error) => {
        console.log(error);
    });
    