import { SinonStatic, SinonSpy } from '../../../node_modules/@types/sinon/index.js'
import { LightElement } from '../light-element.js'
import uniqueId from '../unique-id'
import { defineElement } from '../index.js'

const assert: Chai.Assert = chai.assert
const equal: Function = assert.strictEqual
const sinon: SinonStatic = (<any>window).sinon

const defineTestElement: Function = (constructor: Function): string => {
  const id: string = uniqueId('blank-element')
  defineElement(id, constructor)
  return id
}

suite('LightElement', () => {
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

  test('$emit a custom event', (done: Function) => {
    class BlankElement extends LightElement {
      triggerCustomEvent (type:string, args: any): void {
        this.$emit(type, args)
      }
    }
    const tagName: string = defineTestElement(BlankElement)
    const expected: number = 123
    const type: string = 'custom-event'
    const el: BlankElement = document.createElement(tagName) as BlankElement
    container.appendChild(el)
    el.addEventListener(type, (event: CustomEvent) => {
      assert.equal(event.detail, expected)
      done()
    })
    el.triggerCustomEvent(type, expected)
  })

  test('$on listen to user input events', () => {
    class BlankElement extends LightElement {}
    const tagName: string = defineTestElement(BlankElement)
    const el: BlankElement = document.createElement(tagName) as BlankElement
    const callback: SinonSpy = sinon.spy()

    container.appendChild(el)

    el.$on(el, 'click', callback)
    el.click()
    equal(callback.callCount, 1)

    // test removing listener
    container.removeChild(el)
    el.click()
    equal(callback.callCount, 1)
  })

  test('observe properties', () => {
    class BlankElement extends LightElement {
      static get properties (): any {
        return {
          counter: {
            type: Number,
            value: 42
          }
        }
      }
    }
    const tagName: string = defineTestElement(BlankElement)
    const el: BlankElement = document.createElement(tagName) as BlankElement
    el.innerHTML = `<span light-bind="counter">0</span>`

    container.appendChild(el)

    el.$updateDom()

    equal(el.innerHTML, '<span>42</span>')

    el.$props.counter++
    equal(el.innerHTML, '<span>43</span>')
  })

  test('initialize the lowest components first', () => {
    defineElement('blank-test-a', class BlankTestA extends LightElement {
      static get properties (): any {
        return {
          foo: {
            type: String,
            value: 'foo'
          }
        }
      }
    })
    defineElement('blank-test-b', class BlankTestB extends LightElement {
      static get properties (): any {
        return {
          foo: {
            type: String,
            value: 'bar'
          }
        }
      }
    })
    defineElement('blank-test-c', class BlankTestC extends LightElement {
      static get properties (): any {
        return {
          foo: {
            type: String,
            value: 'baz'
          }
        }
      }
    })
    container.innerHTML = `
<blank-test-a>
  <span light-bind="foo"></span>
  <blank-test-b>
    <button type="button" on-click="onRealClick">Click me</button>
    <span light-bind="foo"></span>
    <blank-test-c>
      <span light-bind="foo"></span>
    </blank-test-c>
  </blank-test-b>
</blank-test-a>
`
    const blankTestAEl: LightElement = container.firstElementChild as LightElement
    console.log(blankTestAEl)
    blankTestAEl.$updateDom()
    assert.equal(container.innerHTML, `
<blank-test-a>
  <span>foo</span>
  <blank-test-b>
    <button type="button" on-click="onRealClick">Click me</button>
    <span>bar</span>
    <blank-test-c>
      <span>baz</span>
    </blank-test-c>
  </blank-test-b>
</blank-test-a>
`)
  })
})
