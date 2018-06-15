import { LightElement } from './light-element.js'

const customElementList: string[] = []

export const defineElement: Function = (name: string, constructor: Function): void => {
  customElementList.push(name)
  customElements.define(name, constructor)
}

export const getDefinedElements: Function = (): string[] => customElementList

export default (selector: string): void => {
  const app: LightElement = document.body.querySelector(selector)
  app.$updateDom()
}
