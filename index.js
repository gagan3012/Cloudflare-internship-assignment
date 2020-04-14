// Name: Gagan Bhatia
// Date: 14 April 2020
const LAST_VISITED_COOKIE_NAME = "last_visited";
const API_URL = "https://cfw-takehome.developers.workers.dev/api/variants";
const PERSIST_VARIANT = true;

const MY_WEBSITE_URL = "https://gagan3012.github.io";
const MY_LINKEDIN_URL = "https://www.linkedin.com/in/gbhatia30/"

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {

    let targetUrl = getLastVisitedPage(request);
    console.log("Last visited url: ", lastVisitedUrl);

    let isFirstVisit = targetUrl === null;
    if (!PERSIST_VARIANT) {
        isFirstVisit = true; // Override the targetUrl check
    }

    if (isFirstVisit) {
        console.log('Getting new target url');
        let apiRes = await fetch(API_URL);
        let resJson = await apiRes.json();
        let variantsList = resJson['variants'];
        console.log(variantsList);

        let targetIndex = Math.floor(Math.random() * 2); // Chooses either url with 50/50 chance?
        targetUrl = variantsList[targetIndex];
        console.log("New target url: ", targetUrl);
    }

    let newRes = await fetch(targetUrl);

    if (isFirstVisit) {
        console.log('Adding last_visited cookie')
        newRes = new Response(newRes.body, newRes);
        let newCookie = LAST_VISITED_COOKIE_NAME + "=" + targetUrl;
        newRes.headers.set('Set-Cookie', newCookie);
    }

    console.log(' ');

    let elementHandler = new ElementHandler(targetUrl, isFirstVisit);
    return new HTMLRewriter()
        .on('h1', elementHandler)
        .on('p', elementHandler)
        .on('a', elementHandler)
        .on('title', elementHandler)
        .transform(newRes)
}

function getLastVisitedPage(request) {
    let cookies = request.headers.get('Cookie');
    console.log("Request's Cookies: ", cookies);



    lastVisitedUrl = null;
    if (cookies) {
        let cookiePairs = cookies.split(';');
        console.log("cookiePairs", cookiePairs);
        cookiePairs.forEach(pair => {
            let pairArray = pair.split('=');
            pairArray[0] = pairArray[0].trim();
            pairArray[1] = pairArray[1].trim();
            console.log(pairArray);

            if (pairArray[0] === LAST_VISITED_COOKIE_NAME) {
                lastVisitedUrl = pairArray[1];
            }
        });

    }

    return lastVisitedUrl;
}

class ElementHandler {
    constructor(targetUrl, isFirstVisit) {
        this.targetUrl = targetUrl;
        this.isFirstVisit = isFirstVisit;
    }

    element(element) {
        if (element.tagName === "h1" && element.getAttribute("id") === "title") {
            element.setInnerContent(`Hello! I am Gagan Bhatia!`);
        } else if (element.tagName === "p" && element.getAttribute("id") === "description") {
            let newDescription = `
        ${this.isFirstVisit ? 'This is your first visit!' : "You've been here before."} \n
        Also, Here are links to my Github and Linkedin accounts!
      `
            element.setInnerContent(newDescription);
        } else if (element.tagName === "a" && element.getAttribute("id") === "url") {
            element.setAttribute("href", MY_WEBSITE_URL);
            element.setInnerContent("Gagan Bhatia's Personal Website");
        } else if (element.tagName === "title") {
            let variantNumber = this.targetUrl.charAt(this.targetUrl.length - 1);
            element.setInnerContent(`Gagan Bhatia's Internship Cloudflare Assignment (Previously Variant ${variantNumber})`);
        }
    }
}