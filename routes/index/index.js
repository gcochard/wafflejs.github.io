import angular from 'angular'
import moment from 'moment'
import { sortBy, sortedLastIndex, map, some, values, chain } from 'lodash'
import css from './index.css'

export default angular.module('wafflejs.routes.index', [
  require('angular-ui-router'),
  require('angular-marked'),
  require('models/calendar').default,
])
.config(($stateProvider) => {
  $stateProvider.state('index', {
    url: '/?day',
    template: require('./index.jade')(css),
    controllerAs: 'index',
    controller: class {
      constructor(calendar, $scope, $state) {
        this.people = chain(calendar)
          .map((day) => map(day.schedule, (event) => {
            event = values(event)[0]
            return event.person || event.people
          }))
          .flatten().flatten()
          .compact()
          .uniq(false, 'twitter')
          .reject({ exclude: true })
          .forEach((person) => person.size = `${Math.random() * 33 + 30}px`)
          .shuffle()
          .value()

        calendar = sortBy(calendar, 'day')
        const yesterday = { day: moment($state.params.day).subtract(1, 'day').format('YYYY-MM-DD') }
        const index = sortedLastIndex(calendar, yesterday, 'day')
        this.calendar = calendar
        this.day = calendar[index]

        if (this.day.day === $state.params.day && this.day.survey) {
          this.day.schedule.push({
            Later: {
              title: 'Did you attend?',
              description: `Had fun or not so much? We'd love to hear any and
                            all feedback.<br/><br/>
                            <a href="${this.day.survey}" class="btn">Take Survey</a>`,
              emoji: '📋'
            }
          })
        }

        this.tba = some(this.day.schedule, (event) => {
          const title = values(event)[0].title
          return title && title.match(/TBA/)
        })

        $scope.$watch(() => this.day, (current, previous) => {
          if (current !== previous)
            $state.go('.', this.day)
        })
      }
    },
  })
})
.config((markedProvider) => {
  markedProvider.setOptions({ smartypants: true })
})
.name
