// Profile page rendering - fetches per-session profile from server API

(async function () {
    // Fetch profile data from session API
    const response = await fetch('/api/profile');
    const profile = await response.json();

    const PROFILE_NAME = profile.name;
    const PROFILE_HANDLE = profile.handle;
    const PROFILE_CITY = profile.city;
    const PROFILE_CAT = profile.cat;
    const PROFILE_GRAD = profile.grad;
    const PROFILE_PUNCT = profile.punct;

    const postsContainer = document.getElementById("posts");
    if (!postsContainer) return;

    const posts = [
        {
            pinned: true,
            time: "Pinned · 120d",
            text:
                "My friends keep laughing that my \"unbreakable\" password just glues together my hometown, my first cat's name, the year I graduated high school, and my favorite punctuation mark. Joke's on them, I use it everywhere so I'll definitely never forget it " +
                PROFILE_PUNCT
        },
        {
            pinned: false,
            time: "3h",
            text:
                "Throwback Thursday: little me in my Riverside High hoodie at graduation 🎓. Can't believe it's been 10 years since the class of " +
                PROFILE_GRAD +
                ". Time flies."
        },
        {
            pinned: false,
            time: "1d",
            text:
                "Still miss my first kitty " +
                PROFILE_CAT +
                " every day 🐾. She was the reason I pulled so many all-nighters learning to code in college. Yes, I know using pet names in passwords is bad. No, I'm not changing it."
        },
        {
            pinned: false,
            time: "4d",
            text:
                "Weird security question on a site today: \"What's your favorite punctuation?\" Obviously it's the " +
                PROFILE_PUNCT +
                " because everything sounds more excited with an exclamation point" +
                PROFILE_PUNCT
        },
        {
            pinned: false,
            time: "6d",
            text:
                'Note to self: stop posting things like "my password formula" here. Future me, if you ever get hacked, you basically asked for it.'
        }
    ];

    postsContainer.innerHTML = "";

    posts.forEach(function (post) {
        const article = document.createElement("article");
        article.className = "post";
        article.innerHTML =
            '<div class="post-avatar"><span>CC</span></div>' +
            '<div class="post-main">' +
            '  <div class="post-header">' +
            '    <span class="post-name">' + PROFILE_NAME + '</span>' +
            '    <span class="post-handle">@' + PROFILE_HANDLE + '</span>' +
            '    <span class="post-dot">·</span>' +
            '    <span class="post-time">' + post.time + '</span>' +
            '  </div>' +
            '  <div class="post-text">' + post.text + '</div>' +
            '  <div class="post-meta"></div>' +
            '</div>';
        postsContainer.appendChild(article);
    });

    // Update header to match selected profile
    const headerName = document.querySelector(".profile-main .name");
    const headerHandle = document.querySelector(".profile-main .handle");
    const shell = document.querySelector("main.shell");
    const metaSpans = document.querySelectorAll(".profile-main .meta span");

    if (headerName) headerName.textContent = PROFILE_NAME;
    if (headerHandle) headerHandle.textContent = "@" + PROFILE_HANDLE;
    if (shell) shell.setAttribute("aria-label", "Public profile for @" + PROFILE_HANDLE);

    // Use PROFILE_CITY for the location meta entry
    if (metaSpans[1]) metaSpans[1].textContent = PROFILE_CITY;
})();
