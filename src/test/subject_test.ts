import { Subject } from '../subject'
import { SinonStatic } from '../../../node_modules/@types/sinon/index.js'

const assert: Chai.Assert = chai.assert
const sinon: SinonStatic = (<any>window).sinon

suite('Subject', () => {
  let container: HTMLElement

  setup(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  teardown(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  test('subscribe to a subject', () => {
    const callback: sinon.SinonSpy = sinon.spy()
    const subject: Subject = new Subject()
    const unsubscribe: Function = subject.subscribe(callback)
    subject.next()

    assert.equal(callback.callCount, 1)

    unsubscribe()
    subject.next()

    assert.equal(callback.callCount, 1)
  })

  test('complete a subject destroys all subscribers', () => {
    const callback: sinon.SinonSpy = sinon.spy()
    const subject: Subject = new Subject()
    subject.subscribe(callback)
    subject.next()

    assert.equal(callback.callCount, 1)

    subject.complete()
    subject.next()

    assert.equal(callback.callCount, 1)
  })

  test('return number of subscribers', () => {
    const subject: Subject = new Subject()
    subject.subscribe(() => {})
    subject.subscribe(() => {})

    assert.equal(subject.numberOfSubscriptions(), 2)

    subject.complete()
    assert.equal(subject.numberOfSubscriptions(), 0)

    subject.subscribe(() => {})
    assert.equal(subject.numberOfSubscriptions(), 0)
  })
})
