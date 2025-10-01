(function () {
    const DEFAULT_OWNER = 'mfat';
    const DEFAULT_REPO = 'sshpilot';
    const DEFAULT_LABEL = 'blog';

    const pageConfig = (document.body && document.body.dataset) || {};
    const repoOwner = pageConfig.blogRepoOwner || DEFAULT_OWNER;
    const repoName = pageConfig.blogRepoName || DEFAULT_REPO;
    const blogLabel = pageConfig.blogLabel || DEFAULT_LABEL;
    const blogLabelLower = blogLabel.toLowerCase();

    const fallbackRepoOwner = pageConfig.blogFallbackRepoOwner || DEFAULT_OWNER;
    const fallbackRepoName = pageConfig.blogFallbackRepoName || DEFAULT_REPO;
    const starsRepoOwner = pageConfig.blogStarsRepoOwner || fallbackRepoOwner;
    const starsRepoName = pageConfig.blogStarsRepoName || fallbackRepoName;

    const repoApiUrl = `https://api.github.com/repos/${starsRepoOwner}/${starsRepoName}`;
    const shouldAttemptFallback = repoOwner !== fallbackRepoOwner || repoName !== fallbackRepoName;

    function buildIssuesEndpoint(owner, name) {
        const url = new URL(`https://api.github.com/repos/${owner}/${name}/issues`);
        url.searchParams.set('state', 'all');
        url.searchParams.set('per_page', '20');
        url.searchParams.set('sort', 'created');
        url.searchParams.set('direction', 'desc');
        return url.toString();
    }


    function setupNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (!hamburger || !navMenu) {
            return;
        }

        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    async function updateGitHubStars() {
        const starsElement = document.getElementById('github-stars');
        if (!starsElement) {
            return;
        }

        try {
            const response = await fetch(repoApiUrl);

            if (!response.ok) {
                throw new Error(`GitHub API responded with ${response.status}`);
            }
            const data = await response.json();
            if (typeof data.stargazers_count === 'number') {
                starsElement.textContent = `⭐ ${data.stargazers_count.toLocaleString()}`;
            }
        } catch (error) {
            console.error('Failed to fetch GitHub stars:', error);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function renderPost(issue) {
        const article = document.createElement('article');
        article.className = 'blog-post';

        const title = document.createElement('h3');
        const titleLink = document.createElement('a');
        titleLink.href = issue.html_url;
        titleLink.target = '_blank';
        titleLink.rel = 'noopener';
        titleLink.textContent = issue.title;
        title.appendChild(titleLink);

        const meta = document.createElement('p');
        meta.className = 'blog-meta';
        const author = issue.user && issue.user.login ? issue.user.login : 'SSH Pilot Team';
        const createdAt = formatDate(issue.created_at);
        const updatedAt = issue.updated_at && issue.updated_at !== issue.created_at
            ? formatDate(issue.updated_at)
            : null;

        let metaText = createdAt ? `Published on ${createdAt}` : 'Published';
        metaText += ` by ${author}`;
        if (updatedAt && updatedAt !== createdAt) {
            metaText += ` · Updated ${updatedAt}`;
        }
        meta.textContent = metaText;

        const body = document.createElement('div');
        body.className = 'blog-content';
        const markdown = issue.body || '';
        if (window.marked) {
            if (typeof window.marked.parse === 'function') {
                body.innerHTML = window.marked.parse(markdown);
            } else if (typeof window.marked === 'function') {
                body.innerHTML = window.marked(markdown);
            } else {
                body.innerHTML = markdown.replace(/\n/g, '<br>');
            }

        } else {
            body.innerHTML = markdown.replace(/\n/g, '<br>');
        }

        const discussion = document.createElement('p');
        discussion.className = 'blog-discussion';
        const discussionLink = document.createElement('a');
        discussionLink.href = issue.html_url;
        discussionLink.target = '_blank';
        discussionLink.rel = 'noopener';
        discussionLink.textContent = 'Join the discussion on GitHub';
        discussion.appendChild(discussionLink);

        article.appendChild(title);
        article.appendChild(meta);
        article.appendChild(body);
        article.appendChild(discussion);

        return article;
    }

    function filterIssues(issues) {
        return (Array.isArray(issues) ? issues : [])
            .filter(issue => !issue.pull_request)
            .filter(issue => Array.isArray(issue.labels) && issue.labels.some(label => {
                const labelName = typeof label === 'string' ? label : label.name;
                return typeof labelName === 'string' && labelName.toLowerCase() === blogLabelLower;
            }));
    }

    async function fetchRepoPosts(owner, name) {
        const endpoint = buildIssuesEndpoint(owner, name);
        const response = await fetch(endpoint, {
            headers: {
                Accept: 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            const error = new Error(`GitHub API responded with ${response.status}`);
            error.status = response.status;
            error.repoOwner = owner;
            error.repoName = name;
            throw error;
        }

        const issues = await response.json();
        return filterIssues(issues);
    }


    async function loadPosts() {
        const postsContainer = document.getElementById('blog-posts');
        const statusElement = document.getElementById('blog-status');

        if (!postsContainer || !statusElement) {
            return;
        }

        const emptyMessage = statusElement.dataset.emptyText || 'No blog posts available yet. Check back soon!';
        const loadingMessage = 'Loading posts...';

        function setStatus(message, options) {
            const opts = options || {};
            statusElement.textContent = message;
            if (message) {
                statusElement.removeAttribute('aria-hidden');
                statusElement.style.display = '';
            } else {
                statusElement.setAttribute('aria-hidden', 'true');
                statusElement.style.display = 'none';
            }
            if (opts.isError) {
                statusElement.classList.add('error');
            } else {
                statusElement.classList.remove('error');
            }
        }

        setStatus(loadingMessage);

        const repoCandidates = [
            { owner: repoOwner, name: repoName, isFallback: false }
        ];

        if (shouldAttemptFallback) {
            repoCandidates.push({ owner: fallbackRepoOwner, name: fallbackRepoName, isFallback: true });
        }

        let lastError = null;
        let hadSuccessfulRequest = false;

        postsContainer.innerHTML = '';

        for (const candidate of repoCandidates) {
            try {
                const posts = await fetchRepoPosts(candidate.owner, candidate.name);
                hadSuccessfulRequest = true;

                if (!posts.length) {
                    continue;
                }

                if (candidate.isFallback) {
                    console.warn(`Loaded blog posts from fallback repository ${candidate.owner}/${candidate.name}.`);
                }

                setStatus('');
                posts.forEach(issue => {
                    postsContainer.appendChild(renderPost(issue));
                });
                return;
            } catch (error) {
                lastError = error;
                console.error(`Failed to load blog posts from ${candidate.owner}/${candidate.name}:`, error);
            }
        }

        if (hadSuccessfulRequest) {
            setStatus(emptyMessage);
            return;
        }

        if (lastError) {
            setStatus('We were unable to load the blog posts from GitHub at this time. Please try again later.', { isError: true });
        } else {
            setStatus(emptyMessage);

        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupNavigation();
        updateGitHubStars();
        loadPosts();
    });
})();
