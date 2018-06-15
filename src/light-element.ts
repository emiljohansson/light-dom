import { Subject } from './subject.js'
import watch from './watch.js'
import uniqueId from './unique-id.js'
import createTree from './create-tree.js'
import { getDefinedElements } from './index.js'

const observe: Function = (vm: LightElement, key: string, value: any): void => {
  const subject: Subject = watch(vm.$props, key)
  let tempValue: any = value
  subject.subscribe((value: any) => {
    tempValue = value
  })
  Object.defineProperty(vm.$props, key, {
    get (): any {
      return tempValue
    },
    set (newValue: any): void {
      subject.next(newValue)
    }
  })
}

export class LightElement extends HTMLElement {
  static get properties (): any {
    return {}
  }

  public $props: any = {
    $id: uniqueId(`lightElemen$props`)
  }
  private $listeners: any = {}

  constructor () {
    super()

    const props: any = (<any>this.constructor).properties
    Object.keys(props).forEach((key: string) => {
      observe(this, key, props[key].value)
    })

    this.created()
  }

  connectedCallback (): void {
    this.attached()
  }

  disconnectedCallback () :void {
    Object.keys(this.$listeners)
      .forEach((type: string) => {
        const listeners: Function[] = this.$listeners[type]
        listeners.forEach((offFn: Function) => {
          offFn()
        })
      })
    this.detached()
  }

  created (): void {}

  attached (): void {}

  detached (): void {}

  /**
   * Update the DOM for a targeted element. The method finds inline on-*
   * listeners, iterating down to child components first and works it way up.
   *
   * @param {HTMLElement} target
   */
  $updateDom (): void {
    createTree(this, getDefinedElements())
  }

  $emit (type: string, args: any = {}): void {
    this.dispatchEvent(new CustomEvent(type, {
      detail: args
    }))
  }

  $on (el: Element, type: string, cb: Function): void {
    function eventHandler (event: Event): void {
      event.stopPropagation()
      cb(event)
    }
    if (this.$listeners[type] == null) {
      this.$listeners[type] = []
    }
    el.addEventListener(type, eventHandler)
    this.$listeners[type].push(() => {
      el.removeEventListener(type, eventHandler)
    })
  }
}
