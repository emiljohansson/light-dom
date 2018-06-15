import { Subject } from './subject.js'

const subjects: any = {}

// export const destroy = vm => {
//   if (subjects[vm.$id]) {
//     const destroySubject = subjects[vm.$id]['$destroy']
//     if (destroySubject) {
//       destroySubject.next()
//     }
//     forEach(subjects[vm.$id], (subject, key) => {
//       subject.complete()
//     })
//   }
//   delete subjects[vm.$id]
// }

export default (vm: any, key: string): Subject => {
  // const id = typeof vm === 'string'
  //   ? vm
  //   : vm.$id
  const id: string = vm.$id
  const scope: any = subjects[id] = subjects[id] || {}
  scope[key] = scope[key] || new Subject()
  return scope[key]
}
