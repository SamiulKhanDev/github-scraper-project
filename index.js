global.AbortController = require("node-abort-controller").AbortController;
const request = require('request');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const homePage = "https://github.com";
const url = "https://github.com/topics/";

request(url, extractTopicLinks);


//Functions

//Functions to extract topic links

function extractTopicLinks(error, res, html)
{
    if (error)
    {
        console.log(error);
    }
    else
    {
        extractTopicLinksHelper(html);
    }
}

function extractTopicLinksHelper(html)
{
    const $ = cheerio.load(html);
    const ul = $(".container-lg.p-responsive.mt-6 .d-flex.flex-wrap.flex-justify-start.flex-items-stretch.list-style-none.gutter.my-4 a");
    let idx = 0;
    for (let a of ul)
    {
      const link =homePage.concat($(a).attr("href"));
        handleLink(link);
            
    }
}


//Functions to extract repos from the topic link
function handleLink(topicLink)
{
    request(topicLink, extraReposFromThisLink);
}


function extraReposFromThisLink(error, res, html)
{
    if (error)
    {
        console.log(error);
    }
    else
    {
        extraReposFromThisLinkHelper(html)  
    }
}

function extraReposFromThisLinkHelper(html)
{
    const $ = cheerio.load(html);
    const name = $(".h1").text().trim();
    createFolder(name);
  
    const issueLinksOfAllRepos = $('.col-md-8.col-lg-9 article .tabnav-tabs a[data-ga-click="Explore, go to repository issues, location:explore feed"]');
    const repoNames= $(".f3.color-fg-muted.text-normal.lh-condensed");
    for (let i = 0; i <issueLinksOfAllRepos.length;i++)
    {

        const rn = $(repoNames[i]).text().trim().split(" ")[0].trim();
        const issueLink = issueLinksOfAllRepos[i];  
        const mainLink = homePage.concat($(issueLink).attr("href"));

        
        // extractIssueDetailsFromMainLink(rn,mainLink);
        request(mainLink, (error,res,html) => { 
            if (error)
            {
                console.log(error);
            }
            else
            {

                const tool = cheerio.load(html);
                const issues = tool(".js-navigation-container.js-active-navigation-container .Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
                // for (let issue of issues)
                //     {
                //         const link = tool(issue).attr("href");
                //         console.log(link);
                        
                //     }
                const repoFile = path.join(__dirname, "Data", name, `${rn}.json`);
                if (fs.existsSync(repoFile) == true)
                {
                    const buffer = fs.readFileSync(repoFile);
                    const json = JSON.parse(buffer);
                    for (let issue of issues)
                    {
                        const link = tool(issue).attr("href");
                        // console.log(link);
                        json.push(link);

                        
                    }
                    const string = JSON.stringify(json);
                    fs.writeFileSync(repoFile, string);

                }
                else
                {
                    
                    const json = [];
                    for (let issue of issues)
                    {
                        const link = tool(issue).attr("href");
                        // console.log(link);
                        json.push(link);

                        
                    }
                    const string = JSON.stringify(json);
                    fs.writeFileSync(repoFile, string);
                }
                
                
            }
        })
        
    }

}


//Folder create

function createFolder(name)
{
    // console.log(name);
    
    const mainFolderPath = path.join(__dirname,"Data");
    if (fs.existsSync(mainFolderPath) == false)
    {
        fs.mkdirSync(mainFolderPath);    
    }

    const folderPath = path.join(mainFolderPath, name);
    if (fs.existsSync(folderPath) == false)
    { 
        fs.mkdirSync(folderPath);    
    }
}
