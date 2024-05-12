const API_KEY = "DXMbGBGY2tkNUrfZ6JQY6U3PnZLf6Jpg";
const API_PREFIX = "https://api.giphy.com/v1/gifs/search?api_key=";
const API_SETTINGS = "&rating=g&lang=en&bundle=messaging_non_clips";

/* Application internal state */
let memesPerPage = 1;
let currentPage = 1;
let query = "";

function generatePaginationListItems(pageCount) {
    let startClass = "";
    let endClass = "";
    let previousClass = "";
    let nextClass = "";

    if (currentPage === 1) {
        previousClass = "disabled";
        startClass = "disabled";
    }

    if (pageCount === currentPage) {
        endClass = "disabled";
        nextClass = "disabled";
    }

    let innerPageLinks = "";
    if (currentPage === 1) {
        innerPageLinks = `
            <li class="page-item disabled">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
            <li class="page-item">
                <a class="page-link" href="#" data-page="2">2</a>
            </li>        
        `;
    } else if (currentPage === pageCount) {
        innerPageLinks = `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${currentPage - 1}">
                    ${currentPage - 1}
                </a>
            </li>
            <li class="page-item disabled">
                <a class="page-link" href="#" data-page="${currentPage}">
                    ${currentPage}
                </a>
            </li>        
        `;
    } else {
        innerPageLinks = `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${currentPage - 1}">
                    ${currentPage - 1}
                </a>
            </li>
            <li class="page-item disabled">
                <a class="page-link" href="#" data-page="${currentPage}">
                    ${currentPage}
                </a>
            </li>  
            <li class="page-item">
                <a class="page-link" href="#" data-page="${currentPage + 1}">
                    ${currentPage + 1}
                </a>
            </li>      
        `;
    }

    return `
        <li class="page-item ${startClass}">
            <a class="page-link" href="#" data-page="1">Start</a>
        </li>
        <li class="page-item ${previousClass}">
            <a 
                class="page-link" 
                href="#" 
                data-page="${currentPage - 1}">
                    Previous
            </a>
        </li>
        ${innerPageLinks}
        <li class="page-item ${nextClass}">
            <a 
                class="page-link" 
                href="#"
                data-page="${currentPage + 1}">
                    Next
            </a>
        </li>
        <li class="page-item ${endClass}">
            <a class="page-link" href="#" data-page="${pageCount}">
                End
            </a>
        </li>    
    `;
}

function renderPagination(paginationInfo) {
    let { count, offset, total_count: totalCount } = paginationInfo;
    let pageCount = Math.ceil(totalCount / count);

    let html = `
<nav 
    aria-label="Page navigation example" 
    data-bs-theme="dark"
    class="pagination-component">
    <ul class="pagination">
        ${generatePaginationListItems(pageCount)}
    </ul>
    <span class="page-label">Page ${currentPage} of ${pageCount}</span>
</nav>   
    `;

    document.querySelector(".js-pagination-top").innerHTML = html;
    document.querySelector(".js-pagination-bottom").innerHTML = html;
}

function renderGifs(response) {
    let result = "";

    if (response.data.length === 0) {
        renderError("No results.");
    } else {
        for (let meme of response.data) {
            result += `
                <img 
                    src="${meme.images.original.url}" 
                    alt="${meme.alt_text}" 
                    class="meme-img" />
            `;
        }

        document.querySelector(".js-memes-container").innerHTML = result;

        renderPagination(response.pagination);
    }
}

function renderError(message) {
    document.querySelector(".js-memes-container").innerHTML = `
        <div class="alert alert-danger error-container">${message}</div>
    `;
}

function getMemes() {
    let offset = (currentPage - 1) * memesPerPage;
    fetch(
        `${API_PREFIX}${API_KEY}&q=${query}&limit=${memesPerPage}&offset=${offset}${API_SETTINGS}`
    )
        .then((data) => data.json())
        .then(renderGifs)
        .catch(() => renderError("Error retrieving data."));
}

function formSubmitted(event) {
    event.preventDefault();
    query = document.querySelector("[name=meme-input]").value;

    /* set the global state */
    memesPerPage = document.querySelector("[name=meme-count]").value;
    currentPage = 1;

    getMemes();
}

document.querySelector("#meme-form").addEventListener("submit", formSubmitted);

function paginate(event) {
    let page = event.target.dataset.page;
    if (typeof page !== "undefined") {
        event.preventDefault();
        currentPage = Number(page);
        getMemes();
    }
}

document.querySelector("main").addEventListener("click", paginate);
