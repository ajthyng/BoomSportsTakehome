import fastify from 'fastify'
import handlebars from 'handlebars'
import path from 'path'
import pointOfView from 'point-of-view'
import { SportsAPI } from './api/SportsAPI'

const app = fastify({ logger: true })

const nflAPI = new SportsAPI('http://site.api.espn.com/apis/site/v2/sports/football/nfl')

app.register(pointOfView, {
  engine: {
    handlebars
  }
})

app.register(require('fastify-static'), {
  root: path.join(__dirname, '..', 'public')
})

app.get('/', async (request, reply) => {
  const teams = await nflAPI.getTeams()
  return reply.view('/templates/index.handlebars', { teams, css: ['index.css'] })
})

const bootstrap = async () => {
  try {
    await app.listen(3000, '0.0.0.0')
  } catch (err) {
    app.log.error(err)
  }
}

bootstrap()
