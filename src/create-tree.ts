import { LightElement } from './light-element.js'
import { Subject } from './subject.js'
import watch from './watch.js'

const onTypes: string[] = [
  'click',
  'mousedown',
  'mousemove',
  'mouseup',
  'keydown',
  'keyup',
  'input'
]

const toArray: Function = (value: any): any[] => Array.prototype.slice.call(value)

const isChildOf: Function = (parentNode: Element, childNode: Element): boolean => parentNode.contains(childNode)

export default (target: LightElement, tagNames: string[]): void => {
  const els: LightElement[] = [target].concat(
    tagNames
      .map((name: string) => toArray(target.querySelectorAll(name)))
      .reduce((array: string[], value: string[]) => array.concat(value), [])
  )
  if (els.length < 1) {
    return
  }
  const tree: Leaf = new Leaf(els.splice(0, 1)[0])
  els.forEach((el: LightElement) => {
    tree.add(el)
  })
  onTypes.forEach((type: string) => {
    tree.onMixin(type)
  })
  tree.lightBindings()
}

class Leaf {
  private el: LightElement
  private leaves: Leaf[] = []

  constructor (rootEl: LightElement) {
    this.el = rootEl
  }

  add (el: LightElement): void {
    const length: number = this.leaves.length
    if (isChildOf(el, this.el)) {
      const tempEl: LightElement = this.el
      this.el = el
      this.add(tempEl)
      return
    }
    if (length < 1) {
      this.leaves.push(new Leaf(el))
      return
    }
    let index: number = -1
    while (++index < length) {
      const leaf: Leaf = this.leaves[index]
      if (isChildOf(leaf.el, el)) {
        leaf.add(el)
        return
      }
      if (isChildOf(el, leaf.el)) {
        const leafIndex: number = this.leaves.indexOf(leaf)
        const newLeaf: Leaf = new Leaf(el)
        this.leaves.splice(leafIndex, 1, newLeaf)
        newLeaf.add(leaf.el)
        return
      }
    }
    this.leaves.push(new Leaf(el))
  }

  onMixin (type: string): void {
    this.leaves.forEach((leaf: Leaf) => {
      leaf.onMixin(type)
    })
    const attr: string = `on-${type}`
    const children: Element[] = toArray(this.el.querySelectorAll(`[${attr}]`))
    if (this.el.hasAttribute(attr)) {
      children.unshift(this.el)
    }
    if (children.length < 1) {
      return
    }
    children.forEach((child: (Element | LightElement)) => {
      const fn: string = child.getAttribute(attr) || ''
      if (this.el[fn] != null) {
        const context: LightElement = '$on' in child
          ? child
          : this.el
        context.$on(child, `${type}`, this.el[fn].bind(this.el))
        child.removeAttribute(attr)
      }
    })
  }

  lightBindings (): void {
    this.leaves.forEach((leaf: Leaf) => {
      leaf.lightBindings()
    })
    const bindEls: HTMLElement[] = toArray(this.el.querySelectorAll('[light-bind]'))
    bindEls.forEach((el: HTMLElement | HTMLInputElement) => {
      const key: string = el.getAttribute('light-bind')
      el.removeAttribute('light-bind')
      const subject: Subject = watch(this.el.$props, key)
      const update: Function = (value: any): void => {
        if (el.tagName === 'INPUT') {
          (el as HTMLInputElement).value = value
          return
        }
        el.innerText = value
      }
      subject.subscribe(update)
      if (this.el.$props[key] != null) {
        update(this.el.$props[key])
      }
    })
  }
}
