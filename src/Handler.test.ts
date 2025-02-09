import {
  RouteWithHandler,
  runRouteWithHandler,
  routeWithHandler,
} from './Handler'
import * as t from 'io-ts'
import * as T from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import {
  getRoute,
  combineRoutes,
  lit,
  param,
} from './Route'
import { pipe } from 'fp-ts/lib/function'
import { numberDecoder } from './decoders'

describe('Test the goddamn handlers', () => {
  it('Uses the healthz handler successfully', async () => {
    const healthz = routeWithHandler(
      pipe(getRoute, lit('healthz')),
      () => {
        return T.of({ code: 200, data: 'OK' })
      }
    )

    const result = await runRouteWithHandler(healthz)({
      url: '/healthz',
      method: 'get',
      rawData: {},
      rawHeaders: {},
    })()

    expect(result).toEqual(
      E.right({ code: 200, data: 'OK' })
    )
  })

  it('Uses a doggy handler', async () => {
    const dogAges = {
      frank: 100,
      stuart: 10,
      horse: 23,
    }

    type DogReturn =
      | { code: 200; data: string[] }
      | { code: 400; data: string }

    const dogAgesHandler = routeWithHandler(
      pipe(
        getRoute,
        lit('dogs'),
        param('age', numberDecoder)
      ),
      ({ params: { age } }) => {
        const matchingDogs = Object.entries(dogAges).filter(
          ([_, dogAge]) => dogAge === age
        )
        return matchingDogs.length > 0
          ? T.of({
              code: 200,
              data: matchingDogs.map(([name]) => name),
            } as DogReturn)
          : T.of({
              code: 400,
              data: 'No dogs found',
            } as DogReturn)
      }
    )

    const result = await runRouteWithHandler(
      dogAgesHandler
    )({
      url: '/dogs/100',
      method: 'get',
      rawData: {},
      rawHeaders: {},
    })()
    expect(result).toEqual(
      E.right({ code: 200, data: ['frank'] })
    )
  })
})
