import { renderTemplate } from "../../build/forge-build.js";


const GITHUB_USERNAME = "TheGeorgeAlexander";


export default {
    async fetch(request, env, ctx) {
        let githubData = [];
        let usedCache = true;
        let error;

        // Get data from cache, or GitHub API if cache is empty
        try {
            const cachedResponse = await caches.default.match("https://george-alexander.dev/api/repos");
            if(cachedResponse) {
                githubData = await cachedResponse.json();
            } else {
                githubData = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
                    headers: { "User-Agent": GITHUB_USERNAME }
                }).then(res => res.json());
                usedCache = false;
            }
        } catch(e) {
            console.error(e);
            error = `Wasn't able to fetch repositories from GitHub.<code>${e}</code>`;
        }

        // Store new data in cache
        if(!usedCache) {
            ctx.waitUntil(caches.default.put("https://george-alexander.dev/api/repos", new Response(JSON.stringify(githubData), {
                headers: {
                    "Cache-Control": "public, max-age=3600"
                }
            })));
        }

        // Sort the repos, most stars first, a repo with description has priority, otherwise newest update
        try {
            githubData.sort((a, b) => {
                if(b.stargazers_count != a.stargazers_count) {
                    return b.stargazers_count - a.stargazers_count;
                }
                if(b.description && !a.description) {
                    return 1;
                }
                if(!b.description && a.description) {
                    return -1;
                }
                return new Date(b.updated_at) - new Date(a.updated_at);
            });
        } catch(e) { // Just in case API data somehow isn't an array of repos
            console.log(e)
            error = `Unexpected data format from GitHub.<code>${e}</code>`;
        }

        return new Response(renderTemplate("index", {
            error,
            githubData,
            timeAgo,
            formatSize
        }), {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "X-Used-API-Cache": usedCache
            }
        });
    }
}



function timeAgo(date) {
    const now = new Date();

    const diffInMs = now - new Date(date);
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHour = Math.floor(diffInMin / 60);
    const diffInDay = Math.floor(diffInHour / 24);
    const diffInMonth = Math.floor(diffInDay / 30);
    const diffInYear = Math.floor(diffInDay / 365);

    if(diffInSec < 60) {
        return `${diffInSec} sec ago`;
    } else if(diffInMin < 60) {
        return `${diffInMin} min ago`;
    } else if(diffInHour < 24) {
        return `${diffInHour}h ago`;
    } else if(diffInDay < 30) {
        return `${diffInDay}d ago`;
    } else if(diffInMonth < 12) {
        return `${diffInMonth}mo ago`;
    } else {
        return `${diffInYear}y ago`;
    }
}


function formatSize(sizeInKB) {
    if (sizeInKB < 1000) {
        return sizeInKB + " kB";
    } else if (sizeInKB < 1000 * 1000) {
        return Math.round(sizeInKB / 1000) + " MB";
    } else {
        return Math.round(sizeInKB / (1000 * 1000)) + " GB";
    }
}

