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
       </div>`
      );

    $showsList.append($show);
  }
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

/** Listen for submit action and invoke searchForShowAndDisplay function */

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** when button for episodes is clicked, invoke function to grab and display the 
 * series episodes' information
 */
$showsList.on('click', 'button', grabAndDisplayEpisodeInfo)

/** Checks if episodes button for the series has already been clicked
 * If has not been clicked, get the episodes' information and display the episode info.
 * After clicked, assign class that it has been clicked already. 
 */
async function grabAndDisplayEpisodeInfo(e) {
  const showIDData = $(e.target)
    .closest('.Show')
    .data('show-id');
  
  let basicEpisodesInfo = await getEpisodesOfShow(showIDData);

  populateEpisodes(basicEpisodesInfo);
  $(e.target).toggleClass("clicked");
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showID) {
  let showEpisodes = await axios.get(SHOW_EPISODES_URL + showID + '/episodes');

  return showEpisodes.data.map(basicEpisodeInfo => {
    return {
      id: basicEpisodeInfo.id, 
      name: basicEpisodeInfo.name,
      season: basicEpisodeInfo.season, 
      number: basicEpisodeInfo.number
    }
  });
}

/**
 * Appends episode information to the DOM as a list
 * Input: episodes - Array of objects [{id, name, season, number}]
 */
function populateEpisodes(episodesOfShows) {
  $('#episodesList').empty();
  $episodesArea.show();
  for (let episode of episodesOfShows) {
      const $episodeInfo = $('<li>')
        .html(`${episode.name} (Season
        ${episode.season}, Number ${episode.number}, ID ${episode.id})`);
      $('#episodesList').append($episodeInfo);
  }
}



