import fastify from 'fastify'
import handlebars from 'handlebars'
import pointOfView from 'point-of-view'
import { SportsAPI } from './api/SportsAPI'

const app = fastify({ logger: true })

const nflAPI = new SportsAPI('http://site.api.espn.com/apis/site/v2/sports/football/nfl')

app.get('/', async (request, reply) => {
  const teams = await nflAPI.getTeams()
  console.log(teams)
  return reply.view('/templates/index.handlebars', { teams })
})

app.register(pointOfView, {
  engine: {
    handlebars
  }
})

const bootstrap = async () => {
  try {
    await app.listen(3000, '0.0.0.0')
  } catch (err) {
    app.log.error(err)
  }
}

bootstrap()
