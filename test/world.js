let assert = require('power-assert')

let flattenOne = function (arr) {
  return arr.reduce((result, vals) => {
    return result.concat(vals)
  }, [])
}

let neighbourCoords = function (coords) {
  let front = coords.slice(0,-1)
  let last = coords.slice(-1)[0]

  let permuteLast = [ [last - 1], [last], [last + 1] ]

  if (!front.length) {
    return permuteLast
  } else {
    let permuteFront = neighbourCoords(front)

    return flattenOne(permuteLast.map((n) => {
      return permuteFront.map((front) => {
        return front.concat(n)
      })
    }))
  }
}

let coords = {
  format(...parts) {
    return parts.join(',')
  },
  parse(coord) {
    return coord.split(',').map(n => parseInt(n))
  }
}

let world = function (arr) {
  if (arr.length === 0) {
    return {}
  }

  if (!Array.isArray(arr[0])) {
    let w = {}

    arr.forEach((val, idx) => {
      if (val !== 0) {
        w[coords.format(idx)] = val
      }
    })

    return w
  }

  if (!Array.isArray(arr[0][0])) {
    let w = {}

    arr.forEach((row, idxY) => {
      row.forEach((val, idxX) => {
        if (val !== 0) {
          w[coords.format(idxX, idxY)] = val
        }
      })
    })

    return w
  }
}

let propagate = function (w) {
  let result = world([])

  Object.keys(w).forEach((key, val) => {
    let c = coords.parse(key)

    neighbourCoords(c)
      .map(coord => coords.format(coord))
      .forEach((newCoord) => {
        if (newCoord !== key) {
          result[newCoord] = result[newCoord] || 0
          result[newCoord]++
        }
      })
  })

  return result
}

let tick = function (w) {
  let neighbours = propagate(w)
  let result = world([])

  Object.keys(neighbours).forEach((coords) => {
    if (neighbours[coords] === 3) {
      result[coords] = 1
    }
    if (neighbours[coords] === 2 && w[coords] === 1) {
      result[coords] = 1
    }
  })

  return result
}

describe('world', () => {
  it('creates empty worlds', () => {
    assert.deepEqual(world([]), {})
  })

  it('creates 1d worlds with just one thing', () => {
    assert.deepEqual(world([1]), {'0': 1})
  })

  it('creates 1d with multiple things', () => {
    assert.deepEqual(world([0, 1, 1, 0, 1]), {'1': 1, '2': 1, '4': 1})
  })

  it('creates 2d with multiple things', () => {
    assert.deepEqual(world([
      [0, 1],
      [1, 0]
    ]), { '0,1': 1, '1,0': 1 })
  })
})

describe('neighbourCoords', () => {
  it('find neighbourCoords in 1d', () => {
    assert.deepEqual(neighbourCoords([3]), [[2], [3], [4]])
  })

  it('find neighbourCoords in 2d', () => {
    assert.deepEqual(neighbourCoords([3,4]), [
      [2,3], [3,3], [4,3],
      [2,4], [3,4], [4,4],
      [2,5], [3,5], [4,5]
    ])
  })
})

describe('propagate neighbours', () => {
  it('is an empty world if empty world passed', () => {
    assert.deepEqual(propagate(world([])), world([]))
  })

  it('propagates neighbours in a 1d world', () => {
    assert.deepEqual(propagate(world([0,1,0])), world([1,0,1]))
  })

  it('propagates overlapping neighbours in a 1d world', () => {
    assert.deepEqual(propagate(world([0,1,1,1,0])), world([1,1,2,1,1]))
  })

  it('propagates neighbours in a simple 2d world', () => {
    let startWorld = [
      [0,0,0],
      [0,1,0],
      [0,0,0]
    ]

    let expected = [
      [1,1,1],
      [1,0,1],
      [1,1,1]
    ]

    assert.deepEqual(propagate(world(startWorld)), world(expected))
  })

  it('propagates neighbours in a 2d world', () => {
    let startWorld = [
      [0,0,0,0,0],
      [0,0,1,0,0],
      [0,1,0,1,0],
      [0,0,0,0,0]
    ]

    let expected = [
      [0,1,1,1,0],
      [1,2,2,2,1],
      [1,1,3,1,1],
      [1,1,2,1,1]
    ]

    assert.deepEqual(propagate(world(startWorld)), world(expected))
  })
})

describe('stepping the world', () => {
  it('steps a 2d world', () => {
    let startWorld = [
      [0,0,0,0,0],
      [0,1,0,0,0],
      [0,1,0,0,0],
      [0,1,0,0,1],
    ]
    let expected = [
      [0,0,0,0],
      [0,0,0,0],
      [1,1,1,0],
      [0,0,0,0],
    ]
    assert.deepEqual(tick(world(startWorld)), world(expected))
  })

  it('should glide', () => {
    let startWorld = [
      [0,0,0,0,0],
      [0,0,1,0,0],
      [0,0,0,1,0],
      [0,1,1,1,0],
    ]
    let expected = [
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,1,0,1,0],
      [0,0,1,1,0],
      [0,0,1,0,0],
    ]
    assert.deepEqual(tick(world(startWorld)), world(expected))
  })
})

