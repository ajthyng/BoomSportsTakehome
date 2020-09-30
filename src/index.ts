import { SportsAPI } from './api/SportsAPI'

const espnAPI = new SportsAPI('http://site.api.espn.com/apis/site/v2/sports/football/nfl');

(async () => {
  const teams = await espnAPI.getTeams()
  console.log(teams)
})()
