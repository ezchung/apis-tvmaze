"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const MOVIE_URL = "http://api.tvmaze.com/search/shows/";
const MISSING_IMG_PLACEHOLDER = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
//let request;
async function getShowsByTerm(showTerm) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let request = await axios.get(MOVIE_URL,{params: {"q" : showTerm}});
  console.log("request is ", request);
  let requestShowArray = request.data;
  return requestShowArray.map(getShowData);
}

  /**
   *Takes input of an array of objects and extracts important properties from
   objects and returns an array of objects with important properties
   Input: show - Array of objects
   Return: Array of objects
   */
   function getShowData(show) {
    let {id, name, summary, image: showImg} = show.show;
    //console.log(image);
    if(showImg === null){
      //console.log("image is null");
      showImg = {original : MISSING_IMG_PLACEHOLDER};
    }
    const {original:image} = showImg;
    return {id, name, summary, image};
  }

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }

    //  <img
    //     src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg"
    //     alt="Bletchly Circle San Francisco"
    //     class="w-25 me-3">
    //  <div class="media-body">
    //    <h5 class="text-primary">${show.name}</h5>
    //    <div><small>${show.summary}</small></div>
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }



