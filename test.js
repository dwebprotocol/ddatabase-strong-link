const tape = require('tape')
const { verify, generate } = require('./')
const ram = require('random-access-memory')
const ddatabase = require('ddatabase')

tape('basic', function (t) {
  t.plan(1 + 2 + 1 + 2 + 1)

  const feed = ddatabase(ram)
  const otherFeed = ddatabase(ram)
  const badFeed = ddatabase(ram)

  badFeed.append(['a', 'a', 'c'], function () {
    otherFeed.append(['a', 'b', 'c'], function () {
      feed.append(['a', 'b', 'c'], function () {
        generate(feed, 2, function (err, link) {
          t.error(err, 'no error')
          verify(feed, link, function (err, data) {
            t.error(err, 'no error')
            t.same(data, Buffer.from('c'))
          })
          verify(otherFeed, link, function (err) {
            t.ok(err, 'should error')
          })
          const otherLink = { feed: otherFeed.key, seq: link.seq, treeHash: link.treeHash }
          verify(otherFeed, otherLink, function (err, data) {
            t.error(err, 'no error')
            t.same(data, Buffer.from('c'))
          })
          const badLink = { feed: badFeed.key, seq: link.seq, treeHash: link.treeHash }
          verify(badFeed, badLink, function (err) {
            t.ok(err, 'had error')
          })
        })
      })
    })
  })
})
