"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const MOVIE_URL = "http://api.tvmaze.com/search/shows/";
const SHOW_EPISODES_URL = "http://api.tvmaze.com/shows/";
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
  const showIDs = shows.map(el => el.id);
  console.log(showIDs);
  const episodes = await Promise.all(showIDs.map(getEpisodesOfShow));
  console.log('episodes', episodes);
  // $episodesArea.hide();
  populateShows(shows);
  populateEpisodes(episodes);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on('click', 'button', grabAndDisplayEpisodeInfo)

/**
 *
 */
function grabAndDisplayEpisodeInfo(e) {
  const showIDData = $(e.target)
    .closest('.Show col-md-12 col-lg-6 mb-4');
    // .data('data-show-id');
  console.log('showIDData', showIDData);
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showID) {
  let showEpisodes = await axios.get(SHOW_EPISODES_URL + showID + '/episodes');
  console.log('showEpisodes', showEpisodes);
  const showEpisodesInfo = showEpisodes.data.map(basicEpisodeInfo => {
    return {id: basicEpisodeInfo.id, name: basicEpisodeInfo.name,
      season: basicEpisodeInfo.season, number: basicEpisodeInfo.number}
  });
  console.log('showEpisodesInfo', showEpisodesInfo);
  return showEpisodesInfo;
}

/**
 * Appends episode information to the DOM as a list
 * Input: episodes - Array of objects [{id, name, season, number}]
 */
function populateEpisodes(episodesOfShows) {
  for (let episodes of episodesOfShows) {
    for (let episode of episodes) {
      const $episodeInfo = $('<li>').html(`${episode.name} (Season
        ${episode.season}, Number ${episode.number}, ID ${episode.id})`);
      $('#episodesList').append($episodeInfo);
    }
  }
}



