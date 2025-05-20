import { renderTemplate } from "../build/forge-build.js";



export default {
    async fetch(request, env, ctx) {
        const hasFileExtension = new URL(request.url).pathname.split("/").at(-1).includes(".");

        // Only paths without extensions will return HTML page
        if(hasFileExtension) {
            return new Response(null, { status: 404 });
        }
        return html404();
    }
}



function html404() {
    const texts = [
        "{here}",
        "or {here}",
        "perhaps {here}",
        "{this one} maybe",
        "maybe {over here}",
        "try {this one}",
        "click {something}",
        "or try {this spot}",
        "possibly {this thing}",
        "how about {this place}?",
        "this {mystery link}?",
        "this {option}?",
        "somewhere around {here-ish}",
        "not {there}, but {here}",
        "definitely {this one}",
        "okay, last chance: {this one}",
        "one of these is {correct}",
        "or was it {this way}?",
        "could be {wherever}",
        "secret entrance: {behind here}",
        "I swear {this} is not a trap",
        "just pick {any of them}",
        "fine, {go this way}",
        "who even knows? {¯\\_(ツ)_/¯}",
        "technically, {this counts}",
        "FOUND IT {HERE}",
        "you look good ({here})",
        "{p}a{r}t{y} t{i}m{e}!{!}!",
        "NOT {THIS ONE}"
    ];

    shuffle(texts);

    const htmlStrings = [];
    for (let i = 0; i < 15; i++) {
        const randomText = texts[i % texts.length];

        // Put actual 'a' elements in the text template
        const replacedText = randomText.replace(/{(.+?)}/g, (full, group) => `<a href="/">` + group + `</a>`);

        // Text in positioned span
        const fontSize = `${Math.random() * 0.5 + 0.6}em`;
        const bottom = `${Math.random() * 100}%`;
        const side = Math.random() < 0.5 ? `left: ${Math.random() * 50}%` : `right: ${Math.random() * 50}%`;
        const span = `<span style="font-size: ${fontSize}; bottom: ${bottom}; ${side}; position: absolute;">${replacedText}</span>`;

        htmlStrings.push(span);
    }

    return new Response(renderTemplate("404", {
        urlElements: htmlStrings.join("")
    }), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" }
    });
}



// Copied from https://stackoverflow.com/a/2450976
function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}
