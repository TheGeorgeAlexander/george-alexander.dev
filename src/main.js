import page404 from "./404.js"


export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if(url.pathname.endsWith("/")) {
            url.pathname += "index";
        }

        // All possible imports embedded at build time, no directory traversal possible
        let pathModule;
        try {
            pathModule = await import(`./paths/${url.pathname.substring(1)}.js`);
        } catch(e) {
            return page404.fetch(request, env, ctx);
        }

        return pathModule.default.fetch(request, env, ctx);
    }
}
