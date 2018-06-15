export class Subject {
  private subscriptions: Function[] = []
  private completed: boolean = false

  private unsubscribe: Function = (callback: Function): Function => (): void => {
    let index: number = this.subscriptions.length
    while (index--) {
      if (callback === this.subscriptions[index]) {
        this.subscriptions.splice(index, 1)
        return
      }
    }
  }

  numberOfSubscriptions (): number {
    return this.subscriptions.length
  }

  complete (): void {
    this.completed = true
    this.subscriptions.length = 0
  }

  next (value?: any): void {
    if (this.completed) {
      return
    }
    this.subscriptions.forEach((subscription: Function) => {
      subscription(value)
    })
  }
  
  subscribe (callback: Function): Function {
    if (this.completed) {
      return
    }
    this.subscriptions.push(callback)
    return this.unsubscribe(callback)
  }
}
